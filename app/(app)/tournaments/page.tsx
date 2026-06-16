"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight, Users, Calendar, Trophy } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26, delay } },
});

const FORMAT_STYLE: Record<string, { bg: string; text: string }> = {
  T10:  { bg: "bg-purple-500/15", text: "text-purple-400" },
  T20:  { bg: "bg-blue-500/15",   text: "text-blue-400"   },
  ODI:  { bg: "bg-emerald-500/15",text: "text-emerald-400" },
  TEST: { bg: "bg-amber-500/15",  text: "text-amber-400"  },
};

const TABS = ["Open", "All"];

export default function TournamentsPage() {
  const [tab, setTab] = useState(0);
  const { data: all,  isLoading: allLoading  } = trpc.tournament.getAll.useQuery();
  const { data: open, isLoading: openLoading } = trpc.tournament.getOpenTournaments.useQuery();

  const list    = tab === 0 ? open : all;
  const loading = tab === 0 ? openLoading : allLoading;

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A]">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <motion.div {...fadeUp(0)} className="relative z-10 px-5 pt-14 pb-4 border-b border-white/6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-0.5">Compete</p>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" /> Tournaments
            </h1>
          </div>
          <Link href="/tournaments/new">
            <motion.div
              whileTap={{ scale: 0.88 }}
              className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.35)] btn-native"
            >
              <Plus className="w-5 h-5 text-white" strokeWidth={2.8} />
            </motion.div>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/8">
          {TABS.map((t, i) => (
            <motion.button key={t}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(i)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all btn-native ${
                tab === i ? "bg-white/12 text-white shadow-sm" : "text-white/35"
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 px-4 pt-4 pb-nav space-y-3">
        {/* Skeletons */}
        {loading && [...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}

        {/* Empty */}
        {!loading && (!list || list.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-8 text-center mt-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="text-6xl mb-4"
            >🏆</motion.div>
            <h2 className="text-xl font-black text-white mb-2">
              {tab === 0 ? "No Open Tournaments" : "No Tournaments Yet"}
            </h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              {tab === 0 ? "Check back soon or host your own tournament!" : "Be the first to host a tournament!"}
            </p>
            <Link href="/tournaments/new">
              <motion.button whileTap={{ scale: 0.96 }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold px-8 py-4 rounded-2xl text-sm shadow-[0_4px_16px_rgba(245,158,11,0.35)] btn-native">
                Host a Tournament
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* List */}
        {(list as any[] | undefined)?.map((t: any, i: number) => {
          const fmt = FORMAT_STYLE[t.format] ?? { bg: "bg-white/8", text: "text-white/60" };
          const isLive = t.status === "LIVE";
          const regCount = t._count?.registrations ?? t._count?.teams ?? 0;
          const progress = t.maxTeams ? Math.min(100, (regCount / t.maxTeams) * 100) : 0;

          return (
            <motion.div key={t.id} {...fadeUp(i * 0.06)}>
              <Link href={`/tournaments/${t.id}`}>
                <motion.div whileTap={{ scale: 0.975 }}
                  className="glass-card rounded-2xl p-4 btn-native active:bg-white/6 transition-colors">

                  <div className="flex items-start gap-3 mb-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${fmt.bg}`}>
                      🏆
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-black text-white text-base leading-tight truncate">{t.name}</h3>
                        {/* Status badge */}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1 ${
                          isLive
                            ? "bg-[#E8390E]/15 text-[#E8390E] border border-[#E8390E]/20"
                            : t.status === "COMPLETED"
                              ? "bg-white/6 text-white/35"
                              : "bg-white/8 text-white/55"
                        }`}>
                          {isLive && <span className="live-dot w-1.5 h-1.5 bg-[#E8390E] rounded-full inline-block" />}
                          {isLive ? "LIVE" : t.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${fmt.bg} ${fmt.text}`}>
                          {t.format}
                        </span>
                        <span className="text-xs text-white/35">by {t.organizer?.name ?? "Organizer"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {regCount}/{t.maxTeams ?? "∞"} teams
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(t.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    {t.entryFee === 0
                      ? <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">Free</span>
                      : <span className="font-semibold text-white/60">₹{t.entryFee}</span>}
                  </div>

                  {/* Registration progress */}
                  {t.registrationOpen && t.maxTeams > 0 && (
                    <div>
                      <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ delay: i * 0.06 + 0.2, duration: 0.6, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#E8390E] to-amber-500 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-white/25 mt-1 font-semibold uppercase tracking-wide">
                        <span>{regCount} registered</span>
                        <span>{Math.max(0, t.maxTeams - regCount)} spots left</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
