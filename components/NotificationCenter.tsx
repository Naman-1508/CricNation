"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusherClient";
import { useSession } from "next-auth/react";
// Removed date-fns to fix SSR issue with Turbopack

// ── Notification type → icon + color ──────────────────────────────────────
const TYPE_STYLE: Record<string, { icon: string; bg: string; text: string }> = {
  WICKET:     { icon: "🏏", bg: "bg-[#E8390E]/15", text: "text-[#E8390E]" },
  BOUNDARY:   { icon: "💥", bg: "bg-blue-500/15",  text: "text-blue-400" },
  MILESTONE:  { icon: "⭐", bg: "bg-amber-500/15", text: "text-amber-400" },
  MATCH_END:  { icon: "🏆", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  DEFAULT:    { icon: "🔔", bg: "bg-white/8",       text: "text-white/50" },
};

function getStyle(type: string) {
  return TYPE_STYLE[type] ?? TYPE_STYLE.DEFAULT;
}

// ── Bell Button with live badge ────────────────────────────────────────────
export function NotificationBell({ onOpen }: { onOpen: () => void }) {
  const { data: session } = useSession();
  const { data: count = 0, refetch } = trpc.notification.getUnreadCount.useQuery(
    undefined,
    { enabled: !!session?.user?.id, refetchInterval: false }
  );
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    setLiveCount(count);
  }, [count]);

  // Subscribe to real-time notifications via Pusher
  useEffect(() => {
    if (!session?.user?.id) return;
    const channel = pusherClient.subscribe(`user-${session.user.id}`);
    channel.bind("notification", () => {
      setLiveCount(c => c + 1);
    });
    channel.bind("notifications-read", () => {
      setLiveCount(0);
    });
    return () => {
      if (session?.user?.id) pusherClient.unsubscribe(`user-${session.user.id}`);
    };
  }, [session?.user?.id]);

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onOpen}
      className="relative w-10 h-10 bg-white/8 hover:bg-white/15 rounded-2xl flex items-center justify-center transition-colors"
    >
      <Bell className="w-4.5 h-4.5 text-white/70" />
      <AnimatePresence>
        {liveCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8390E] rounded-full flex items-center justify-center text-[9px] font-black text-white"
          >
            {liveCount > 9 ? "9+" : liveCount}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Notification Panel ─────────────────────────────────────────────────────
export function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: notifications = [], refetch } = trpc.notification.getMyNotifications.useQuery(
    undefined,
    { enabled: isOpen }
  );
  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => refetch()
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  useEffect(() => {
    if (isOpen) refetch();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 38 } }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-[#111]/95 backdrop-blur-2xl border-b border-white/10 z-50 max-h-[75vh] flex flex-col rounded-b-3xl shadow-2xl shadow-black/50"
          >
            {/* Safe area top + header */}
            <div className="pt-[env(safe-area-inset-top,0px)] px-5 pb-0">
              <div className="flex items-center justify-between py-4">
                <div>
                  <h2 className="font-black text-white text-xl">Notifications</h2>
                  {unreadCount > 0 && (
                    <p className="text-white/40 text-xs mt-0.5">{unreadCount} unread</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => markAllRead.mutate()}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#E8390E] px-3 py-1.5 bg-[#E8390E]/10 rounded-full"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all read
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={onClose}
                    className="w-8 h-8 bg-white/8 rounded-xl flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white/50" />
                  </motion.button>
                </div>
              </div>
              <div className="h-px bg-white/8" />
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto flex-1 pb-6">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/30 text-sm font-medium">No notifications yet</p>
                  <p className="text-white/15 text-xs mt-1">Wickets, boundaries & milestones appear here</p>
                </div>
              ) : (
                <div className="px-4 pt-3 space-y-2">
                  {(notifications as any[]).map((n, i) => {
                    const style = getStyle(n.type);
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all ${
                          n.isRead ? "opacity-60" : "bg-white/5 border border-white/8"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-2xl ${style.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-bold text-sm text-white ${n.isRead ? "opacity-60" : ""}`}>
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <div className="w-2 h-2 bg-[#E8390E] rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-white/20 text-[10px] mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
