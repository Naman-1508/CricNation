import { router } from './trpc';
import { matchRouter } from './routers/match';
import { tournamentRouter } from './routers/tournament';
import { playerRouter } from './routers/player';
import { teamRouter } from './routers/team';

export const appRouter = router({
  match: matchRouter,
  tournament: tournamentRouter,
  player: playerRouter,
  team: teamRouter,
});

export type AppRouter = typeof appRouter;
