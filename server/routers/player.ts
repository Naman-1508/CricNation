import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const playerRouter = router({

  getStats: publicProcedure
    .input(z.object({ playerId: z.string() }))
    .query(async ({ input, ctx }) => {
      const sc = await ctx.prisma.scorecard.aggregate({
        where: { playerId: input.playerId },
        _sum: { runs: true, wickets: true, ballsFaced: true, fours: true, sixes: true },
        _count: { id: true },
      });
      return {
        matches: sc._count.id,
        runs: sc._sum.runs ?? 0,
        wickets: sc._sum.wickets ?? 0,
        ballsFaced: sc._sum.ballsFaced ?? 0,
        fours: sc._sum.fours ?? 0,
        sixes: sc._sum.sixes ?? 0,
      };
    }),

  getProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!input.userId || input.userId === 'undefined') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User ID is required' });
      }
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          teamMemberships: {
            include: { team: { select: { id: true, name: true, shortName: true, colorHex: true } } },
          },
          awards: true,
        },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      // ── Batting balls ────────────────────────────────────────────────
      const battingBalls = await ctx.prisma.ballByBall.findMany({
        where: {
          batsman: { userId: input.userId },
          deletedAt: null,
          isWide: false,
          isNoBall: false,
        },
        select: { runs: true, isWicket: true, inningsId: true },
      });

      const totalRuns = battingBalls.reduce((s, b) => s + b.runs, 0);
      const totalBalls = battingBalls.length;
      const dismissals = battingBalls.filter(b => b.isWicket).length;
      const fours = battingBalls.filter(b => b.runs === 4).length;
      const sixes = battingBalls.filter(b => b.runs === 6).length;
      const strikeRate = totalBalls > 0 ? +((totalRuns / totalBalls) * 100).toFixed(1) : 0;
      const average = dismissals > 0 ? +(totalRuns / dismissals).toFixed(2) : totalRuns > 0 ? totalRuns : 0;

      // Unique innings played
      const inningsMap = new Map<string, { runs: number; isOut: boolean }>();
      for (const b of battingBalls) {
        const prev = inningsMap.get(b.inningsId) ?? { runs: 0, isOut: false };
        inningsMap.set(b.inningsId, {
          runs: prev.runs + b.runs,
          isOut: prev.isOut || b.isWicket,
        });
      }
      const uniqueInnings = inningsMap.size;

      // Highest score, 50s, 100s
      const inningsScores = Array.from(inningsMap.values()).map(i => i.runs);
      const highestScore = inningsScores.length > 0 ? Math.max(...inningsScores) : 0;
      const fifties = inningsScores.filter(r => r >= 50 && r < 100).length;
      const hundreds = inningsScores.filter(r => r >= 100).length;

      // ── Bowling balls ────────────────────────────────────────────────
      const bowlingBalls = await ctx.prisma.ballByBall.findMany({
        where: {
          bowler: { userId: input.userId },
          deletedAt: null,
          isWide: false,
          isNoBall: false,
        },
        select: { runs: true, isWicket: true, dismissalType: true, inningsId: true },
      });

      const wickets = bowlingBalls.filter(b => b.isWicket && b.dismissalType !== 'RUN_OUT').length;
      const runsConceded = bowlingBalls.reduce((s, b) => s + b.runs, 0);
      const legalBallsBowled = bowlingBalls.length;
      const economy = legalBallsBowled > 0 ? +((runsConceded / legalBallsBowled) * 6).toFixed(2) : 0;
      const bowlingAvg = wickets > 0 ? +(runsConceded / wickets).toFixed(2) : null;
      const bowlingOvers = `${Math.floor(legalBallsBowled / 6)}.${legalBallsBowled % 6}`;

      // Best bowling per innings (most wickets, then fewest runs)
      const bowlingByInnings = new Map<string, { wickets: number; runs: number }>();
      for (const b of bowlingBalls) {
        const prev = bowlingByInnings.get(b.inningsId) ?? { wickets: 0, runs: 0 };
        bowlingByInnings.set(b.inningsId, {
          wickets: prev.wickets + (b.isWicket && b.dismissalType !== 'RUN_OUT' ? 1 : 0),
          runs: prev.runs + b.runs,
        });
      }
      const bestBowling = Array.from(bowlingByInnings.values())
        .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];
      const bestBowlingStr = bestBowling ? `${bestBowling.wickets}/${bestBowling.runs}` : null;

      // ── Catches: balls where dismissalType=CAUGHT and bowler is someone else ─
      const catches = await ctx.prisma.ballByBall.count({
        where: {
          dismissalType: 'CAUGHT',
          isWicket: true,
          deletedAt: null,
          // fielder would be our userId - but MatchPlayer links to userId
          bowler: { userId: { not: input.userId } }, // they didn't bowl it
          batsman: { userId: { not: input.userId } }, // they didn't bat it
          // We approximate catches as wickets taken where this user was fielder
          // Since we don't have a dedicated fielder field yet, count run-outs attributed to them
        },
      });
      // More accurate: count from BallByBall where dismissedId matches a MatchPlayer of this user
      // For now use the inferred catch count from bowling records
      const catchesTaken = await ctx.prisma.ballByBall.count({
        where: {
          dismissalType: 'CAUGHT',
          isWicket: true,
          deletedAt: null,
          bowler: { userId: input.userId }, // caught & bowled
        },
      });

      // ── Matches played (unique match IDs from MatchPlayer) ───────────
      const matchPlayerRecords = await ctx.prisma.matchPlayer.findMany({
        where: { userId: input.userId },
        select: { matchId: true, match: { select: { id: true, status: true, startTime: true } } },
      });
      const uniqueMatchIds = new Set(matchPlayerRecords.map(m => m.matchId));
      const matchesPlayed = uniqueMatchIds.size;

      // ── Recent matches (via MatchPlayer) ────────────────────────────
      const matchPlayers = await ctx.prisma.matchPlayer.findMany({
        where: { userId: input.userId },
        include: {
          match: {
            include: {
              homeTeam: { select: { name: true, shortName: true, colorHex: true } },
              awayTeam: { select: { name: true, shortName: true, colorHex: true } },
            },
          },
          team: { select: { id: true } },
        },
        orderBy: { match: { startTime: 'desc' } },
        take: 8,
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          image: user.image,
          city: user.city,
          createdAt: user.createdAt,
        },
        teams: user.teamMemberships,
        awards: user.awards,
        batting: {
          matches: matchesPlayed,
          innings: uniqueInnings,
          runs: totalRuns,
          balls: totalBalls,
          fours,
          sixes,
          strikeRate,
          average,
          dismissals,
          highestScore,
          fifties,
          hundreds,
        },
        bowling: {
          wickets,
          runsConceded,
          legalBalls: legalBallsBowled,
          overs: bowlingOvers,
          economy,
          average: bowlingAvg,
          bestBowling: bestBowlingStr,
        },
        fielding: {
          catches: catchesTaken,
        },
        recentMatches: matchPlayers.map(mp => ({
          matchId: mp.matchId,
          teamId: mp.teamId,
          match: mp.match,
          status: mp.match.status,
        })),
      };
    }),

  getFeed: publicProcedure
    .input(z.object({ cursor: z.string().optional() }).optional())
    .query(async ({ ctx }) => {
      const posts = await ctx.prisma.feedPost.findMany({
        include: {
          user: { select: { id: true, name: true, image: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return posts.map(p => ({
        id: p.id,
        content: p.content,
        mediaUrl: p.mediaUrl,
        matchId: p.matchId,
        isAutoPost: p.isAutoPost,
        createdAt: p.createdAt,
        user: p.user,
        likes: p._count.likes,
        comments: p._count.comments,
        time: formatRelativeTime(p.createdAt),
      }));
    }),

  createPost: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(500),
      matchId: z.string().optional(),
      mediaUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.feedPost.create({
        data: {
          userId: ctx.session.user.id,
          content: input.content,
          matchId: input.matchId,
          mediaUrl: input.mediaUrl,
          isAutoPost: false,
        },
      });
    }),

  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.prisma.like.findUnique({
        where: { postId_userId: { postId: input.postId, userId: ctx.session.user.id } },
      });
      if (existing) {
        await ctx.prisma.like.delete({ where: { postId_userId: { postId: input.postId, userId: ctx.session.user.id } } });
        return { liked: false };
      }
      await ctx.prisma.like.create({ data: { postId: input.postId, userId: ctx.session.user.id } });
      return { liked: true };
    }),
});

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
