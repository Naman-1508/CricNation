"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, ChevronRight, Users, Calendar, Trophy, DollarSign } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

const FORMAT_COLORS: Record<string, string> = {
  T10: "bg-purple-50 text-purple-700 border-purple-200",
  T20: "bg-blue-50 text-blue-700 border-blue-200",
  ODI: "bg-green-50 text-green-700 border-green-200",
  TEST: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_STYLES: Record<string, string> = {
  UPCOMING: "bg-[#F2EFE9] text-[#4A4540]",
  LIVE: "bg-red-50 text-red-700 border border-red-200",
  COMPLETED: "bg-[#F2EFE9] text-[#8A8278]",
};

const TABS = ["Open", "My Tournaments"];

export default function TournamentsPage() {
  const [tab, setTab] = useState(0);
  const { data: all, isLoading } = trpc.tournament.getAll.useQuery();
  const { data: open, isLoading: openLoading } = trpc.tournament.getOpenTournaments.useQuery();

  const list = tab === 0 ? open : all;
  const loading = tab === 0 ? openLoading : isLoading;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.1)] px-5 pt-12 pb-4 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" /> Tournaments
            </h1>
          </div>
          <Link href="/tournaments/new">
            <motion.div whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-[#E8390E] rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(232,57,14,0.35)]">
              <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.div>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F2EFE9] p-1 rounded-xl">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === i ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8A8278]"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] h-28 animate-pulse" />
          ))
        ) : !list || list.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center px-6">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
              {tab === 0 ? "No open tournaments" : "No tournaments yet"}
            </h2>
            <p className="text-[#8A8278] text-sm mb-6">
              {tab === 0 ? "Check back soon or host your own!" : "Create your first tournament"}
            </p>
            <Link href="/tournaments/new">
              <button className="bg-[#E8390E] text-white font-semibold px-8 py-3.5 rounded-xl shadow-[0_4px_16px_rgba(232,57,14,0.35)]">
                Host a Tournament
              </button>
            </Link>
          </div>
        ) : (
          (list as any[]).map((t: any, i: number) => (
            <Link href={`/tournaments/${t.id}`} key={t.id}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 hover:border-[rgba(107,74,42,0.25)] transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#F2EFE9] rounded-xl flex items-center justify-center text-2xl shrink-0">🏆</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[#1A1A1A] truncate">{t.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${STATUS_STYLES[t.status] ?? STATUS_STYLES.UPCOMING}`}>
                        {t.status === "LIVE" ? "● LIVE" : t.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${FORMAT_COLORS[t.format] ?? "bg-[#F2EFE9] text-[#4A4540]"}`}>
                        {t.format}
                      </span>
                      <span className="text-xs text-[#8A8278]">by {t.organizer?.name ?? "Organizer"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#8A8278]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {t._count?.registrations ?? t._count?.teams ?? 0}/{t.maxTeams ?? "∞"} teams
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(t.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                  {t.entryFee === 0 ? (
                    <span className="text-green-700 bg-green-50 border border-green-200 font-bold px-2 py-0.5 rounded-full">Free</span>
                  ) : (
                    <span className="flex items-center gap-0.5">₹{t.entryFee}</span>
                  )}
                </div>

                {/* Registration progress */}
                {t.registrationOpen && t.maxTeams && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-[#F2EFE9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E8390E] rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((t._count?.registrations ?? 0) / t.maxTeams) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#8A8278] mt-1">
                      <span>{t._count?.registrations ?? 0} registered</span>
                      <span>{t.maxTeams - (t._count?.registrations ?? 0)} spots left</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
