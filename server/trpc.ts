import { initTRPC, TRPCError } from '@trpc/server';
import { PrismaClient } from '@prisma/client';

import { prisma } from "@/lib/prisma";
export { prisma };


// ── Context ────────────────────────────────────────────────────
export type Context = {
  prisma: PrismaClient;
  session: { user: { id: string; name?: string | null; email?: string | null } } | null;
};

import { auth } from "@/auth";

export async function createContext(): Promise<Context> {
  let session: Context['session'] = null;
  try {
    session = (await auth()) as Context['session'];
  } catch {
    // Auth not configured — continue as unauthenticated
  }
  return { prisma, session };
}

// ── tRPC init ──────────────────────────────────────────────────
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in' });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const protectedProcedure = t.procedure.use(isAuthed);
