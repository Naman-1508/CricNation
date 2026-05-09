import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';

export const matchRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // return ctx.prisma.match.findUnique({ where: { id: input.id } });
      return { 
        id: input.id, 
        homeTeam: "Home", 
        awayTeam: "Away", 
        status: "LIVE",
        score: { runs: 0, wickets: 0, overs: 0 },
        target: { runs: 0, ballsLeft: 0, rrr: 0 },
        striker: { name: "Batter 1", runs: 0, balls: 0 },
        nonStriker: { name: "Batter 2", runs: 0, balls: 0 },
        bowler: { name: "Bowler", wickets: 0, runs: 0, overs: 0 }
      };
    }),
    
  create: protectedProcedure
    .input(z.object({
      homeTeamId: z.string(),
      awayTeamId: z.string(),
      overs: z.number().min(1).max(50),
    }))
    .mutation(async ({ input, ctx }) => {
      // return ctx.prisma.match.create({ ... })
      return { id: "new-match-123", ...input };
    }),
    
  updateScore: protectedProcedure
    .input(z.object({
      matchId: z.string(),
      inningsId: z.string(),
      runs: z.number(),
      isWicket: z.boolean().default(false),
      // ... other ball details
    }))
    .mutation(async ({ input, ctx }) => {
      // Save ball to DB
      // Trigger Pusher event for real-time update
      // ctx.pusher.trigger(`match-${input.matchId}`, 'score-update', data)
      return { success: true };
    })
});
