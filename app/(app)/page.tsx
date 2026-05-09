"use client";

import { motion } from "framer-motion";
import { Bell, Search, MapPin, ChevronRight, Activity, Trophy } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function HomePage() {
  const { data: tournaments, isLoading } = trpc.tournament.getAll.useQuery();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">CricNation</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Mumbai, Maharashtra
          </p>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-foreground hover:bg-surface/80">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-foreground hover:bg-surface/80 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Live Matches Widget */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-destructive" /> Live Matches
          </h2>
          <Link href="/matches" className="text-sm text-primary font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto pb-4 snap-x hide-scrollbar">
          <div className="flex gap-4">
            {isLoading ? (
              <div className="text-muted-foreground p-4">Loading live matches...</div>
            ) : (
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="min-w-[280px] bg-surface rounded-xl p-4 border border-border snap-start relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-destructive text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg animate-pulse">
                  LIVE
                </div>
                <p className="text-xs text-muted-foreground mb-3">No live matches currently</p>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">Start a match to see it here!</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4">
        <Link href="/tournaments/new" className="bg-surface rounded-xl p-4 border border-border flex flex-col items-center justify-center gap-2 hover:bg-surface/80 transition-colors">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <span className="font-medium text-sm">Host Tournament</span>
        </Link>
        <Link href="/grounds" className="bg-surface rounded-xl p-4 border border-border flex flex-col items-center justify-center gap-2 hover:bg-surface/80 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-500" />
          </div>
          <span className="font-medium text-sm">Find Grounds</span>
        </Link>
      </section>
    </div>
  );
}
