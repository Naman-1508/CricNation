"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Edit2, MapPin, Star, Award,
  ChevronRight, Trophy, Target, Zap, Check,
  Shield, Users, TrendingUp, Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#E8390E","#2563EB","#16A34A","#7C3AED",
  "#DB2777","#0891B2","#D97706","#DC2626",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Stagger animation preset ────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24, delay } },
});

// ─── Stat Box ────────────────────────────────────────────────────────────────
function StatBox({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  const empty = !value || value === 0 || value === "—" || value === "0/0";
  return (
    <div className={`rounded-2xl p-3.5 text-center ${accent ? "bg-[#E8390E]/10 border border-[#E8390E]/20" : "bg-white/5 border border-white/8"}`}>
      <p className={`text-xl font-black leading-none ${accent ? "text-[#E8390E]" : "text-white"}`}>
        {empty ? "—" : value}
      </p>
      <p className="text-[9px] text-white/35 uppercase tracking-widest mt-1 font-semibold">{label}</p>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center">{icon}</div>
      <div>
        <h2 className="font-bold text-sm text-white">{title}</h2>
        {sub && <p className="text-[10px] text-white/35">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Edit Profile Sheet ───────────────────────────────────────────────────────
function EditSheet({
  open, name, city, onClose, onSave, saving,
}: {
  open: boolean; name: string; city: string;
  onClose: () => void; onSave: (n: string, c: string) => void; saving: boolean;
}) {
  const [n, setN] = useState(name);
  const [c, setC] = useState(city);

  const ic = "w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8390E] transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-3xl z-50 p-6 pb-10"
          >
            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-6" />
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">✏️</span>
              <h3 className="font-black text-white text-xl">Edit Profile</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 font-semibold uppercase tracking-widest block mb-2">Display Name</label>
                <input value={n} onChange={e => setN(e.target.value)} className={ic} placeholder="Your name" maxLength={60} />
              </div>
              <div>
                <label className="text-xs text-white/40 font-semibold uppercase tracking-widest block mb-2">City</label>
                <input value={c} onChange={e => setC(e.target.value)} className={ic} placeholder="e.g. Mumbai, Nagpur..." maxLength={50} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <motion.button whileTap={{ scale: 0.96 }} onClick={onClose}
                className="py-4 rounded-2xl bg-white/6 border border-white/10 text-white font-semibold text-sm btn-native">
                Cancel
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => onSave(n, c)} disabled={saving || !n.trim()}
                className="py-4 rounded-2xl bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 btn-native shadow-[0_4px_20px_rgba(232,57,14,0.35)]">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Check className="w-4 h-4" />Save</>}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Loading Shell ────────────────────────────────────────────────────────────
function LoadingShell() {
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A]">
      {/* Hero skeleton */}
      <div className="h-64 bg-[#111] relative overflow-hidden">
        <div className="skeleton absolute inset-0" />
        <div className="absolute bottom-6 left-5 flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl skeleton" />
          <div className="space-y-2 pb-1">
            <div className="w-32 h-5 skeleton" />
            <div className="w-20 h-3 skeleton" />
          </div>
        </div>
      </div>
      <div className="px-4 pt-4 space-y-3 pb-nav">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 skeleton" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [showEdit, setShowEdit] = useState(false);
  const utils = trpc.useUtils();

  // CRITICAL FIX: derive userId safely — never pass undefined to the query
  const rawId = params.id === "me" ? session?.user?.id : params.id;
  const userId = typeof rawId === "string" && rawId.length > 0 ? rawId : null;
  const isOwnProfile = session?.user?.id === userId;

  const { data: profile, isLoading, error } = trpc.player.getProfile.useQuery(
    { userId: userId! },
    {
      enabled: !!userId,
      retry: false,
    }
  );

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      if (userId) await utils.player.getProfile.invalidate({ userId });
      await updateSession();
      setShowEdit(false);
    },
  });

  // ── Auth guards ──
  if (params.id === "me" && status === "loading") return <LoadingShell />;

  if (params.id === "me" && status === "unauthenticated") {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
        {/* Cricket ball decoration */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl mb-6"
        >🏏</motion.div>
        <h2 className="text-2xl font-black text-white mb-2">Your Cricket Profile</h2>
        <p className="text-white/40 text-sm mb-8 leading-relaxed max-w-xs">
          Sign in to build your cricket legacy — track every run, wicket, and milestone.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/login")}
          className="bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold px-8 py-4 rounded-2xl shadow-[0_4px_24px_rgba(232,57,14,0.4)] btn-native text-sm"
        >
          Sign In to Continue
        </motion.button>
      </div>
    );
  }

  if (isLoading || (!profile && !error && userId)) return <LoadingShell />;

  if (error || !profile) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="text-xl font-black text-white mb-2">Profile not found</h2>
        <p className="text-white/40 text-sm mb-6">This player doesn&apos;t exist or their profile is private.</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.back()}
          className="glass-card px-6 py-3 rounded-2xl text-white text-sm font-semibold btn-native">
          Go Back
        </motion.button>
      </div>
    );
  }

  const { user, teams, batting, bowling, fielding, recentMatches, awards } = profile;
  const displayName = user.name ?? "Cricket Player";
  const bgColor = avatarColor(displayName);
  const captainTeam = teams.find((t: any) => t.role === "CAPTAIN");
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const hasBatting  = batting.innings > 0;
  const hasBowling  = bowling.wickets > 0 || bowling.legalBalls > 0;

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] pb-nav">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #111 0%, #0A0A0A 100%)" }}>

        {/* Ambient glow from team/avatar color */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-25 pointer-events-none"
          style={{ background: bgColor, filter: "blur(80px)", transform: "translate(30%,-30%)" }}
        />
        {/* Cricket seam decoration */}
        <div className="absolute top-4 right-4 text-4xl opacity-10 pointer-events-none select-none">🏏</div>

        {/* Header bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2">
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white/8 flex items-center justify-center btn-native">
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          {isOwnProfile && (
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShowEdit(true)}
              className="w-10 h-10 rounded-2xl bg-white/8 flex items-center justify-center btn-native">
              <Edit2 className="w-4.5 h-4.5 text-white/70" />
            </motion.button>
          )}
        </div>

        {/* Avatar + Info */}
        <div className="relative z-10 flex items-end gap-4 px-5 pt-4 pb-5">
          <motion.div {...fadeUp(0.05)} className="shrink-0 relative">
            {(isOwnProfile && session?.user?.image) || user.image ? (
              <Image
                src={(isOwnProfile ? session?.user?.image : user.image) ?? ""}
                alt={displayName}
                width={80} height={80}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/15"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl border-2 border-white/15"
                style={{ backgroundColor: bgColor }}
              >
                {initials(displayName)}
              </div>
            )}
            {/* Online/active dot */}
            {isOwnProfile && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#111] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white truncate">{displayName}</h1>
            {captainTeam && (
              <p className="text-white/55 text-xs mt-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                Captain · {(captainTeam as any).team.name}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {user.city && (
                <span className="text-white/35 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{user.city}
                </span>
              )}
              <span className="text-white/25 text-xs">Since {joinDate}</span>
            </div>
          </motion.div>
        </div>

        {/* Quick stat strip */}
        <motion.div {...fadeUp(0.15)} className="relative z-10 flex items-stretch border-t border-white/8 mx-0">
          {[
            { label: "Matches", val: batting.matches || 0 },
            { label: "Runs",    val: batting.runs    || 0 },
            { label: "Wickets", val: bowling.wickets || 0 },
            { label: "Teams",   val: teams.length    || 0 },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center py-4 border-r border-white/8 last:border-0">
              <p className="text-white font-black text-lg leading-none">{s.val}</p>
              <p className="text-white/30 text-[9px] uppercase tracking-widest mt-1 font-semibold">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── BODY ── */}
      <div className="px-4 pt-4 space-y-3">

        {/* Teams */}
        {teams.length > 0 && (
          <motion.section {...fadeUp(0.18)}>
            <SectionHeader
              icon={<Shield className="w-4 h-4 text-blue-400" />}
              title="Teams"
              sub={`Playing for ${teams.length} team${teams.length !== 1 ? "s" : ""}`}
            />
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
              {teams.map((tm: any) => (
                <Link key={tm.id} href={`/teams/${tm.team.id}`} className="shrink-0">
                  <motion.div whileTap={{ scale: 0.95 }}
                    className="glass-card rounded-2xl p-3 flex items-center gap-2.5 min-w-[160px] btn-native">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: tm.team.colorHex }}
                    >
                      {tm.team.shortName}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-white truncate">{tm.team.name}</p>
                      <p className="text-[10px] text-white/40 capitalize">{tm.role.toLowerCase().replace("_", " ")}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Batting */}
        <motion.section {...fadeUp(0.22)} className="glass-card rounded-2xl p-4">
          <SectionHeader
            icon={<Target className="w-4 h-4 text-[#E8390E]" />}
            title="Batting"
            sub={hasBatting ? `${batting.innings} innings played` : undefined}
          />
          {!hasBatting ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-2">🏏</div>
              <p className="text-sm text-white/35 font-medium">No batting stats yet</p>
              <p className="text-xs text-white/20 mt-1">Score your first match to see stats here</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <StatBox label="Mat"  value={batting.matches} />
                <StatBox label="Inn"  value={batting.innings} />
                <StatBox label="Runs" value={batting.runs} accent />
                <StatBox label="HS"   value={batting.highestScore} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <StatBox label="Avg"  value={batting.average > 0 ? batting.average : "—"} />
                <StatBox label="S/R"  value={batting.strikeRate > 0 ? batting.strikeRate : "—"} />
                <StatBox label="100s" value={batting.hundreds} />
                <StatBox label="50s"  value={batting.fifties} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="4s"   value={batting.fours} />
                <StatBox label="6s"   value={batting.sixes} />
                <StatBox label="Balls" value={batting.balls} />
              </div>
            </div>
          )}
        </motion.section>

        {/* Bowling */}
        <motion.section {...fadeUp(0.26)} className="glass-card rounded-2xl p-4">
          <SectionHeader
            icon={<Zap className="w-4 h-4 text-amber-400" />}
            title="Bowling"
            sub={hasBowling ? `${bowling.overs} overs bowled` : undefined}
          />
          {!hasBowling ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-2">🎳</div>
              <p className="text-sm text-white/35 font-medium">No bowling stats yet</p>
              <p className="text-xs text-white/20 mt-1">Bowl in a match to see your figures</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <StatBox label="Overs" value={bowling.overs} />
                <StatBox label="Runs"  value={bowling.runsConceded} />
                <StatBox label="Wkts"  value={bowling.wickets} accent />
                <StatBox label="Best"  value={bowling.bestBowling ?? "—"} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Econ" value={bowling.economy > 0 ? bowling.economy : "—"} />
                <StatBox label="Avg"  value={bowling.average ?? "—"} />
                <StatBox label="S/R"  value={bowling.wickets > 0 ? +((bowling.legalBalls / bowling.wickets).toFixed(1)) : "—"} />
              </div>
            </div>
          )}
        </motion.section>

        {/* Achievements */}
        {awards && awards.length > 0 && (
          <motion.section {...fadeUp(0.30)} className="glass-card rounded-2xl p-4">
            <SectionHeader icon={<Award className="w-4 h-4 text-amber-400" />} title="Achievements" />
            <div className="grid grid-cols-2 gap-2">
              {awards.map((a: any) => (
                <div key={a.id} className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3">
                  <p className="font-bold text-xs text-amber-400">{a.title}</p>
                  <p className="text-[10px] text-amber-400/60 mt-0.5">{a.description}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recent Matches */}
        {recentMatches && recentMatches.length > 0 && (
          <motion.section {...fadeUp(0.34)}>
            <SectionHeader
              icon={<Activity className="w-4 h-4 text-white/50" />}
              title="Recent Matches"
            />
            <div className="space-y-2">
              {recentMatches.map((m: any, i: number) => (
                <Link key={i} href={`/match/${m.matchId}`}>
                  <motion.div whileTap={{ scale: 0.98 }}
                    className="glass-card rounded-2xl p-4 flex items-center gap-3 btn-native">
                    <div className="w-10 h-10 bg-white/6 rounded-xl flex items-center justify-center text-lg shrink-0">🏏</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-white">
                        {m.match?.homeTeam?.name} vs {m.match?.awayTeam?.name}
                      </p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {m.match?.startTime
                          ? new Date(m.match.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        m.status === "LIVE"
                          ? "bg-[#E8390E]/15 text-[#E8390E] border border-[#E8390E]/25"
                          : m.status === "COMPLETED"
                            ? "bg-white/8 text-white/50"
                            : "bg-blue-500/15 text-blue-400"
                      }`}>
                        {m.status === "LIVE" ? "● LIVE" : m.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/25" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty state when zero activity */}
        {batting.matches === 0 && bowling.wickets === 0
          && (!recentMatches || recentMatches.length === 0)
          && teams.length === 0 && (
          <motion.div {...fadeUp(0.3)} className="glass-card rounded-3xl p-8 text-center mt-4">
            {/* Animated cricket ball */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-4"
            >🏏</motion.div>
            <h3 className="font-black text-white text-lg mb-2">Fresh Start!</h3>
            <p className="text-sm text-white/40 mb-6 leading-relaxed max-w-xs mx-auto">
              Create a team, invite players, and score your first match to build your cricket legacy.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/teams/new">
                <motion.button whileTap={{ scale: 0.96 }}
                  className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold px-6 py-3.5 rounded-2xl text-sm shadow-[0_4px_16px_rgba(232,57,14,0.35)] btn-native">
                  Create a Team
                </motion.button>
              </Link>
              <Link href="/score">
                <motion.button whileTap={{ scale: 0.96 }}
                  className="w-full glass-card text-white font-semibold px-6 py-3.5 rounded-2xl text-sm btn-native">
                  Start Scoring
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit Sheet */}
      <EditSheet
        open={showEdit}
        name={user.name ?? ""}
        city={user.city ?? ""}
        onClose={() => setShowEdit(false)}
        onSave={(n, c) => updateProfile.mutate({ name: n, city: c })}
        saving={updateProfile.isPending}
      />
    </div>
  );
}
