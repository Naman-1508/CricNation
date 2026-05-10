"use client";

import { motion } from "framer-motion";
import { Bell, MapPin, ChevronRight, Activity, Trophy, Users, TrendingUp, Plus, Star, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

// ─── LANDING PAGE (For Unauthenticated Users) ─────────────────────────────────
function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8390E]/20 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🏏</span>
          <span className="text-xl font-bold tracking-tight">CricNation</span>
        </div>
        <Link href="/login">
          <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold backdrop-blur-md transition-all">
            Sign In
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 pt-10 pb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#E8390E] mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8390E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8390E]"></span>
            </span>
            Live Ball-by-Ball Scoring
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
            Score matches like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8390E] to-amber-500">Pro.</span>
          </h1>
          
          <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            The world's most advanced cricket scoring network. Build teams, host tournaments, and broadcast live scores to fans everywhere.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-[#E8390E] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(232,57,14,0.4)] hover:shadow-[0_0_60px_rgba(232,57,14,0.6)] transition-all flex items-center justify-center gap-2">
                Get Started Free <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all backdrop-blur-sm">
                Explore Matches
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Real-Time Sync</h3>
            <p className="text-sm text-white/50 leading-relaxed">Pusher WebSockets instantly broadcast every ball to fans watching the digital scorecard.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left backdrop-blur-sm">
            <div className="w-12 h-12 bg-[#E8390E]/20 rounded-2xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-[#E8390E]" />
            </div>
            <h3 className="text-lg font-bold mb-2">Tournament Manager</h3>
            <p className="text-sm text-white/50 leading-relaxed">Auto-generate fixtures, calculate Net Run Rate (NRR), and manage points tables effortlessly.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Player Profiles</h3>
            <p className="text-sm text-white/50 leading-relaxed">Verified Google accounts mean authentic stats, verified achievements, and secure data.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ─── DASHBOARD (For Authenticated Users) ─────────────────────────────────────
