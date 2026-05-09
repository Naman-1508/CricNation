import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const playerRouter = router({
  getStats: publicProcedure
    .input(z.object({
      playerId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      // Aggregate stats from Scorecard table
      // return ctx.prisma.scorecard.aggregate({ ... })
      return { runs: 452, matches: 12, wickets: 14 };
    }),

  getFeed: publicProcedure
    .query(async ({ ctx }) => {
      // return ctx.prisma.feedPost.findMany({ include: { user: true } });
      return [];
    })
});
