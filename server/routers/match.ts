import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { pusherServer } from '../pusher';

// ── Helpers ────────────────────────────────────────────────────────────────

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

// ── Push a notification to a user (DB + Pusher) ────────────────────────────
async function pushNotification(
  prisma: any,
  userId: string,
  title: string,
  message: string,
  type: string,
) {
  try {
    await prisma.notification.create({ data: { userId, title, message, type } });
    await pusherServer.trigger(`user-${userId}`, 'notification', { title, message, type }).catch(() => {});
  } catch {
    // Never let notification errors break the main flow
  }
}

// ── Router ─────────────────────────────────────────────────────────────────

export const matchRouter = router({

  // ─── Get live match state ─────────────────────────────────────────────────
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
      if (!match) throw new Error('Match not found');

      const currentInnings = match.innings[0];
      const balls = currentInnings?.balls || [];
      const totalRuns = currentInnings?.totalRuns || 0;
      const totalWickets = currentInnings?.totalWickets || 0;
      const validBalls = balls.filter((b: any) => !b.isWide && !b.isNoBall).length;

      const battingTeamId = currentInnings?.teamId;
      const bowlingTeamId = battingTeamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;

      const battingPlayers = match.matchPlayers.filter((p: any) => p.teamId === battingTeamId);
      const bowlingPlayers = match.matchPlayers.filter((p: any) => p.teamId === bowlingTeamId);

      const dismissedIds = new Set(
        balls.filter((b: any) => b.isWicket && b.dismissalType !== 'RUN_OUT').map((b: any) => b.batsmanId)
      );

      const battedOrder: string[] = [];
      for (const b of balls) {
        if (!battedOrder.includes(b.batsmanId)) battedOrder.push(b.batsmanId);
      }
      const notYetBatted = battingPlayers.filter(p => !battedOrder.includes(p.id));

      const lastBall = balls[balls.length - 1];
      let strikerId: string | null = lastBall?.batsmanId ?? null;
      if (strikerId && dismissedIds.has(strikerId)) strikerId = null;

      const activeBatsmanIds = battedOrder.filter(id => !dismissedIds.has(id));
      const nonStrikerId = activeBatsmanIds.find(id => id !== strikerId) ?? null;

      const striker = strikerId ? battingPlayers.find(p => p.id === strikerId) : battingPlayers[0];
      const nonStriker = nonStrikerId ? battingPlayers.find(p => p.id === nonStrikerId) : battingPlayers[1];

      const currentBowlerId = lastBall?.bowlerId ?? null;
      const bowler = currentBowlerId
        ? bowlingPlayers.find((p: any) => p.id === currentBowlerId) ?? bowlingPlayers[0]
        : bowlingPlayers[0];

      const strikerStat = striker ? batterStats(balls, striker.id) : { runs: 0, ballsFaced: 0 };
      const nonStrikerStat = nonStriker ? batterStats(balls, nonStriker.id) : { runs: 0, ballsFaced: 0 };
      const bowlerStat = bowler ? bowlerStats(balls, bowler.id) : { wickets: 0, runs: 0, overs: '0.0' };

      const legalCount = validBalls;
      const ballsInCurrentOver = legalCount % 6;
      const currentOverBalls = ballsInCurrentOver > 0 ? balls.slice(-ballsInCurrentOver) : [];

      let target: number | null = null;
      if (currentInnings && currentInnings.inningsNumber === 2) {
        const firstInnings = await ctx.prisma.innings.findFirst({
          where: { matchId: input.id, inningsNumber: 1 },
          select: { totalRuns: true }
        });
        target = firstInnings ? firstInnings.totalRuns + 1 : null;
      }

      // Shot data for wagon wheel (last 30 balls)
      const shotData = balls
        .filter((b: any) => b.fieldAngle !== null && b.fieldAngle !== undefined)
        .slice(-30)
        .map((b: any) => ({ runs: b.runs, fieldAngle: b.fieldAngle, shotType: b.shotType }));

      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        status: match.status,
        result: match.result,
        overs: match.overs,
        ballType: match.ballType,
        groundName: match.groundName,
        createdById: match.createdById,
        score: { runs: totalRuns, wickets: totalWickets, balls: validBalls },
        inningsId: currentInnings?.id ?? null,
        inningsNumber: currentInnings?.inningsNumber ?? 1,
        isInningsComplete: currentInnings?.isCompleted ?? false,
        battingTeamId,
        bowlingTeamId,
        target,
        striker: striker
          ? { name: striker.name, runs: strikerStat.runs, balls: (strikerStat as any).ballsFaced, id: striker.id }
          : { name: 'Batter 1', runs: 0, balls: 0, id: '' },
        nonStriker: nonStriker
          ? { name: nonStriker.name, runs: nonStrikerStat.runs, balls: (nonStrikerStat as any).ballsFaced, id: nonStriker.id }
          : { name: 'Batter 2', runs: 0, balls: 0, id: '' },
        bowler: bowler
          ? { name: bowler.name, wickets: bowlerStat.wickets, runs: bowlerStat.runs, overs: bowlerStat.overs, id: bowler.id }
          : { name: 'Bowler', wickets: 0, runs: 0, overs: '0.0', id: '' },
        currentOver: currentOverBalls.map((b: any) =>
          b.isWicket ? 'W' : (b.isWide ? 'wd' : (b.isNoBall ? 'nb' : b.runs.toString()))
        ),
        battingPlayers: battingPlayers.map(p => ({ id: p.id, name: p.name })),
        bowlingPlayers: bowlingPlayers.map(p => ({ id: p.id, name: p.name })),
        notYetBatted: notYetBatted.map(p => ({ id: p.id, name: p.name })),
        dismissedIds: Array.from(dismissedIds),
        ballsInCurrentOver,
        shotData,
      };
    }),

  // ─── Full scorecard ───────────────────────────────────────────────────────
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
            include: { balls: { where: { deletedAt: null }, orderBy: { timestamp: 'asc' } } }
          }
        }
      });
      if (!match) throw new Error('Match not found');

      return match.innings.map((innings: any) => {
        const balls: any[] = innings.balls;
        const battingTeamId = innings.teamId;
        const battingTeam = match.homeTeam.id === battingTeamId ? match.homeTeam : match.awayTeam;
        const bowlingTeam = match.homeTeam.id === battingTeamId ? match.awayTeam : match.homeTeam;
        const battingPlayers = match.matchPlayers.filter((p: any) => p.teamId === battingTeamId);
        const bowlingPlayers = match.matchPlayers.filter((p: any) => p.teamId !== battingTeamId);

        const batting = battingPlayers.map((p: any) => {
          const stats = batterStats(balls, p.id);
          const shots = balls.filter(b => b.batsmanId === p.id && b.fieldAngle != null)
            .map(b => ({ runs: b.runs, fieldAngle: b.fieldAngle, shotType: b.shotType }));
          return { id: p.id, name: p.name, ...stats, shots };
        }).filter((p: any) => p.ballsFaced > 0 || p.runs > 0);

        const bowling = bowlingPlayers.map((p: any) => {
          const stats = bowlerStats(balls, p.id);
          return { id: p.id, name: p.name, ...stats, didBowl: stats.legalBalls > 0 };
        }).filter((p: any) => p.didBowl);

        const maxOver = Math.max(...balls.filter((b: any) => !b.isWide && !b.isNoBall).map((b: any) => b.overNumber), -1);
        const overSummary = Array.from({ length: maxOver + 1 }, (_, ov) => {
          const ovBalls = balls.filter((b: any) => b.overNumber === ov);
          const runs = ovBalls.reduce((s: number, b: any) => {
            let r = b.runs;
            if (b.isWide || b.isNoBall) r += 1;
            return s + r;
          }, 0);
          const wkts = ovBalls.filter((b: any) => b.isWicket).length;
          const display = ovBalls.map((b: any) =>
            b.isWicket ? 'W' : (b.isWide ? 'Wd' : (b.isNoBall ? 'Nb' : b.runs.toString()))
          );
          return { over: ov + 1, runs, wkts, display };
        });

        return { inningsNumber: innings.inningsNumber, battingTeam, bowlingTeam, totalRuns: innings.totalRuns, totalWickets: innings.totalWickets, batting, bowling, overSummary };
      });
    }),

  // ─── Create match with selected Playing XI ────────────────────────────────
  create: protectedProcedure
    .input(z.object({
      homeTeamId: z.string(),
      awayTeamId: z.string(),
      tossWinnerId: z.string(),
      tossDecision: z.string(),
      overs: z.number(),
      ballType: z.string(),
      location: z.string().optional(),
      homePlayerIds: z.array(z.string()).min(1),
      awayPlayerIds: z.array(z.string()).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const [homeMembers, awayMembers] = await Promise.all([
        ctx.prisma.teamMember.findMany({ where: { id: { in: input.homePlayerIds }, teamId: input.homeTeamId } }),
        ctx.prisma.teamMember.findMany({ where: { id: { in: input.awayPlayerIds }, teamId: input.awayTeamId } }),
      ]);

      const battingTeamId = input.tossDecision === 'BAT'
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
          status: 'LIVE',
          createdById: ctx.session.user.id,
          innings: { create: { teamId: battingTeamId, inningsNumber: 1 } },
          matchPlayers: {
            create: [
              ...homeMembers.map(m => ({ teamId: input.homeTeamId, name: m.name, userId: m.userId ?? undefined, jerseyNo: m.jerseyNo ?? undefined, isPlaying: true })),
              ...awayMembers.map(m => ({ teamId: input.awayTeamId, name: m.name, userId: m.userId ?? undefined, jerseyNo: m.jerseyNo ?? undefined, isPlaying: true })),
            ]
          }
        }
      });
      return match;
    }),

  // ─── Record a ball ────────────────────────────────────────────────────────
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
          overNumber, ballNumber,
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

      const updatedInnings = await ctx.prisma.innings.update({
        where: { id: input.inningsId },
        data: {
          totalRuns: { increment: totalRunsToAdd },
          totalWickets: { increment: input.isWicket ? 1 : 0 },
        }
      });

      // ── Notifications ──────────────────────────────────────────────────────
      const match = await ctx.prisma.match.findUnique({
        where: { id: input.matchId },
        select: {
          createdById: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } }
        }
      });

      if (match?.createdById) {
        const uid = match.createdById;
        const scoreStr = `${updatedInnings.totalRuns}/${updatedInnings.totalWickets}`;

        if (input.isWicket) {
          const dismissal = (input.dismissalType ?? 'OUT').replace(/_/g, ' ');
          await pushNotification(ctx.prisma, uid, '🏏 WICKET!',
            `${dismissal} — Score: ${scoreStr}`, 'WICKET');
        }
        if (!input.isWicket && !input.isWide && !input.isNoBall) {
          if (input.runs === 6) {
            await pushNotification(ctx.prisma, uid, '💥 SIX!', `Score: ${scoreStr}`, 'BOUNDARY');
          } else if (input.runs === 4) {
            await pushNotification(ctx.prisma, uid, '🔥 FOUR!', `Score: ${scoreStr}`, 'BOUNDARY');
          }
          // Batting milestone check
          const batterTotal = await ctx.prisma.ballByBall.aggregate({
            where: { inningsId: input.inningsId, batsmanId: input.batsmanId, deletedAt: null, isWide: false, isNoBall: false },
            _sum: { runs: true }
          });
          const totalRuns = batterTotal._sum.runs ?? 0;
          const prevTotal = totalRuns - input.runs;
          if (totalRuns >= 100 && prevTotal < 100) {
            await pushNotification(ctx.prisma, uid, '🌟 CENTURY!', `Batsman reached 100 runs`, 'MILESTONE');
          } else if (totalRuns >= 50 && prevTotal < 50) {
            await pushNotification(ctx.prisma, uid, '⭐ FIFTY!', `Batsman reached 50 runs`, 'MILESTONE');
          }
        }
      }

      const displayStr = input.isWicket ? 'W' : (input.isWide ? 'wd' : (input.isNoBall ? 'nb' : input.runs.toString()));
      await pusherServer.trigger(`match-${input.matchId}`, 'score-update', {
        ball: displayStr, runsAdded: totalRunsToAdd, isWicket: input.isWicket, overNumber, ballNumber
      }).catch(() => {});

      return { success: true, ball, overNumber, ballNumber };
    }),

  // ─── Update shot data for a ball (called after shot picker) ──────────────
  updateBallShot: protectedProcedure
    .input(z.object({
      ballId: z.string(),
      shotType: z.string().optional(),
      fieldAngle: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const ball = await ctx.prisma.ballByBall.update({
        where: { id: input.ballId },
        data: {
          ...(input.shotType !== undefined ? { shotType: input.shotType } : {}),
          ...(input.fieldAngle !== undefined ? { fieldAngle: input.fieldAngle } : {}),
        }
      });
      return { success: true, ball };
    }),

  // ─── Undo last ball ───────────────────────────────────────────────────────
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

      await ctx.prisma.ballByBall.update({ where: { id: lastBall.id }, data: { deletedAt: new Date() } });
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

  // ─── Complete current innings ─────────────────────────────────────────────
  completeInnings: protectedProcedure
    .input(z.object({ inningsId: z.string(), matchId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.innings.update({ where: { id: input.inningsId }, data: { isCompleted: true } });
      await pusherServer.trigger(`match-${input.matchId}`, 'innings-complete', {}).catch(() => {});
      return { success: true };
    }),

  // ─── Start second innings ─────────────────────────────────────────────────
  startSecondInnings: protectedProcedure
    .input(z.object({ matchId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const match = await ctx.prisma.match.findUnique({
        where: { id: input.matchId },
        include: { innings: { orderBy: { inningsNumber: 'asc' } } }
      });
      if (!match) throw new Error('Match not found');
      if (match.innings.length >= 2) throw new Error('Second innings already exists');

      const firstInnings = match.innings[0];
      const battingTeamId = firstInnings.teamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
      const secondInnings = await ctx.prisma.innings.create({
        data: { matchId: input.matchId, teamId: battingTeamId, inningsNumber: 2 }
      });
      await pusherServer.trigger(`match-${input.matchId}`, 'second-innings-started', {}).catch(() => {});
      return secondInnings;
    }),

  // ─── End the match ────────────────────────────────────────────────────────
  endMatch: protectedProcedure
    .input(z.object({ matchId: z.string(), result: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const match = await ctx.prisma.match.update({
        where: { id: input.matchId },
        data: { status: 'COMPLETED', result: input.result },
        include: { homeTeam: true, awayTeam: true }
      });

      // Notify match creator
      if (match.createdById) {
        await pushNotification(ctx.prisma, match.createdById, '🏆 Match Complete!', input.result, 'MATCH_END');
      }

      await pusherServer.trigger(`match-${input.matchId}`, 'match-complete', { result: input.result }).catch(() => {});
      return match;
    }),
});