function Dashboard({ session }: { session: any }) {
  const { data: tournaments, isLoading: loadingT } = trpc.tournament.getAll.useQuery();
  const { data: myTeams } = trpc.team.getMyTeams.useQuery();
  const [greeting, setGreeting] = useState("Hey there");
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    const name = session?.user?.name?.split(" ")[0];
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
  const stats = [
    { label: "Live Matches", value: liveCount || "—", icon: Activity, color: "text-[#E8390E]", bg: "bg-[#E8390E]/8" },
    { label: "Tournaments", value: tournaments?.length ?? "—", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "My Teams", value: myTeams?.length ?? "—", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.1)] px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#8A8278]">{greeting} 👋</p>
            <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">CricNation</h1>
            {location && (
              <p className="text-xs text-[#8A8278] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {location}
              </p>
            )}
          </div>
          <button className="w-10 h-10 bg-[#F2EFE9] rounded-2xl flex items-center justify-center relative">
            <Bell className="w-4.5 h-4.5 text-[#4A4540]" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#E8390E] rounded-full" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] p-3 text-center">
              <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-[#1A1A1A]">{s.value}</p>
              <p className="text-[10px] text-[#8A8278] uppercase tracking-wide leading-tight mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Start Match CTA */}
        <Link href="/score">
          <motion.div whileTap={{ scale: 0.98 }}
            className="rounded-2xl overflow-hidden p-5 flex items-center justify-between relative shadow-lg"
            style={{ background: "linear-gradient(135deg,#E8390E 0%,#C42E09 100%)" }}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
            <div>
              <p className="text-white/70 text-xs font-medium mb-1">Score a match now</p>
              <h2 className="text-white font-bold text-xl">Start Match</h2>
              <p className="text-white/60 text-xs mt-1">Ball-by-ball · Real-time · Free</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🏏</div>
          </motion.div>
        </Link>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/teams/new">
            <motion.div whileTap={{ scale: 0.97 }}
              className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 hover:border-[rgba(107,74,42,0.25)] transition-colors shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-semibold text-sm text-[#1A1A1A]">Create Team</p>
              <p className="text-xs text-[#8A8278] mt-0.5">Build your squad</p>
            </motion.div>
          </Link>
          <Link href="/tournaments/new">
            <motion.div whileTap={{ scale: 0.97 }}
              className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 hover:border-[rgba(107,74,42,0.25)] transition-colors shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <p className="font-semibold text-sm text-[#1A1A1A]">Host Tournament</p>
              <p className="text-xs text-[#8A8278] mt-0.5">Free · Auto-fixtures</p>
            </motion.div>
          </Link>
        </div>

        {/* My Teams */}
        {myTeams && myTeams.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A1A1A]">My Teams</h2>
              <Link href="/teams" className="text-[#E8390E] text-sm font-medium flex items-center gap-0.5">See All <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
              {myTeams.map((team: any) => (
                <Link href={`/teams/${team.id}`} key={team.id} className="shrink-0">
                  <motion.div whileTap={{ scale: 0.96 }}
                    className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-3 w-32 text-center hover:border-[rgba(107,74,42,0.25)] transition-colors shadow-sm">
                    <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: team.colorHex }}>
                      {team.shortName}
                    </div>
                    <p className="text-xs font-semibold text-[#1A1A1A] truncate">{team.name}</p>
                    <p className="text-[10px] text-[#8A8278] mt-0.5">{team.memberCount || 1} members</p>
                  </motion.div>
                </Link>
              ))}
              <Link href="/teams/new" className="shrink-0">
                <div className="bg-[#F2EFE9] border-2 border-dashed border-[rgba(107,74,42,0.2)] rounded-2xl p-3 w-32 h-full flex flex-col items-center justify-center text-[#8A8278] hover:border-[#E8390E] hover:text-[#E8390E] transition-colors min-h-[108px]">
                  <Plus className="w-5 h-5 mb-1" />
                  <p className="text-[10px] font-medium">New Team</p>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Recent Tournaments */}
        {!loadingT && tournaments && tournaments.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A1A1A]">Tournaments</h2>
              <Link href="/tournaments" className="text-[#E8390E] text-sm font-medium flex items-center gap-0.5">See All <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="space-y-2.5">
              {tournaments.slice(0, 3).map((t: any, i: number) => (
                <Link key={t.id} href={`/tournaments/${t.id}`}>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileTap={{ scale: 0.98 }}
                    className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 flex items-center gap-3 hover:border-[rgba(107,74,42,0.25)] transition-colors shadow-sm">
                    <div className="w-11 h-11 bg-[#F2EFE9] rounded-xl flex items-center justify-center text-xl shrink-0">🏆</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#1A1A1A] truncate">{t.name}</p>
                      <p className="text-xs text-[#8A8278]">{t.format} · {t._count?.teams ?? 0} teams</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${t.status === "LIVE" ? "bg-red-50 text-red-700 border border-red-200" : t.status === "UPCOMING" ? "bg-[#F2EFE9] text-[#4A4540]" : "bg-[#F2EFE9] text-[#8A8278]"}`}>
                      {t.status === "LIVE" ? "● LIVE" : t.status}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state if no data at all */}
        {!loadingT && (!tournaments || tournaments.length === 0) && (!myTeams || myTeams.length === 0) && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏏</div>
            <h3 className="font-bold text-[#1A1A1A] mb-2">Welcome to CricNation!</h3>
            <p className="text-[#8A8278] text-sm mb-6">Create a team and start scoring your first match.</p>
            <Link href="/teams/new">
              <button className="bg-[#E8390E] text-white font-semibold px-6 py-3 rounded-xl shadow-[0_4px_16px_rgba(232,57,14,0.35)]">
                Create Your Team
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────
export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return <LandingPage />;
  }

  return <Dashboard session={session} />;
}
