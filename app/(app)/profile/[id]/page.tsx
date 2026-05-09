"use client";

import { ArrowLeft, Edit3, Share2, Award, Target, BarChart2, TrendingUp, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/app/_trpc/client";

const STAT_CARDS = [
  { key: "matches", label: "Matches", color: "text-foreground", bg: "bg-white/5" },
  { key: "runs", label: "Runs", color: "text-primary", bg: "bg-primary/10" },
  { key: "wickets", label: "Wickets", color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "avg", label: "Avg", color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "sr", label: "Strike Rate", color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "hs", label: "High Score", color: "text-red-400", bg: "bg-red-500/10" },
];

export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: stats, isLoading } = trpc.player.getStats.useQuery({ playerId: params.id });

  const statValues: Record<string, string | number> = {
    matches: stats?.matches ?? 0,
    runs: stats?.runs ?? 0,
    wickets: stats?.wickets ?? 0,
    avg: stats?.matches ? ((stats?.runs ?? 0) / stats.matches).toFixed(1) : "—",
    sr: "—",
    hs: "—",
  };

  return (
    <div className="min-h-screen bg-mesh pb-28">
      {/* Hero Banner */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #052e16 100%)",
          }}
        />
        {/* Cricket pitch pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

        {/* Action buttons */}
        <div className="absolute top-5 left-4 right-4 flex justify-between items-center z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-white"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="flex items-end justify-between mb-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl border-4 border-background glass flex items-center justify-center text-4xl shadow-xl">
              🏏
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-xl border-2 border-background flex items-center justify-center">
              <Award className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="glass px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 border border-white/10"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </motion.button>
        </div>

        <h1 className="text-2xl font-bold mb-0.5">
          {params.id === "me" ? "Your Profile" : "Player Profile"}
        </h1>
        <p className="text-sm text-muted-foreground mb-5">Right-hand Bat • Right-arm Off Spin</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {isLoading
            ? [...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
            : STAT_CARDS.map((s, i) => (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-3 text-center ${s.bg}`}
                >
                  <p className={`text-xl font-bold ${s.color}`}>{statValues[s.key]}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </motion.div>
              ))}
        </div>

        {/* Performance Overview */}
        <div className="glass-card p-4 mb-4">
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Performance Overview
          </h2>
          {[
            { label: "Batting", pct: 72, color: "bg-primary" },
            { label: "Bowling", pct: 58, color: "bg-amber-400" },
            { label: "Fielding", pct: 85, color: "bg-blue-400" },
          ].map((p) => (
            <div key={p.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{p.label}</span>
                <span className="font-semibold">{p.pct}%</span>
              </div>
              <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${p.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Wagon Wheel Placeholder */}
        <div className="glass-card p-4">
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Wagon Wheel
          </h2>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mb-3">
              <BarChart2 className="w-7 h-7 opacity-30" />
            </div>
            <p className="text-sm">Play matches to unlock</p>
            <p className="text-xs opacity-60 mt-1">Your shot zones will appear here</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card p-4 mt-4">
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Achievements
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { emoji: "🏆", label: "First Win" },
              { emoji: "💯", label: "Century" },
              { emoji: "🎯", label: "Hat-Trick" },
              { emoji: "⭐", label: "MVP" },
            ].map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl opacity-30">
                  {a.emoji}
                </div>
                <p className="text-[10px] text-muted-foreground text-center">{a.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4 opacity-60">
            Play more matches to unlock achievements
          </p>
        </div>
      </div>
    </div>
  );
}
