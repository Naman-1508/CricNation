"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Search, TrendingUp, Zap, Target } from "lucide-react";
import { trpc } from "@/app/_trpc/client";

const FILTERS = [
  { key: "batting", label: "Batting", icon: TrendingUp },
  { key: "bowling", label: "Bowling", icon: Zap },
  { key: "fielding", label: "Fielding", icon: Target },
  { key: "mvp", label: "MVP", icon: Trophy },
];

const PERIODS = ["This Week", "This Month", "All Time"];

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function PodiumCard({ player, rank }: { player: any; rank: number }) {
  const heights = { 1: "h-28", 2: "h-20", 3: "h-16" };
  const colors = { 1: "text-yellow-600 bg-yellow-50 border-yellow-200", 2: "text-slate-500 bg-slate-50 border-slate-200", 3: "text-amber-700 bg-amber-50 border-amber-200" };
  const crowns = { 1: "👑", 2: "🥈", 3: "🥉" };
  if (!player) return <div />;

  return (
    <div className={`flex flex-col items-center justify-end ${heights[rank as keyof typeof heights] ?? "h-16"}`}>
      {rank === 1 && <span className="text-xl mb-1">👑</span>}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm mb-2 ${rank === 1 ? "ring-2 ring-yellow-400 ring-offset-2" : ""}`}
        style={{ backgroundColor: `hsl(${Math.abs(player.name?.charCodeAt(0) * 7) % 360},60%,50%)` }}>
        {getInitials(player.name ?? "?")}
      </div>
      <p className="text-xs font-semibold text-[#1A1A1A] text-center leading-tight truncate w-20 text-center">{player.name}</p>
      <p className="text-sm font-bold text-[#E8390E]">{player.stat}</p>
      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${colors[rank as keyof typeof colors]}`}>
        #{rank}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("batting");
  const [period, setPeriod] = useState("All Time");
  const [search, setSearch] = useState("");
  const { data: leaderboard, isLoading } = trpc.tournament.getLeaderboard.useQuery();

  const filtered = (leaderboard ?? []).filter(p =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  const top3 = [filtered[1], filtered[0], filtered[2]];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.1)] px-5 pt-12 pb-4 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" /> Leaderboard
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player..."
            className="w-full bg-[#F2EFE9] rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none" />
        </div>

        {/* Period Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-3">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${period === p ? "bg-[#1A1A1A] text-white" : "bg-[#F2EFE9] text-[#4A4540]"}`}>
              {p}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {FILTERS.map(f => {
            const active = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${active ? "bg-[#E8390E] text-white" : "bg-[#F2EFE9] text-[#4A4540] hover:bg-[rgba(107,74,42,0.1)]"}`}>
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] h-16 animate-pulse" />)}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Trophy className="w-12 h-12 text-[rgba(107,74,42,0.2)]" />
            <p className="font-semibold text-[#1A1A1A]">{search ? "No players found" : "No rankings yet"}</p>
            <p className="text-sm text-[#8A8278]">{search ? "Try a different name" : "Complete matches to generate stats"}</p>
          </div>
        ) : (
          <>
            {/* Podium — only show when not searching */}
            {!search && filtered.length >= 3 && (
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5">
                <p className="text-xs text-[#8A8278] font-medium uppercase tracking-wide mb-4">Top Performers</p>
                <div className="grid grid-cols-3 gap-2 items-end">
                  <PodiumCard player={filtered[1]} rank={2} />
                  <PodiumCard player={filtered[0]} rank={1} />
                  <PodiumCard player={filtered[2]} rank={3} />
                </div>
              </div>
            )}

            {/* Rankings List */}
            <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center px-4 py-2.5 bg-[#F2EFE9] border-b border-[rgba(107,74,42,0.1)]">
                <span className="text-[10px] font-bold text-[#8A8278] uppercase tracking-wider w-8">#</span>
                <span className="text-[10px] font-bold text-[#8A8278] uppercase tracking-wider flex-1 ml-12">Player</span>
                <span className="text-[10px] font-bold text-[#8A8278] uppercase tracking-wider text-right">
                  {filter === "batting" ? "Runs" : filter === "bowling" ? "Wkts" : "Score"}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {filtered.map((player: any, idx: number) => (
                    <motion.div key={player.playerId ?? idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                      className={`flex items-center px-4 py-3 border-b border-[rgba(107,74,42,0.07)] last:border-0 ${idx < 3 ? "hover:bg-amber-50/50" : "hover:bg-[#FAFAF8]"} transition-colors`}>
                      {/* Rank */}
                      <div className={`w-8 text-sm font-bold font-mono ${idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-600" : "text-[#8A8278]"}`}>
                        {idx < 3 ? ["🥇","🥈","🥉"][idx] : player.rank}
                      </div>
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs mr-3 shrink-0"
                        style={{ backgroundColor: `hsl(${Math.abs((player.name ?? "").charCodeAt(0) * 7) % 360},55%,50%)` }}>
                        {getInitials(player.name ?? "?")}
                      </div>
                      {/* Name + detail */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1A1A1A] truncate">{player.name}</p>
                        <p className="text-xs text-[#8A8278]">{player.detail}</p>
                      </div>
                      {/* Stat */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#E8390E] font-mono">{filter === "bowling" ? player.wickets : player.stat}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
