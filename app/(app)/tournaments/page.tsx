"use client";

import { Trophy, Search, Filter, Plus, Calendar, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";

const TAGS = ["All", "Live", "Upcoming", "My Tournaments", "Completed"];

export default function TournamentsPage() {
  const { data: tournaments, isLoading } = trpc.tournament.getAll.useQuery();
  const [activeTag, setActiveTag] = useState("All");

  const filtered = tournaments?.filter((t: any) => {
    if (activeTag === "All") return true;
    if (activeTag === "Live") return t.status === "LIVE";
    if (activeTag === "Upcoming") return t.status === "UPCOMING";
    if (activeTag === "Completed") return t.status === "COMPLETED";
    return true;
  });

  return (
    <div className="min-h-screen bg-mesh pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Compete & Win</p>
            <h1 className="text-2xl font-bold tracking-tight">Tournaments</h1>
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-muted-foreground">
              <Search className="w-4.5 h-4.5" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-muted-foreground">
              <Filter className="w-4.5 h-4.5" />
            </motion.button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Create Tournament Banner */}
        <Link href="/tournaments/new">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative rounded-2xl overflow-hidden p-5 flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 40%, #14532d 100%)",
            }}
          >
            {/* Decorative orbs */}
            <div className="absolute top-0 right-16 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 right-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
            <div className="relative z-10">
              <p className="text-white/70 text-xs font-medium mb-1">Organise your own</p>
              <h2 className="text-white font-bold text-lg leading-tight mb-1.5">Host a Tournament</h2>
              <div className="flex items-center gap-3 text-emerald-200 text-xs">
                <span>✓ 100% Free</span>
                <span>✓ Auto-Fixtures</span>
                <span>✓ Points Table</span>
              </div>
            </div>
            <div className="relative z-10 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>
        </Link>

        {/* Tournament List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
          ) : !filtered || filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center gap-3 text-muted-foreground"
            >
              <Trophy className="w-12 h-12 opacity-15" />
              <p className="font-medium">No tournaments found</p>
              <p className="text-xs opacity-60">Be the first to host one!</p>
            </motion.div>
          ) : (
            <motion.div key={activeTag} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {filtered.map((t: any, i: number) => (
                <Link href={`/tournaments/${t.id}`} key={t.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card p-4 flex gap-4 card-hover"
                  >
                    <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center shrink-0">
                      <Trophy className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-semibold text-sm leading-tight truncate pr-2">{t.name}</h3>
                        <span className={
                          t.status === "LIVE" ? "pill-live" :
                          t.status === "UPCOMING" ? "pill-upcoming" :
                          "pill-completed"
                        }>
                          {t.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {t.teams || 0} Teams
                        </span>
                        {t.location && (
                          <span className="flex items-center gap-1 truncate">
                            📍 {t.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center" />
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
