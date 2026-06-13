"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Edit2, MapPin, Star, Award,
  ChevronRight, Trophy, Target, Zap, Check, Shield, Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

function getInitialsColor(name: string) {
  const colors = ["#E8390E", "#2563EB", "#16A34A", "#7C3AED", "#DB2777", "#0891B2", "#D97706", "#DC2626"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function StatBox({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  const empty = value === 0 || value === null || value === undefined || value === "—" || value === "0/0";
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? "bg-[#E8390E]/8 border border-[#E8390E]/20" : "bg-[#F2EFE9]"}`}>
      <p className={`text-lg font-bold ${highlight ? "text-[#E8390E]" : "text-[#1A1A1A]"}`}>
        {empty ? "—" : value}
      </p>
      <p className="text-[10px] text-[#8A8278] uppercase tracking-wide mt-0.5 font-medium leading-tight">{label}</p>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="font-bold text-sm text-[#1A1A1A]">{title}</h2>
    </div>
  );
}

// ── Edit Profile Sheet ──────────────────────────────────────────
function EditProfileSheet({ isOpen, currentName, currentCity, onClose, onSave, isSaving }: {
  isOpen: boolean; currentName: string; currentCity: string;
  onClose: () => void; onSave: (name: string, city: string) => void; isSaving: boolean;
}) {
  const [name, setName] = useState(currentName);
  const [city, setCity] = useState(currentCity);
  const ic = "w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#E8390E] transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40" onClick={onClose} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-transparent rounded-t-3xl z-50 p-6 pb-10 shadow-2xl">
            <div className="w-10 h-1 bg-[rgba(107,74,42,0.2)] rounded-full mx-auto mb-6" />
            <h3 className="font-bold text-[#1A1A1A] text-lg mb-5">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#8A8278] font-medium block mb-1.5">Display Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className={ic} placeholder="Your name" maxLength={60} />
              </div>
              <div>
                <label className="text-xs text-[#8A8278] font-medium block mb-1.5">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} className={ic} placeholder="e.g. Mumbai, Nagpur..." maxLength={50} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={onClose} className="py-3.5 rounded-xl bg-[#F2EFE9] text-[#4A4540] font-semibold text-sm">Cancel</button>
              <button onClick={() => onSave(name, city)} disabled={isSaving || !name.trim()}
                className="py-3.5 rounded-xl bg-[#E8390E] text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(232,57,14,0.3)]">
                {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" />Save</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [showEdit, setShowEdit] = useState(false);
  const utils = trpc.useUtils();

  const userId = params.id === "me" ? session?.user?.id : params.id;
  const isOwnProfile = session?.user?.id === userId;

  const { data: profile, isLoading } = trpc.player.getProfile.useQuery(
    { userId: userId! },
    { enabled: !!userId }
  );

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.player.getProfile.invalidate({ userId: userId! });
      await updateSession();
      setShowEdit(false);
    },
  });

  if (params.id === "me" && status === "loading") {
    return <LoadingShell />;
  }

  if (params.id === "me" && status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-5 text-3xl">🏆</div>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Your Cricket Profile</h2>
        <p className="text-[#8A8278] text-sm mb-8 leading-relaxed max-w-xs">
          Sign in to build your cricket profile, track your stats across every match, and earn achievements.
        </p>
        <button onClick={() => router.push("/login")}
          className="bg-[#E8390E] text-white font-bold px-8 py-4 rounded-2xl shadow-[0_4px_20px_rgba(232,57,14,0.4)] text-sm">
          Sign In with Google
        </button>
      </div>
    );
  }

  if (isLoading || !profile) return <LoadingShell />;

  const { user, teams, batting, bowling, fielding, recentMatches, awards } = profile;
  const name = user.name ?? "Cricket Player";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const bgColor = getInitialsColor(name);
  const captainTeam = teams.find((t: any) => t.role === "CAPTAIN");
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const hasBatting = batting.innings > 0;
  const hasBowling = bowling.wickets > 0 || bowling.legalBalls > 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Hero */}
      <div className="bg-[#1A1A1A] pt-12 pb-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ backgroundColor: bgColor, transform: "translate(40%,-40%)", filter: "blur(40px)" }} />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
            className="w-10 h-10 bg-transparent/10 rounded-xl flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          {isOwnProfile && (
            <button onClick={() => setShowEdit(true)}
              className="w-10 h-10 bg-transparent/10 rounded-xl flex items-center justify-center text-white">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-end gap-4 relative z-10">
          <div className="shrink-0">
            {(isOwnProfile && session?.user?.image) || user.image ? (
              <Image
                src={(isOwnProfile ? session?.user?.image : user.image) ?? ""}
                alt={name} width={80} height={80}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl ring-4 ring-white/10"
                style={{ backgroundColor: bgColor }}>
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white truncate">{name}</h1>
            {captainTeam && (
              <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                Captain · {(captainTeam as any).team.name}
              </p>
            )}
            <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
              {user.city && <><MapPin className="w-3 h-3" />{user.city} · </>}
              Since {joinedDate}
            </p>
          </div>
        </div>

        {/* Quick stat row */}
        <div className="flex items-center gap-5 mt-5 relative z-10 border-t border-white/10 pt-4">
          {[
            { label: "Matches", val: batting.matches || "—" },
            { label: "Runs", val: batting.runs || "—" },
            { label: "Wickets", val: bowling.wickets || "—" },
            { label: "Teams", val: teams.length || "—" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-5">
              {i > 0 && <div className="w-px h-8 bg-transparent/10" />}
              <div className="text-center">
                <p className="text-white font-bold text-base">{s.val}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wide">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── Teams ── */}
        {teams.length > 0 && (
          <section>
            <SectionHeader icon={<Users className="w-4 h-4 text-[#8A8278]" />} title="Teams" />
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
              {teams.map((tm: any) => (
                <Link key={tm.id} href={`/teams/${tm.team.id}`} className="shrink-0">
                  <div className="glass-card border border-[rgba(107,74,42,0.13)] rounded-2xl p-3 flex items-center gap-2.5 min-w-[160px] shadow-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: tm.team.colorHex }}>{tm.team.shortName}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[#1A1A1A] truncate">{tm.team.name}</p>
                      <p className="text-[10px] text-[#8A8278] capitalize">{tm.role.toLowerCase().replace("_", " ")}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Batting Stats ── */}
        <section className="glass-card border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 shadow-sm">
          <SectionHeader icon={<Target className="w-4 h-4 text-[#E8390E]" />} title="Batting" />
          {!hasBatting ? (
            <div className="py-6 text-center">
              <p className="text-2xl mb-2">🏏</p>
              <p className="text-sm text-[#8A8278]">No batting stats yet — score a match!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <StatBox label="Mat" value={batting.matches} />
                <StatBox label="Inn" value={batting.innings} />
                <StatBox label="Runs" value={batting.runs} highlight />
                <StatBox label="HS" value={batting.highestScore} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <StatBox label="Avg" value={batting.average > 0 ? batting.average : "—"} />
                <StatBox label="SR" value={batting.strikeRate > 0 ? batting.strikeRate : "—"} />
                <StatBox label="100s" value={batting.hundreds} />
                <StatBox label="50s" value={batting.fifties} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <StatBox label="4s" value={batting.fours} />
                <StatBox label="6s" value={batting.sixes} />
                <StatBox label="Balls" value={batting.balls} />
                <StatBox label="Catches" value={fielding?.catches ?? 0} />
              </div>
            </div>
          )}
        </section>

        {/* ── Bowling Stats ── */}
        <section className="glass-card border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 shadow-sm">
          <SectionHeader icon={<Zap className="w-4 h-4 text-amber-500" />} title="Bowling" />
          {!hasBowling ? (
            <div className="py-6 text-center">
              <p className="text-2xl mb-2">🎳</p>
              <p className="text-sm text-[#8A8278]">No bowling stats yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <StatBox label="Overs" value={bowling.overs} />
                <StatBox label="Runs" value={bowling.runsConceded} />
                <StatBox label="Wkts" value={bowling.wickets} highlight />
                <StatBox label="Best" value={bowling.bestBowling ?? "—"} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Economy" value={bowling.economy > 0 ? bowling.economy : "—"} />
                <StatBox label="Avg" value={bowling.average ?? "—"} />
                <StatBox label="SR" value={
                  bowling.wickets > 0 ? +((bowling.legalBalls / bowling.wickets).toFixed(1)) : "—"
                } />
              </div>
            </div>
          )}
        </section>

        {/* ── Achievements ── */}
        {awards && awards.length > 0 && (
          <section className="glass-card border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 shadow-sm">
            <SectionHeader icon={<Award className="w-4 h-4 text-amber-500" />} title="Achievements" />
            <div className="grid grid-cols-2 gap-2">
              {awards.map((a: any) => (
                <div key={a.id} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="font-semibold text-xs text-amber-400">{a.title}</p>
                  <p className="text-[10px] text-amber-500/80 mt-0.5">{a.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Matches ── */}
        {recentMatches && recentMatches.length > 0 && (
          <section>
            <h2 className="font-bold text-sm text-[#1A1A1A] mb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#8A8278]" /> Recent Matches
            </h2>
            <div className="space-y-2">
              {recentMatches.map((m: any, i: number) => (
                <Link key={i} href={`/match/${m.matchId}`}>
                  <div className="glass-card border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 flex items-center gap-3 hover:border-[rgba(107,74,42,0.25)] transition-colors shadow-sm">
                    <div className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center text-lg shrink-0">🏏</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#1A1A1A]">
                        {m.match?.homeTeam?.name} vs {m.match?.awayTeam?.name}
                      </p>
                      <p className="text-xs text-[#8A8278]">
                        {m.match?.startTime
                          ? new Date(m.match.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      m.status === "LIVE" ? "bg-[#E8390E]/15 text-[#E8390E] border border-[#E8390E]/20" :
                      m.status === "COMPLETED" ? "bg-[#F2EFE9] text-[#4A4540]" : "bg-blue-500/15 text-blue-400"
                    }`}>
                      {m.status === "LIVE" ? "● LIVE" : m.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#8A8278]" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {batting.matches === 0 && bowling.wickets === 0 && (!recentMatches || recentMatches.length === 0) && teams.length === 0 && (
          <div className="glass-card border border-[rgba(107,74,42,0.13)] rounded-2xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">🏏</div>
            <p className="font-bold text-[#1A1A1A] mb-2">Profile is fresh!</p>
            <p className="text-sm text-[#8A8278] mb-5">Create a team and score your first match to build your cricket profile.</p>
            <Link href="/teams/new">
              <button className="bg-[#E8390E] text-white font-bold px-6 py-3 rounded-xl text-sm shadow-[0_4px_12px_rgba(232,57,14,0.35)]">
                Create a Team
              </button>
            </Link>
          </div>
        )}
      </div>

      <EditProfileSheet
        isOpen={showEdit}
        currentName={user.name ?? ""}
        currentCity={user.city ?? ""}
        onClose={() => setShowEdit(false)}
        onSave={(name, city) => updateProfile.mutate({ name, city })}
        isSaving={updateProfile.isPending}
      />
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      <div className="h-52 bg-[#1A1A1A] animate-pulse" />
      <div className="px-4 pt-4 space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[#F2EFE9] rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );
}
