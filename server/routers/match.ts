import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { pusherServer } from '../pusher';

export const matchRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const match = await ctx.prisma.match.findUnique({
        where: { id: input.id },
        include: {
          homeTeam: true,
          awayTeam: true,
          matchPlayers: true,
          innings: {
            orderBy: { inningsNumber: 'desc' },
            take: 1,
            include: {
              balls: { orderBy: { timestamp: 'asc' } }
            }
          }
        }
      });
      if (!match) throw new Error("Match not found");

      const currentInnings = match.innings[0];
      
      const battingTeamId = currentInnings?.teamId;
      const bowlingTeamId = battingTeamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;

      const battingPlayers = match.matchPlayers.filter(p => p.teamId === battingTeamId);
      const bowlingPlayers = match.matchPlayers.filter(p => p.teamId === bowlingTeamId);

      const striker = battingPlayers[0];
      const nonStriker = battingPlayers[1];
      const bowler = bowlingPlayers[0];
      
      const balls = currentInnings?.balls || [];
      const totalRuns = currentInnings?.totalRuns || 0;
      const totalWickets = currentInnings?.totalWickets || 0;
      const validBalls = balls.filter(b => !b.isWide && !b.isNoBall).length;

      return { 
        id: match.id, 
        homeTeam: match.homeTeam.name, 
        awayTeam: match.awayTeam.name, 
        status: match.status,
        score: { 
          runs: totalRuns, 
          wickets: totalWickets, 
          balls: validBalls
        },
        inningsId: currentInnings?.id,
        target: null, // to implement
        striker: { name: striker?.name || "Batter 1", runs: 0, balls: 0, id: striker?.id || "b1" },
        nonStriker: { name: nonStriker?.name || "Batter 2", runs: 0, balls: 0, id: nonStriker?.id || "b2" },
        bowler: { name: bowler?.name || "Bowler", wickets: 0, runs: 0, overs: 0, id: bowler?.id || "bw1" },
        currentOver: balls.slice(-6).map(b => b.isWicket ? 'W' : (b.isWide ? 'wd' : (b.isNoBall ? 'nb' : b.runs.toString())))
      };
    }),
    
  create: protectedProcedure
    .input(z.object({
      homeTeamId: z.string(),
      awayTeamId: z.string(),
      tossWinnerId: z.string(),
      tossDecision: z.string(),
      overs: z.number(),
      ballType: z.string(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const match = await ctx.prisma.match.create({
        data: {
          homeTeamId: input.homeTeamId,
          awayTeamId: input.awayTeamId,
          tossWinnerId: input.tossWinnerId,
          tossDecision: input.tossDecision,
          overs: input.overs,
          ballType: input.ballType,
          groundName: input.location,
          status: "LIVE",
          createdById: ctx.session.user.id,
          // Create the first innings immediately
          innings: {
            create: {
              teamId: input.tossDecision === "BAT" ? input.tossWinnerId : (input.tossWinnerId === input.homeTeamId ? input.awayTeamId : input.homeTeamId),
              inningsNumber: 1
            }
          },
          // Create dummy players for testing without a full roster
          matchPlayers: {
            create: [
              { teamId: input.homeTeamId, name: "Home Player 1", isPlaying: true },
              { teamId: input.homeTeamId, name: "Home Player 2", isPlaying: true },
              { teamId: input.awayTeamId, name: "Away Player 1", isPlaying: true },
              { teamId: input.awayTeamId, name: "Away Player 2", isPlaying: true },
            ]
          }
        }
      });
      return match;
    }),
    
  recordBall: protectedProcedure
    .input(z.object({
      matchId: z.string(),
      inningsId: z.string(),
      runs: z.number(),
      isWicket: z.boolean().default(false),
      isWide: z.boolean().default(false),
      isNoBall: z.boolean().default(false),
      isLegBye: z.boolean().default(false),
      isBye: z.boolean().default(false),
      dismissalType: z.string().optional(),
      batsmanId: z.string(),
      bowlerId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Calculate actual over and ball number
      const prevBalls = await ctx.prisma.ballByBall.count({
        where: { inningsId: input.inningsId, isWide: false, isNoBall: false }
      });
      
      const overNumber = Math.floor(prevBalls / 6);
      const ballNumber = (prevBalls % 6) + 1;

      // 2. Create ball record
      const ball = await ctx.prisma.ballByBall.create({
        data: {
          inningsId: input.inningsId,
          overNumber,
          ballNumber,
          batsmanId: input.batsmanId,
          bowlerId: input.bowlerId,
          runs: input.runs,
          isWicket: input.isWicket,
          isWide: input.isWide,
          isNoBall: input.isNoBall,
          isLegBye: input.isLegBye,
          isBye: input.isBye,
          dismissalType: input.dismissalType,
        }
      });

      // 3. Update Innings totals
      let totalRunsToAdd = input.runs;
      if (input.isWide || input.isNoBall) totalRunsToAdd += 1;

      await ctx.prisma.innings.update({
        where: { id: input.inningsId },
        data: {
          totalRuns: { increment: totalRunsToAdd },
          totalWickets: { increment: input.isWicket ? 1 : 0 },
        }
      });

      // 4. Trigger Pusher Event
      const displayStr = input.isWicket ? 'W' : (input.isWide ? 'wd' : (input.isNoBall ? 'nb' : input.runs.toString()));
      try {
        await pusherServer.trigger(`match-${input.matchId}`, 'score-update', {
          ball: displayStr,
          runsAdded: totalRunsToAdd,
          isWicket: input.isWicket
        });
      } catch (err) {
        console.error("Pusher trigger failed:", err);
      }
      
      return { success: true, ball };
    })
});
