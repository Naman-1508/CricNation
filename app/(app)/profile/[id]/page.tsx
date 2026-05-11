"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Edit2, MapPin, Star, Award,
  ChevronRight, Trophy, Target, Zap, Check, X, Users
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

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#F2EFE9] rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-[#1A1A1A]">{value === 0 || value === null ? "—" : value}</p>
      <p className="text-[10px] text-[#8A8278] uppercase tracking-wide mt-0.5 font-medium">{label}</p>
    </div>
  );
}

// ── Edit Profile Sheet ────────────────────────────────────────────────────────
function EditProfileSheet({
  isOpen,
  currentName,
  currentCity,
  onClose,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  currentName: string;
  currentCity: string;
  onClose: () => void;
  onSave: (name: string, city: string) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(currentName);
  const [city, setCity] = useState(currentCity);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40" onClick={onClose} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-10 shadow-2xl">
            <div className="w-10 h-1 bg-[rgba(107,74,42,0.2)] rounded-full mx-auto mb-6" />
            <h3 className="font-bold text-[#1A1A1A] text-lg mb-5">Edit Profile</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#8A8278] font-medium block mb-1.5">Display Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#E8390E] transition-colors"
                  placeholder="Your name"
                  maxLength={60}
                />
              </div>
              <div>
                <label className="text-xs text-[#8A8278] font-medium block mb-1.5">City</label>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#E8390E] transition-colors"
                  placeholder="e.g. Mumbai, Nagpur..."
                  maxLength={50}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={onClose}
                className="py-3.5 rounded-xl bg-[#F2EFE9] text-[#4A4540] font-semibold text-sm">
                Cancel
              </button>
              <button
                onClick={() => onSave(name, city)}
                disabled={isSaving || !name.trim()}
                className="py-3.5 rounded-xl bg-[#E8390E] text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(232,57,14,0.3)]"
              >
                {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
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
      await updateSession(); // refresh next-auth session
      setShowEdit(false);
    },
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (params.id === "me" && status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pb-28">
        <div className="h-48 bg-[#1A1A1A] animate-pulse" />
        <div className="px-4 pt-4 space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#F2EFE9] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  // ── Unauthenticated "me" ─────────────────────────────────────────────────
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

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pb-28">
        <div className="h-48 bg-[#1A1A1A] animate-pulse" />
        <div className="px-4 pt-4 space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#F2EFE9] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const { user, teams, batting, bowling, recentMatches, awards } = profile;
  const name = user.name ?? "Cricket Player";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const bgColor = getInitialsColor(name);
  const captainTeam = teams.find((t: any) => t.role === "CAPTAIN");
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* ── Hero Banner ── */}
      <div className="bg-[#1A1A1A] pt-12 pb-8 px-4 relative overflow-hidden">
        {/* BG accent blob */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
          style={{ backgroundColor: bgColor, transform: "translate(40%,-40%)", filter: "blur(40px)" }} />

        {/* Back + Edit */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          {isOwnProfile && (
            <button onClick={() => setShowEdit(true)}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Avatar + Info */}
        <div className="flex items-end gap-4 relative z-10">
          {/* Avatar: use Google photo if own profile, otherwise initials */}
          <div className="shrink-0 relative">
            {(isOwnProfile && session?.user?.image) || user.image ? (
              <Image
                src={(isOwnProfile ? session?.user?.image : user.image) ?? ""}
                alt={name}
                width={80}
                height={80}
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

        {/* Quick stats bar */}
        <div className="flex items-center gap-5 mt-5 relative z-10 border-t border-white/10 pt-4">
          <div className="text-center">
            <p className="text-white font-bold text-base">{batting.matches || "—"}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wide">Matches</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-white font-bold text-base">{batting.runs || "—"}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wide">Runs</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-white font-bold text-base">{bowling.wickets || "—"}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wide">Wickets</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-white font-bold text-base">{teams.length || "—"}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wide">Teams</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── Teams ── */}
        {teams.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#8A8278]" /> Teams
              </h2>
            </div>
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
              {teams.map((tm: any) => (
                <Link key={tm.id} href={`/teams/${tm.team.id}`} className="shrink-0">
                  <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-3 flex items-center gap-2.5 min-w-[160px] shadow-sm hover:border-[rgba(107,74,42,0.25)] transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: tm.team.colorHex }}>
                      {tm.team.shortName}
                    </div>
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
        <section className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#E8390E]" />
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Batting</h2>
          </div>
          {batting.matches === 0 ? (
            <div className="py-6 text-center">
              <p className="text-2xl mb-2">🏏</p>
              <p className="text-sm text-[#8A8278]">No batting stats yet — score a match!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Matches" value={batting.matches} />
                <StatBox label="Runs" value={batting.runs} />
                <StatBox label="Avg" value={batting.average > 0 ? batting.average : "—"} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="SR" value={batting.strikeRate > 0 ? `${batting.strikeRate}` : "—"} />
                <StatBox label="4s" value={batting.fours} />
                <StatBox label="6s" value={batting.sixes} />
              </div>
            </div>
          )}
        </section>

        {/* ── Bowling Stats ── */}
        <section className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Bowling</h2>
          </div>
          {bowling.wickets === 0 ? (
            <div className="py-6 text-center">
              <p className="text-2xl mb-2">🎳</p>
              <p className="text-sm text-[#8A8278]">No bowling stats yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="Wickets" value={bowling.wickets} />
              <StatBox label="Economy" value={bowling.economy > 0 ? `${bowling.economy}` : "—"} />
              <StatBox label="Avg" value={bowling.average ?? "—"} />
            </div>
          )}
        </section>

        {/* ── Achievements ── */}
        {awards && awards.length > 0 && (
          <section className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Achievements</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {awards.map((a: any) => (
                <div key={a.id} className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="font-semibold text-xs text-amber-800">{a.title}</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">{a.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Matches ── */}
        {recentMatches && recentMatches.length > 0 && (
          <section>
            <h2 className="font-semibold text-sm text-[#1A1A1A] mb-2">Recent Matches</h2>
            <div className="space-y-2">
              {recentMatches.map((m: any, i: number) => (
                <Link key={i} href={`/match/${m.matchId}`}>
                  <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 flex items-center gap-3 hover:border-[rgba(107,74,42,0.25)] transition-colors shadow-sm">
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
                      m.status === "LIVE" ? "bg-red-50 text-red-700 border border-red-200" :
                      m.status === "COMPLETED" ? "bg-[#F2EFE9] text-[#4A4540]" : "bg-blue-50 text-blue-700"
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

        {/* ── Empty state (no matches at all) ── */}
        {batting.matches === 0 && bowling.wickets === 0 && (!recentMatches || recentMatches.length === 0) && teams.length === 0 && (
          <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-8 text-center shadow-sm">
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

      {/* ── Edit Sheet ── */}
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
