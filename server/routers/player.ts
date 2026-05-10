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
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          teamMemberships: {
            include: { team: { select: { id: true, name: true, shortName: true, colorHex: true } } },
          },
          awards: true,
        },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      // Batting: aggregate from BallByBall where batsmanId matches a MatchPlayer linked to this user
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
      const average = dismissals > 0 ? +(totalRuns / dismissals).toFixed(1) : totalRuns > 0 ? totalRuns : 0;

      // Unique innings
      const inningsSet = new Set(battingBalls.map(b => b.inningsId));
      const uniqueInnings = inningsSet.size;

      // Bowling
      const bowlingBalls = await ctx.prisma.ballByBall.findMany({
        where: {
          bowler: { userId: input.userId },
          deletedAt: null,
          isWide: false,
          isNoBall: false,
        },
        select: { runs: true, isWicket: true, dismissalType: true },
      });

      const wickets = bowlingBalls.filter(b => b.isWicket && b.dismissalType !== 'RUN_OUT').length;
      const runsConceded = bowlingBalls.reduce((s, b) => s + b.runs, 0);
      const legalBallsBowled = bowlingBalls.length;
      const economy = legalBallsBowled > 0 ? +((runsConceded / legalBallsBowled) * 6).toFixed(2) : 0;
      const bowlingAvg = wickets > 0 ? +(runsConceded / wickets).toFixed(1) : null;

      // Recent matches (via MatchPlayer)
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
          matches: uniqueInnings,
          innings: uniqueInnings,
          runs: totalRuns,
          balls: totalBalls,
          fours,
          sixes,
          strikeRate,
          average,
          dismissals,
        },
        bowling: {
          wickets,
          runsConceded,
          legalBalls: legalBallsBowled,
          economy,
          average: bowlingAvg,
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
