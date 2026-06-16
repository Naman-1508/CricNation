"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Activity, Trophy, Users, Zap, Shield, Plus,
  TrendingUp, MapPin, Star, Play
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import { NotificationBell, NotificationPanel } from "@/components/NotificationCenter";

// ── Animation presets ──────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26, delay } },
});

// ── Landing Page (Unauthenticated) ─────────────────────────────────────────
function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white relative overflow-hidden flex flex-col">
      
      {/* ── Stadium Floodlights ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-0 left-1/4 w-40 h-[150vh] bg-gradient-to-b from-white/20 via-white/5 to-transparent floodlight-l blur-3xl mix-blend-overlay" />
        <div className="absolute top-0 right-1/4 w-40 h-[150vh] bg-gradient-to-b from-white/20 via-white/5 to-transparent floodlight-r blur-3xl mix-blend-overlay" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#E8390E]/20 to-transparent blur-3xl" />
      </div>

      {/* ── Animated Pitch Lines ── */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[400px] h-[200vh] border-x-2 border-white/30 transform perspective-[1000px] rotateX(60deg) origin-bottom">
          <div className="w-full h-[5px] bg-white/50 pitch-scanner" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 pt-safe py-4 relative z-10">
        <motion.div {...fadeUp(0.05)} className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#E8390E] to-[#C42E09] rounded-xl flex items-center justify-center text-base shadow-lg">
            🏏
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">CricNation</span>
        </motion.div>
        <motion.div {...fadeUp(0.1)}>
          <Link href="/login">
            <motion.button
              whileTap={{ scale: 0.93 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 pt-8 pb-24">
        
        {/* Live Indicator */}
        <motion.div {...fadeUp(0.1)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8390E]/15 border border-[#E8390E]/30 text-[10px] font-black uppercase tracking-widest text-[#E8390E] mb-8 shadow-[0_0_20px_rgba(232,57,14,0.3)]"
        >
          <span className="w-1.5 h-1.5 bg-[#E8390E] rounded-full live-dot" />
          Live Match Broadcasting
        </motion.div>

        {/* Floating Cricket Ball */}
        <motion.div {...fadeUp(0.12)} className="relative mb-6">
          <div className="w-20 h-20 bg-[#E8390E] rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.5),0_0_40px_rgba(232,57,14,0.6)] flex items-center justify-center mx-auto cricket-float">
            <div className="absolute inset-1 border-2 border-dashed border-white/40 rounded-full seam-spin" />
            <span className="font-bold text-white/90 text-2xl drop-shadow-md relative z-10">CN</span>
          </div>
        </motion.div>

        <motion.h1 {...fadeUp(0.15)} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6 uppercase italic">
          Step Up To<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
            The Crease
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-white/40 font-medium text-sm md:text-base max-w-sm mx-auto mb-10 leading-relaxed uppercase tracking-wider">
          Pro-level scoring, live wagon wheels, and broadcast-quality graphics for your local matches.
        </motion.p>

        <motion.div {...fadeUp(0.25)} className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/login" className="flex-1">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white py-5 rounded-2xl font-black text-base uppercase tracking-wider glow-brand shadow-[0_0_40px_rgba(232,57,14,0.4)] border border-[#E8390E]/50"
            >
              Take The Field
            </motion.button>
          </Link>
        </motion.div>

      </main>
    </div>
  );
}

// ── Dashboard Skeleton ─────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-white/5 rounded-xl animate-pulse ${className}`} />
  );
}

