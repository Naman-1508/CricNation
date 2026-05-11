import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  // ── Search users by name (for player autocomplete when adding to team)
  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      if (input.query.length < 2) return [];
      return ctx.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { email: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, image: true, email: true },
        take: 8,
      });
    }),

  // ── Get own profile (me endpoint)
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, name: true, image: true, email: true, city: true, role: true, createdAt: true },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
    return user;
  }),

  // ── Update own profile
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(60).optional(),
      city: z.string().max(50).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.city !== undefined ? { city: input.city } : {}),
        },
        select: { id: true, name: true, image: true, email: true, city: true },
      });
    }),
});
