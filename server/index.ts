import { router } from './trpc';
import { matchRouter } from './routers/match';
import { tournamentRouter } from './routers/tournament';
import { playerRouter } from './routers/player';
import { teamRouter } from './routers/team';
import { userRouter } from './routers/user';

export const appRouter = router({
  match: matchRouter,
  tournament: tournamentRouter,
  player: playerRouter,
  team: teamRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
