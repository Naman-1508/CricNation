import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const tournamentRouter = router({

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.tournament.findMany({
      include: {
        organizer: { select: { id: true, name: true } },
        _count: { select: { teams: true, matches: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  getOpenTournaments: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.tournament.findMany({
      where: { registrationOpen: true, status: { not: 'COMPLETED' } },
      include: {
        _count: { select: { registrations: true } },
        organizer: { select: { name: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const t = await ctx.prisma.tournament.findUnique({
        where: { id: input.id },
        include: {
          organizer: { select: { id: true, name: true } },
          registrations: {
            include: { team: { select: { id: true, name: true, shortName: true, colorHex: true } } },
          },
          matches: {
            include: {
              homeTeam: { select: { name: true, shortName: true, colorHex: true } },
              awayTeam: { select: { name: true, shortName: true, colorHex: true } },
            },
            orderBy: { startTime: 'desc' },
            take: 10,
          },
          _count: { select: { registrations: true } },
        },
      });
      if (!t) throw new TRPCError({ code: 'NOT_FOUND' });
      return t;
    }),

  getByShareCode: publicProcedure
    .input(z.object({ shareCode: z.string() }))
    .query(async ({ input, ctx }) => {
      const t = await ctx.prisma.tournament.findUnique({
        where: { shareCode: input.shareCode },
        include: {
          organizer: { select: { name: true } },
          registrations: {
            where: { status: 'APPROVED' },
            include: { team: { select: { name: true, shortName: true, colorHex: true } } },
          },
          _count: { select: { registrations: true } },
        },
      });
      if (!t) throw new TRPCError({ code: 'NOT_FOUND' });
      return t;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(3),
      format: z.enum(['T10', 'T20', 'ODI', 'TEST']),
      bracketType: z.enum(['LEAGUE_KNOCKOUT', 'ROUND_ROBIN']).default('LEAGUE_KNOCKOUT'),
      startDate: z.string(),
      endDate: z.string().optional(),
      maxTeams: z.number().int().default(16),
      entryFee: z.number().int().default(0),
      registrationDeadline: z.string().optional(),
      autoApprove: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.tournament.create({
        data: {
          name: input.name,
          format: input.format,
          bracketType: input.bracketType,
          organizerId: ctx.session.user.id,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          maxTeams: input.maxTeams,
          entryFee: input.entryFee,
          registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : undefined,
          autoApprove: input.autoApprove,
          registrationOpen: true,
          status: 'UPCOMING',
        },
      });
    }),

  register: protectedProcedure
    .input(z.object({ tournamentId: z.string(), teamId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // Verify captaincy
      const membership = await ctx.prisma.teamMember.findFirst({
        where: { teamId: input.teamId, userId, role: 'CAPTAIN' },
      });
      if (!membership) throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the team captain can register' });

      const tournament = await ctx.prisma.tournament.findUnique({ where: { id: input.tournamentId } });
      if (!tournament) throw new TRPCError({ code: 'NOT_FOUND' });
      if (!tournament.registrationOpen) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Registration is closed' });

      const existing = await ctx.prisma.tournamentRegistration.findUnique({
        where: { tournamentId_teamId: { tournamentId: input.tournamentId, teamId: input.teamId } },
      });
      if (existing) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Team already registered' });

      const count = await ctx.prisma.tournamentRegistration.count({ where: { tournamentId: input.tournamentId, status: 'APPROVED' } });
      if (count >= tournament.maxTeams) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tournament is full' });

      return ctx.prisma.tournamentRegistration.create({
        data: {
          tournamentId: input.tournamentId,
          teamId: input.teamId,
          registeredBy: userId,
          status: tournament.autoApprove ? 'APPROVED' : 'PENDING',
        },
      });
    }),

  approveTeam: protectedProcedure
    .input(z.object({ registrationId: z.string(), action: z.enum(['APPROVED', 'REJECTED']) }))
    .mutation(async ({ input, ctx }) => {
      const reg = await ctx.prisma.tournamentRegistration.findUnique({
        where: { id: input.registrationId },
        include: { tournament: true },
      });
      if (!reg) throw new TRPCError({ code: 'NOT_FOUND' });
      if (reg.tournament.organizerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });

      return ctx.prisma.tournamentRegistration.update({
        where: { id: input.registrationId },
        data: { status: input.action },
      });
    }),

  getRegistrations: protectedProcedure
    .input(z.object({ tournamentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const tournament = await ctx.prisma.tournament.findUnique({ where: { id: input.tournamentId } });
      if (tournament?.organizerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      return ctx.prisma.tournamentRegistration.findMany({
        where: { tournamentId: input.tournamentId },
        include: {
          team: { select: { name: true, shortName: true, colorHex: true, members: { select: { id: true } } } },
        },
        orderBy: { registeredAt: 'desc' },
      });
    }),

  closeRegistration: protectedProcedure
    .input(z.object({ tournamentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const t = await ctx.prisma.tournament.findUnique({ where: { id: input.tournamentId } });
      if (t?.organizerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      return ctx.prisma.tournament.update({ where: { id: input.tournamentId }, data: { registrationOpen: false } });
    }),

  getLeaderboard: publicProcedure.query(async ({ ctx }) => {
    // Aggregate runs per user from Scorecard
    const results = await ctx.prisma.scorecard.groupBy({
      by: ['playerId'],
      _sum: { runs: true, wickets: true, ballsFaced: true },
      _count: { playerId: true },
      orderBy: { _sum: { runs: 'desc' } },
      take: 50,
    });

    // Fetch user names
    const playerIds = results.map(r => r.playerId);
    const users = await ctx.prisma.user.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, name: true },
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    return results.map((r, i) => ({
      rank: i + 1,
      playerId: r.playerId,
      name: userMap[r.playerId]?.name ?? 'Player',
      stat: r._sum.runs ?? 0,
      wickets: r._sum.wickets ?? 0,
      matches: r._count.playerId,
      detail: `${r._count.playerId} matches`,
    }));
  }),
});
