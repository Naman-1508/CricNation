import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const teamRouter = router({
  // ── Create a team, auto-add creator as CAPTAIN ──────────────
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(3).max(40),
      shortName: z.string().min(1).max(5),
      colorHex: z.string().default('#10b981'),
      homeGround: z.string().optional(),
      city: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const team = await ctx.prisma.team.create({
        data: {
          name: input.name,
          shortName: input.shortName.toUpperCase(),
          colorHex: input.colorHex,
          homeGround: input.homeGround,
          city: input.city,
          createdById: userId,
          members: {
            create: {
              userId,
              name: ctx.session.user.name ?? 'Captain',
              role: 'CAPTAIN',
            },
          },
        },
        include: { members: true },
      });

      return team;
    }),

  // ── Add a member by phone (links if user exists) ─────────────
  addMember: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      name: z.string().min(1),
      phone: z.string().optional(),
      role: z.enum(['PLAYER', 'VICE_CAPTAIN', 'CAPTAIN']).default('PLAYER'),
      jerseyNo: z.number().int().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify caller is captain
      const membership = await ctx.prisma.teamMember.findFirst({
        where: { teamId: input.teamId, userId: ctx.session.user.id, role: 'CAPTAIN' },
      });
      if (!membership) throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the captain can add members' });

      // Try to find existing user by phone
      let linkedUserId: string | undefined;
      if (input.phone) {
        const existing = await ctx.prisma.user.findUnique({ where: { phone: input.phone } });
        if (existing) linkedUserId = existing.id;
      }

      const member = await ctx.prisma.teamMember.create({
        data: {
          teamId: input.teamId,
          userId: linkedUserId ?? null,
          phone: input.phone,
          name: input.name,
          role: input.role as any,
          jerseyNo: input.jerseyNo,
        },
      });

      return member;
    }),

  // ── List teams the current user belongs to ───────────────────
  getMyTeams: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.prisma.teamMember.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        team: {
          include: {
            members: true,
            homeMatches: { where: { status: 'COMPLETED' }, orderBy: { startTime: 'desc' }, take: 1 },
            awayMatches: { where: { status: 'COMPLETED' }, orderBy: { startTime: 'desc' }, take: 1 },
          },
        },
      },
    });

    return memberships.map(m => ({
      ...m.team,
      myRole: m.role,
      memberCount: m.team.members.length,
    }));
  }),

  // ── Get a single team with all members ───────────────────────
  getTeam: publicProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ input, ctx }) => {
      const team = await ctx.prisma.team.findUnique({
        where: { id: input.teamId },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, image: true, phone: true } } },
            orderBy: { role: 'asc' },
          },
          createdBy: { select: { id: true, name: true } },
          homeMatches: {
            where: { status: 'COMPLETED' },
            orderBy: { startTime: 'desc' },
            take: 5,
            include: {
              awayTeam: { select: { name: true, shortName: true, colorHex: true } },
            },
          },
          awayMatches: {
            where: { status: 'COMPLETED' },
            orderBy: { startTime: 'desc' },
            take: 5,
            include: {
              homeTeam: { select: { name: true, shortName: true, colorHex: true } },
            },
          },
        },
      });

      if (!team) throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' });
      return team;
    }),

  // ── Update member role / jersey ───────────────────────────────
  updateMember: protectedProcedure
    .input(z.object({
      memberId: z.string(),
      role: z.enum(['PLAYER', 'VICE_CAPTAIN', 'CAPTAIN']).optional(),
      jerseyNo: z.number().int().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const member = await ctx.prisma.teamMember.findUnique({ where: { id: input.memberId } });
      if (!member) throw new TRPCError({ code: 'NOT_FOUND' });

      const captain = await ctx.prisma.teamMember.findFirst({
        where: { teamId: member.teamId, userId: ctx.session.user.id, role: 'CAPTAIN' },
      });
      if (!captain) throw new TRPCError({ code: 'FORBIDDEN' });

      return ctx.prisma.teamMember.update({
        where: { id: input.memberId },
        data: {
          ...(input.role ? { role: input.role as any } : {}),
          ...(input.jerseyNo !== undefined ? { jerseyNo: input.jerseyNo } : {}),
        },
      });
    }),

  // ── Remove member ─────────────────────────────────────────────
  removeMember: protectedProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const member = await ctx.prisma.teamMember.findUnique({ where: { id: input.memberId } });
      if (!member) throw new TRPCError({ code: 'NOT_FOUND' });

      const captain = await ctx.prisma.teamMember.findFirst({
        where: { teamId: member.teamId, userId: ctx.session.user.id, role: 'CAPTAIN' },
      });
      if (!captain) throw new TRPCError({ code: 'FORBIDDEN' });
      if (member.userId === ctx.session.user.id) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Captain cannot remove themselves' });

      return ctx.prisma.teamMember.delete({ where: { id: input.memberId } });
    }),

  // ── Search teams by name ───────────────────────────────────────
  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.team.findMany({
        where: { name: { contains: input.query, mode: 'insensitive' } },
        include: { members: { select: { id: true } } },
        take: 10,
      });
    }),
});
