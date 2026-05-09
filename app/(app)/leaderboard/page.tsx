"use client";

import { useState } from "react";
import { Trophy, Medal, Search, TrendingUp, Zap, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/app/_trpc/client";

const FILTERS = [
  { key: "batting", label: "Batting", icon: TrendingUp },
  { key: "bowling", label: "Bowling", icon: Zap },
  { key: "fielding", label: "Fielding", icon: Target },
  { key: "mvp", label: "MVP", icon: Trophy },
];

const RANK_COLORS = [
  "from-yellow-400 to-amber-500",
  "from-slate-300 to-slate-400",
  "from-amber-600 to-orange-700",
];

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("batting");
  const { data: batters, isLoading } = trpc.tournament.getLeaderboard.useQuery();

  return (
    <div className="min-h-screen bg-mesh pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Season Rankings</p>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Leaderboard
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-muted-foreground"
          >
            <Search className="w-4.5 h-4.5" />
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 hide-scrollbar">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-3">
        {/* Top 3 Podium */}
        {!isLoading && batters && batters.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[batters[1], batters[0], batters[2]].map((player: any, podiumIdx: number) => {
              const realRank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
              const heights = ["h-20", "h-28", "h-16"];
              return (
                <motion.div
                  key={player?.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: podiumIdx * 0.1 }}
                  className={`glass-card flex flex-col items-center justify-end p-3 ${heights[podiumIdx]} relative`}
                >
                  {realRank === 1 && (
                    <span className="absolute -top-2 text-base">👑</span>
                  )}
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${RANK_COLORS[realRank - 1]} flex items-center justify-center text-sm font-bold text-white shadow-lg mb-1`}>
                    {realRank}
                  </div>
                  <p className="text-[10px] font-semibold text-center leading-tight truncate w-full text-center">{player?.name}</p>
                  <p className="text-xs font-bold text-primary">{player?.stat}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full Ranking List */}
        <div className="glass-card overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rank & Player</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {filter === "batting" ? "Runs" : filter === "bowling" ? "Wickets" : "Score"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : !batters || batters.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                <Trophy className="w-10 h-10 opacity-20" />
                <p className="text-sm">No rankings yet</p>
                <p className="text-xs opacity-60">Complete matches to populate stats</p>
              </div>
            ) : (
              <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {batters.map((player: any, idx: number) => (
                  <motion.div
                    key={player.rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex justify-between items-center px-4 py-3.5 border-b border-white/4 last:border-0 hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        idx === 1 ? "bg-slate-500/20 text-slate-300" :
                        idx === 2 ? "bg-amber-700/20 text-amber-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {idx < 3 ? <Medal className="w-3.5 h-3.5" /> : player.rank}
                      </div>
                      <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center text-sm">
                        🏏
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.detail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{player.stat}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
