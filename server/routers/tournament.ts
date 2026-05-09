import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const tournamentRouter = router({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      // return ctx.prisma.tournament.findMany();
      return [];
    }),
    
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return null;
    }),

  getLeaderboard: publicProcedure
    .query(async () => {
      return [];
    }),
    
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(3),
      format: z.enum(['T10', 'T20', 'ODI', 'TEST']),
      bracketType: z.enum(['LEAGUE_KNOCKOUT', 'ROUND_ROBIN']),
      startDate: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      // return ctx.prisma.tournament.create({ ... })
      return { id: "tourney-123", ...input };
    }),
});
