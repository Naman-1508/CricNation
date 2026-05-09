"use client";

import { motion } from "framer-motion";
import { Bell, Search, MapPin, ChevronRight, Activity, Trophy, Zap, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { data: tournaments, isLoading } = trpc.tournament.getAll.useQuery();
  const [location, setLocation] = useState("Detecting...");
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    // Detect greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Use browser Geolocation API for real location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || "Your City";
            const state = data.address?.state || "";
            setLocation(`${city}, ${state}`);
          } catch {
            setLocation("India");
          }
        },
        () => setLocation("India")
      );
    } else {
      setLocation("India");
    }
  }, []);

  const liveCount = tournaments?.filter((t: any) => t.status === "LIVE").length ?? 0;

  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <header className="sticky top-0 z-30 px-5 pt-5 pb-4 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{greeting} 👋</p>
            <h1 className="text-2xl font-bold tracking-tight gradient-text">CricNation</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">{location}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="w-4.5 h-4.5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground relative transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
            </motion.button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5 pb-28 space-y-7">

        {/* Hero Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Live Matches", value: liveCount, icon: Activity, color: "text-red-400", bg: "bg-red-500/10" },
            { label: "Tournaments", value: tournaments?.length ?? 0, icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
            { label: "Players", value: "—", icon: Users, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-3 text-center"
            >
              <div className={`w-8 h-8 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Live Matches */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Matches
            </h2>
            <Link href="/matches" className="text-xs text-primary font-medium flex items-center gap-0.5">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto pb-2 snap-x hide-scrollbar -mx-4 px-4">
            <div className="flex gap-3">
              {isLoading ? (
                <div className="min-w-[280px] skeleton h-32 rounded-2xl" />
              ) : (
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="min-w-[280px] glass-card p-4 snap-start relative overflow-hidden"
                >
                  {/* Decorative orb */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                  <div className="absolute top-3 right-3 pill-live flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> LIVE
                  </div>
                  <div className="flex items-center gap-2 mb-3 mt-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">No active matches</span>
                  </div>
                  <p className="text-sm font-medium mb-1">Start a Match</p>
                  <p className="text-xs text-muted-foreground">Tap the + button below to score a live match</p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="font-bold text-base mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tournaments/new">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="glass-card p-4 flex flex-col gap-3 card-hover relative overflow-hidden"
              >
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                <div className="w-10 h-10 bg-primary/15 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Host Tournament</p>
                  <p className="text-xs text-muted-foreground">Free • Auto-fixtures</p>
                </div>
              </motion.div>
            </Link>

            <Link href="/leaderboard">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="glass-card p-4 flex flex-col gap-3 card-hover relative overflow-hidden"
              >
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
                <div className="w-10 h-10 bg-amber-500/15 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Leaderboard</p>
                  <p className="text-xs text-muted-foreground">Top performers</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>

        {/* Recent Tournaments */}
        {!isLoading && tournaments && tournaments.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">Tournaments</h2>
              <Link href="/tournaments" className="text-xs text-primary font-medium flex items-center gap-0.5">
                See All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {tournaments.slice(0, 3).map((t: any, i: number) => (
                <Link key={t.id} href={`/tournaments/${t.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="glass-card p-4 flex items-center gap-3 card-hover"
                  >
                    <div className="w-11 h-11 bg-primary/15 rounded-2xl flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.teams || 0} Teams</p>
                    </div>
                    <span className={t.status === "LIVE" ? "pill-live" : t.status === "UPCOMING" ? "pill-upcoming" : "pill-completed"}>
                      {t.status}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
