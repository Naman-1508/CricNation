import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { pusherServer } from '../pusher';

export const notificationRouter = router({

  getMyNotifications: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.notification.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.notification.count({
      where: { userId: ctx.session.user.id, isRead: false },
    });
  }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: { userId: ctx.session.user.id, isRead: false },
      data: { isRead: true },
    });
    // Push updated count = 0 to user channel
    await pusherServer.trigger(`user-${ctx.session.user.id}`, 'notifications-read', {}).catch(() => {});
    return { success: true };
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.notification.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { isRead: true },
      });
      return { success: true };
    }),
});
