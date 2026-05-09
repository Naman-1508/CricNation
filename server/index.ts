import { router } from './trpc';
import { matchRouter } from './routers/match';
import { tournamentRouter } from './routers/tournament';
import { playerRouter } from './routers/player';

export const appRouter = router({
  match: matchRouter,
  tournament: tournamentRouter,
  player: playerRouter,
});

export type AppRouter = typeof appRouter;
