import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { pusherServer } from '../pusher';

// Helper: compute batter stats from a set of balls for a given batsmanId
function batterStats(balls: any[], batsmanId: string) {
  const myBalls = balls.filter(b => b.batsmanId === batsmanId && !b.isWide && !b.isNoBall);
  const runs = myBalls.reduce((s: number, b: any) => s + b.runs, 0);
  const ballsFaced = myBalls.length;
  const fours = myBalls.filter((b: any) => b.runs === 4).length;
  const sixes = myBalls.filter((b: any) => b.runs === 6).length;
  const isOut = balls.some(b => b.batsmanId === batsmanId && b.isWicket && b.dismissalType !== 'RUN_OUT');
  const dismissalType = balls.find(b => b.batsmanId === batsmanId && b.isWicket)?.dismissalType ?? null;
  const sr = ballsFaced > 0 ? +((runs / ballsFaced) * 100).toFixed(1) : 0;
  return { runs, ballsFaced, fours, sixes, isOut, dismissalType, sr };
}

// Helper: compute bowler stats from a set of balls for a given bowlerId
function bowlerStats(balls: any[], bowlerId: string) {
  const allBalls = balls.filter(b => b.bowlerId === bowlerId);
  const legalBalls = allBalls.filter(b => !b.isWide && !b.isNoBall).length;
  const runs = allBalls.reduce((s: number, b: any) => {
    let r = b.runs;
    if (b.isWide || b.isNoBall) r += 1;
    return s + r;
  }, 0);
  const wickets = allBalls.filter((b: any) => b.isWicket && b.dismissalType !== 'RUN_OUT').length;
  const overs = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
  const economy = legalBalls > 0 ? +((runs / legalBalls) * 6).toFixed(2) : 0;
  return { legalBalls, runs, wickets, overs, economy };
}

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
              balls: { where: { deletedAt: null }, orderBy: { timestamp: 'asc' } }
            }
          }
        }
      });
      if (!match) throw new Error("Match not found");

      const currentInnings = match.innings[0];
      const balls = currentInnings?.balls || [];
      const totalRuns = currentInnings?.totalRuns || 0;
      const totalWickets = currentInnings?.totalWickets || 0;
      const validBalls = balls.filter((b: any) => !b.isWide && !b.isNoBall).length;

      const battingTeamId = currentInnings?.teamId;
      const bowlingTeamId = battingTeamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;

      const battingPlayers = match.matchPlayers.filter((p: any) => p.teamId === battingTeamId);
      const bowlingPlayers = match.matchPlayers.filter((p: any) => p.teamId === bowlingTeamId);

      // Identify striker: last batsman in the balls who hasn't been dismissed
      const dismissedIds = new Set(balls.filter((b: any) => b.isWicket).map((b: any) => b.batsmanId));
      const activeBatsmen = battingPlayers.filter((p: any) => !dismissedIds.has(p.id));
      const striker = activeBatsmen[0] ?? battingPlayers[0];
      const nonStriker = activeBatsmen[1] ?? battingPlayers[1];

      // Current bowler: bowler of the most recent ball
      const lastBall = balls[balls.length - 1];
      const currentBowlerId = lastBall?.bowlerId;
      const bowler = currentBowlerId
        ? bowlingPlayers.find((p: any) => p.id === currentBowlerId) ?? bowlingPlayers[0]
        : bowlingPlayers[0];

      // Compute live stats
      const strikerStats = striker ? batterStats(balls, striker.id) : { runs: 0, ballsFaced: 0 };
      const nonStrikerStats = nonStriker ? batterStats(balls, nonStriker.id) : { runs: 0, ballsFaced: 0 };
      const bowlerStat = bowler ? bowlerStats(balls, bowler.id) : { wickets: 0, runs: 0, overs: '0.0' };

      // Build current over balls (last completed over-boundary to now)
      const legalCount = validBalls;
      const ballsInCurrentOver = legalCount % 6;
      const currentOverBalls = balls.slice(-(ballsInCurrentOver || 6));

      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        status: match.status,
        overs: match.overs,
        ballType: match.ballType,
        groundName: match.groundName,
        score: { runs: totalRuns, wickets: totalWickets, balls: validBalls },
        inningsId: currentInnings?.id,
        battingTeamId,
        target: null,
        striker: { name: striker?.name || "Batter 1", runs: strikerStats.runs, balls: strikerStats.ballsFaced, id: striker?.id || "b1" },
        nonStriker: { name: nonStriker?.name || "Batter 2", runs: nonStrikerStats.runs, balls: nonStrikerStats.ballsFaced, id: nonStriker?.id || "b2" },
        bowler: { name: bowler?.name || "Bowler", wickets: bowlerStat.wickets, runs: bowlerStat.runs, overs: bowlerStat.overs, id: bowler?.id || "bw1" },
        currentOver: currentOverBalls.map((b: any) => b.isWicket ? 'W' : (b.isWide ? 'wd' : (b.isNoBall ? 'nb' : b.runs.toString())))
      };
    }),

  // Full scorecard for both innings
  getScorecard: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const match = await ctx.prisma.match.findUnique({
        where: { id: input.id },
        include: {
          homeTeam: { select: { id: true, name: true, shortName: true, colorHex: true } },
          awayTeam: { select: { id: true, name: true, shortName: true, colorHex: true } },
          matchPlayers: true,
          innings: {
            orderBy: { inningsNumber: 'asc' },
            include: {
              balls: { where: { deletedAt: null }, orderBy: { timestamp: 'asc' } }
            }
          }
        }
      });
      if (!match) throw new Error("Match not found");

      return match.innings.map((innings: any) => {
        const balls: any[] = innings.balls;
        const battingTeamId = innings.teamId;
        const battingTeam = match.homeTeam.id === battingTeamId ? match.homeTeam : match.awayTeam;
        const bowlingTeam = match.homeTeam.id === battingTeamId ? match.awayTeam : match.homeTeam;

        const battingPlayers = match.matchPlayers.filter((p: any) => p.teamId === battingTeamId);
        const bowlingPlayers = match.matchPlayers.filter((p: any) => p.teamId !== battingTeamId);

        // Batting scorecard
        const batting = battingPlayers.map((p: any) => {
          const stats = batterStats(balls, p.id);
          const hadBalls = stats.ballsFaced > 0 || stats.runs > 0;
          return { id: p.id, name: p.name, ...stats, didBat: hadBalls };
        }).filter((p: any) => p.didBat);

        // Bowling scorecard
        const bowling = bowlingPlayers.map((p: any) => {
          const stats = bowlerStats(balls, p.id);
          return { id: p.id, name: p.name, ...stats, didBowl: stats.legalBalls > 0 };
        }).filter((p: any) => p.didBowl);

        // Over-by-over summary
        const maxOver = Math.max(...balls.filter((b: any) => !b.isWide && !b.isNoBall).map((b: any) => b.overNumber), -1);
        const overSummary = Array.from({ length: maxOver + 1 }, (_, ov) => {
          const ovBalls = balls.filter((b: any) => b.overNumber === ov);
          const runs = ovBalls.reduce((s: number, b: any) => {
            let r = b.runs;
            if (b.isWide || b.isNoBall) r += 1;
            return s + r;
          }, 0);
          const wkts = ovBalls.filter((b: any) => b.isWicket).length;
          const display = ovBalls.map((b: any) => b.isWicket ? 'W' : (b.isWide ? 'Wd' : (b.isNoBall ? 'Nb' : b.runs.toString())));
          return { over: ov + 1, runs, wkts, display };
        });

        return {
          inningsNumber: innings.inningsNumber,
          battingTeam,
          bowlingTeam,
          totalRuns: innings.totalRuns,
          totalWickets: innings.totalWickets,
          batting,
          bowling,
          overSummary,
        };
      });
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
      // Load actual team members to use as match players
      const [homeMembers, awayMembers] = await Promise.all([
        ctx.prisma.teamMember.findMany({ where: { teamId: input.homeTeamId }, take: 11 }),
        ctx.prisma.teamMember.findMany({ where: { teamId: input.awayTeamId }, take: 11 }),
      ]);

      const battingTeamId = input.tossDecision === "BAT"
        ? input.tossWinnerId
        : (input.tossWinnerId === input.homeTeamId ? input.awayTeamId : input.homeTeamId);

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
          innings: {
            create: { teamId: battingTeamId, inningsNumber: 1 }
          },
          matchPlayers: {
            create: [
              ...homeMembers.map(m => ({
                teamId: input.homeTeamId,
                name: m.name,
                userId: m.userId ?? undefined,
                isPlaying: true,
              })),
              ...awayMembers.map(m => ({
                teamId: input.awayTeamId,
                name: m.name,
                userId: m.userId ?? undefined,
                isPlaying: true,
              })),
              // Fallback if teams have no members yet
              ...(homeMembers.length === 0 ? [
                { teamId: input.homeTeamId, name: "Home Batter 1", isPlaying: true },
                { teamId: input.homeTeamId, name: "Home Batter 2", isPlaying: true },
                { teamId: input.homeTeamId, name: "Home Bowler 1", isPlaying: true },
              ] : []),
              ...(awayMembers.length === 0 ? [
                { teamId: input.awayTeamId, name: "Away Batter 1", isPlaying: true },
                { teamId: input.awayTeamId, name: "Away Batter 2", isPlaying: true },
                { teamId: input.awayTeamId, name: "Away Bowler 1", isPlaying: true },
              ] : []),
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
      const prevBalls = await ctx.prisma.ballByBall.count({
        where: { inningsId: input.inningsId, isWide: false, isNoBall: false, deletedAt: null }
      });

      const overNumber = Math.floor(prevBalls / 6);
      const ballNumber = (prevBalls % 6) + 1;

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

      let totalRunsToAdd = input.runs;
      if (input.isWide || input.isNoBall) totalRunsToAdd += 1;

      await ctx.prisma.innings.update({
        where: { id: input.inningsId },
        data: {
          totalRuns: { increment: totalRunsToAdd },
          totalWickets: { increment: input.isWicket ? 1 : 0 },
        }
      });

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
    }),

  // Soft-delete the last ball (undo)
  undoLastBall: protectedProcedure
    .input(z.object({ inningsId: z.string(), matchId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const lastBall = await ctx.prisma.ballByBall.findFirst({
        where: { inningsId: input.inningsId, deletedAt: null },
        orderBy: { timestamp: 'desc' },
      });
      if (!lastBall) return { success: false };

      let runsToDeduct = lastBall.runs;
      if (lastBall.isWide || lastBall.isNoBall) runsToDeduct += 1;

      await ctx.prisma.ballByBall.update({
        where: { id: lastBall.id },
        data: { deletedAt: new Date() }
      });

      await ctx.prisma.innings.update({
        where: { id: input.inningsId },
        data: {
          totalRuns: { decrement: runsToDeduct },
          totalWickets: { decrement: lastBall.isWicket ? 1 : 0 },
        }
      });

      await pusherServer.trigger(`match-${input.matchId}`, 'score-update', { undo: true }).catch(() => {});
      return { success: true };
    }),
});