// ── Dashboard (Authenticated) ──────────────────────────────────────────────
function Dashboard({ session }: { session: any }) {
  const { data: tournaments, isLoading: loadingT } = trpc.tournament.getAll.useQuery();
  const { data: myTeams, isLoading: loadingTeams } = trpc.team.getMyTeams.useQuery(
    undefined,
    { enabled: !!session?.user?.id }
  );
  const [greeting, setGreeting] = useState("Hey");
  const [location, setLocation] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    const name = session?.user?.name?.split(" ")[0] ?? "";
    const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    setGreeting(name ? `${greet}, ${name}` : greet);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const d = await res.json();
          const city = d.address?.city || d.address?.town || d.address?.village || null;
          setLocation(city);
        } catch { /* silent */ }
      }, () => { /* silent */ });
    }
  }, [session]);

  const liveCount = tournaments?.filter((t: any) => t.status === "LIVE").length ?? 0;
  const totalTournaments = tournaments?.length ?? 0;
  const totalTeams = myTeams?.length ?? 0;

  const stats = [
    { label: "Live Now", value: liveCount, icon: Activity, color: "text-[#E8390E]", bg: "bg-[#E8390E]/15", glow: "shadow-[0_0_20px_rgba(232,57,14,0.2)]" },
    { label: "Tournaments", value: totalTournaments, icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/15", glow: "" },
    { label: "My Teams", value: totalTeams, icon: Shield, color: "text-blue-400", bg: "bg-blue-500/15", glow: "" },
  ];

  const liveTournaments = tournaments?.filter((t: any) => t.status === "LIVE") ?? [];
  const upcomingTournaments = tournaments?.filter((t: any) => t.status !== "LIVE") ?? [];

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] pb-24 relative overflow-hidden">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8390E]/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Notification panel */}
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* ── Header ── */}
      <div className="relative z-10 px-5 pt-safe pt-14 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/40 text-sm mb-0.5">{greeting} 👋</p>
            <h1 className="text-2xl font-black text-white tracking-tight">CricNation</h1>
            {location && (
              <motion.p
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="text-white/25 text-xs flex items-center gap-1 mt-0.5"
              >
                <MapPin className="w-3 h-3" /> {location}
              </motion.p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <NotificationBell onOpen={() => setNotifOpen(true)} />
            {session?.user?.image ? (
              <img
                src={session.user.image}
                className="w-10 h-10 rounded-2xl object-cover border border-white/15"
                alt="avatar"
              />
            ) : (
              <div className="w-10 h-10 bg-[#E8390E] rounded-2xl flex items-center justify-center text-white font-bold text-sm">
                {session?.user?.name?.[0] ?? "U"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 space-y-5">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
              className={`glass-card rounded-2xl p-3.5 text-center ${s.glow}`}
            >
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <p className="text-2xl font-black text-white leading-none">{s.value}</p>
              <p className="text-[9px] text-white/35 uppercase tracking-widest mt-1 leading-tight font-semibold">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Start Match CTA ── */}
        <motion.div {...fadeUp(0.12)}>
          <Link href="/score">
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden rounded-3xl p-5 btn-native"
              style={{ background: "linear-gradient(135deg, #E8390E 0%, #B83208 100%)" }}
            >
              {/* Decorative circles */}
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -right-2 -bottom-4 w-16 h-16 bg-white/8 rounded-full" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-[11px] font-semibold uppercase tracking-widest mb-1.5">Tap to begin</p>
                  <h2 className="text-white font-black text-2xl leading-none mb-1">Start Scoring</h2>
                  <p className="text-white/60 text-xs mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full live-dot" />
                    Ball-by-ball · Real-time · Free
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4">
                  <Play className="w-7 h-7 text-white fill-white" />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div {...fadeUp(0.18)} className="grid grid-cols-2 gap-2.5">
          <Link href="/teams/new">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="glass-card rounded-2xl p-4 btn-native hover:bg-white/8 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="font-bold text-sm text-white">Create Team</p>
              <p className="text-xs text-white/35 mt-0.5">Build your squad</p>
            </motion.div>
          </Link>
          <Link href="/tournaments/new">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="glass-card rounded-2xl p-4 btn-native hover:bg-white/8 transition-colors"
            >
              <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <p className="font-bold text-sm text-white">Host Tournament</p>
              <p className="text-xs text-white/35 mt-0.5">Auto-fixtures · Free</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* ── Live Tournaments ── */}
        {liveTournaments.length > 0 && (
          <motion.section {...fadeUp(0.22)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#E8390E] rounded-full live-dot" />
                <h2 className="font-black text-white text-sm uppercase tracking-wide">Live Now</h2>
              </div>
              <Link href="/tournaments" className="text-[#E8390E] text-xs font-semibold flex items-center gap-0.5">
                All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {liveTournaments.slice(0, 3).map((t: any, i: number) => (
                <Link key={t.id} href={`/tournaments/${t.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                    whileTap={{ scale: 0.97 }}
                    className="glass-card rounded-2xl p-4 flex items-center gap-3 btn-native hover:bg-white/8 transition-colors border-l-2 border-[#E8390E]"
                  >
                    <div className="w-11 h-11 bg-[#E8390E]/15 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🏆</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{t.name}</p>
                      <p className="text-xs text-white/40">{t.format} · {t._count?.teams ?? 0} teams</p>
                    </div>
                    <span className="text-[10px] font-black text-[#E8390E] bg-[#E8390E]/15 px-2 py-1 rounded-lg border border-[#E8390E]/30 flex-shrink-0">
                      ● LIVE
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── My Teams ── */}
        {!loadingTeams && myTeams && myTeams.length > 0 && (
          <motion.section {...fadeUp(0.26)}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-white text-sm uppercase tracking-wide">My Teams</h2>
              <Link href="/teams" className="text-[#E8390E] text-xs font-semibold flex items-center gap-0.5">
                See All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
              {myTeams.map((team: any, i: number) => (
                <Link href={`/teams/${team.id}`} key={team.id} className="flex-shrink-0">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.06 } }}
                    whileTap={{ scale: 0.94 }}
                    className="glass-card rounded-2xl p-3.5 w-28 text-center btn-native"
                  >
                    <div
                      className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center font-black text-white text-xs shadow-lg"
                      style={{ backgroundColor: team.colorHex ?? "#E8390E" }}
                    >
                      {team.shortName}
                    </div>
                    <p className="text-xs font-bold text-white truncate">{team.name}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{team.memberCount || 1} members</p>
                  </motion.div>
                </Link>
              ))}
              <Link href="/teams/new" className="flex-shrink-0">
                <div className="w-28 h-[96px] rounded-2xl border-2 border-dashed border-white/12 flex flex-col items-center justify-center gap-1.5 text-white/25 hover:border-[#E8390E]/50 hover:text-[#E8390E]/60 transition-colors btn-native">
                  <Plus className="w-5 h-5" />
                  <p className="text-[10px] font-semibold">New Team</p>
                </div>
              </Link>
            </div>
          </motion.section>
        )}

        {/* ── All Tournaments ── */}
        {!loadingT && upcomingTournaments.length > 0 && (
          <motion.section {...fadeUp(0.3)}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-white text-sm uppercase tracking-wide">Tournaments</h2>
              <Link href="/tournaments" className="text-[#E8390E] text-xs font-semibold flex items-center gap-0.5">
                See All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingTournaments.slice(0, 4).map((t: any, i: number) => (
                <Link key={t.id} href={`/tournaments/${t.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                    whileTap={{ scale: 0.97 }}
                    className="glass-card rounded-2xl p-4 flex items-center gap-3 btn-native hover:bg-white/8 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🏆</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{t.name}</p>
                      <p className="text-xs text-white/40">{t.format} · {t._count?.teams ?? 0} teams</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex-shrink-0 ${
                      t.status === "UPCOMING"
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/25"
                        : "text-white/30 bg-white/5 border-white/10"
                    }`}>
                      {t.status}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Loading skeletons ── */}
        {(loadingT || loadingTeams) && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        )}

        {/* ── Empty state ── */}
        {!loadingT && !loadingTeams && (!tournaments || tournaments.length === 0) && (!myTeams || myTeams.length === 0) && (
          <motion.div
            {...fadeUp(0.3)}
            className="text-center py-14"
          >
            <div className="w-20 h-20 bg-[#E8390E]/10 rounded-3xl flex items-center justify-center mx-auto mb-5 text-3xl">
              🏏
            </div>
            <h3 className="font-black text-white text-lg mb-2">Welcome to CricNation!</h3>
            <p className="text-white/40 text-sm mb-6 max-w-[220px] mx-auto leading-relaxed">
              Create a team and score your first match in minutes.
            </p>
            <Link href="/teams/new">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold px-6 py-3.5 rounded-2xl glow-brand btn-native"
              >
                Create Your Team
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/15 border-t-[#E8390E] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "authenticated" && !session?.user?.id) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-black text-white mb-2">Session Syncing...</h2>
        <p className="text-white/40 text-sm mb-6">Please refresh the page if this takes too long.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 rounded-xl text-white text-sm font-bold">Refresh</button>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) return <LandingPage />;
  return <Dashboard session={session} />;
}
