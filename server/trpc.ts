import { initTRPC, TRPCError } from '@trpc/server';
import { PrismaClient } from '@prisma/client';

// ── Prisma singleton ───────────────────────────────────────────
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ── Context ────────────────────────────────────────────────────
export type Context = {
  prisma: PrismaClient;
  session: { user: { id: string; name?: string | null; email?: string | null } } | null;
};

export async function createContext(): Promise<Context> {
  // Gracefully attempt to load auth from next-auth v5 config file
  let session: Context['session'] = null;
  try {
    // Dynamic import so it doesn't crash if auth.ts doesn't exist yet
    const mod = await import('@/auth').catch(() => null);
    if (mod?.auth) {
      session = (await mod.auth()) as Context['session'];
    }
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
