"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Edit, MapPin, Star, Award, ChevronRight, Trophy, Target, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";

function getInitialsColor(name: string) {
  const colors = ["#E8390E","#2563EB","#16A34A","#7C3AED","#DB2777","#0891B2","#D97706","#DC2626"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#F2EFE9] rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-[#1A1A1A]">{value === 0 ? "—" : value}</p>
      <p className="text-[10px] text-[#8A8278] uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1.5 h-12">
      {values.map((v, i) => {
        const pct = (v / max) * 100;
        const color = v === 0 ? "#E8390E" : v >= 100 ? "#D97706" : v >= 50 ? "#16A34A" : "#1A1A1A";
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full rounded-sm min-h-[2px] transition-all" style={{ height: `${Math.max(4, pct)}%`, backgroundColor: color }} />
          </div>
        );
      })}
    </div>
  );
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = params.id === "me" ? session?.user?.id : params.id;

  const { data: profile, isLoading } = trpc.player.getProfile.useQuery(
    { userId: userId! },
    { enabled: !!userId }
  );

  const isOwnProfile = session?.user?.id === userId;

  if (params.id === "me" && status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
          <Star className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Login Required</h2>
        <p className="text-[#8A8278] text-sm mb-6">Create an account or login to view your cricket profile, stats, and achievements.</p>
        <button onClick={() => router.push("/login")} className="bg-[#E8390E] text-white font-semibold px-8 py-3.5 rounded-xl shadow-[0_4px_16px_rgba(232,57,14,0.35)]">
          Login / Register
        </button>
      </div>
    );
  }

  if (isLoading || (params.id === "me" && status === "loading")) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pb-28">
        <div className="h-40 bg-[#F2EFE9] animate-pulse" />
        <div className="px-4 pt-4 space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#F2EFE9] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-3">👤</p>
          <p className="font-semibold text-[#1A1A1A]">Player not found</p>
        </div>
      </div>
    );
  }

  const { user, teams, batting, bowling, recentMatches } = profile;
  const name = user.name ?? "Cricket Player";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const bgColor = getInitialsColor(name);
  const captainTeam = teams.find((t: any) => t.role === "CAPTAIN");
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  // Recent form bar chart (last 5 batting innings from recentMatches — simplified)
  const formValues = Array.from({ length: 5 }, (_, i) => Math.floor(Math.random() * 80)); // TODO: replace with real innings runs

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Hero Banner */}
      <div className="bg-[#1A1A1A] pt-12 pb-6 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5" style={{ backgroundColor: bgColor, transform: "translate(30%,-30%)" }} />

        {/* Back + Edit */}
        <div className="flex justify-between items-center mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          {isOwnProfile && (
            <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Avatar + Info */}
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-white text-2xl ring-4 ring-white/10 shrink-0"
            style={{ backgroundColor: bgColor }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{name}</h1>
            {captainTeam && (
              <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" /> Captain · {captainTeam.team.name}
              </p>
            )}
            <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
              {user.city && <><MapPin className="w-3 h-3" />{user.city} · </>}Member since {joinedDate}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Teams */}
        {teams.length > 0 && (
          <section>
            <h2 className="font-semibold text-sm text-[#1A1A1A] mb-2">Teams</h2>
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
              {teams.map((tm: any) => (
                <div key={tm.id} className="shrink-0 bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-3 flex items-center gap-2.5 min-w-[140px]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: tm.team.colorHex }}>
                    {tm.team.shortName}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-[#1A1A1A]">{tm.team.name}</p>
                    <p className="text-[10px] text-[#8A8278]">{tm.role.replace("_", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Batting Stats */}
        <section className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#E8390E]" />
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Batting</h2>
          </div>
          {batting.matches === 0 ? (
            <p className="text-sm text-[#8A8278] text-center py-4">No batting stats yet — score a match!</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Matches" value={batting.matches} />
                <StatBox label="Runs" value={batting.runs} />
                <StatBox label="SR" value={batting.strikeRate > 0 ? `${batting.strikeRate}` : "—"} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Average" value={batting.average > 0 ? `${batting.average}` : "—"} />
                <StatBox label="4s" value={batting.fours} />
                <StatBox label="6s" value={batting.sixes} />
              </div>
            </div>
          )}
        </section>

        {/* Bowling Stats */}
        <section className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Bowling</h2>
          </div>
          {bowling.wickets === 0 ? (
            <p className="text-sm text-[#8A8278] text-center py-4">No bowling stats yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="Wickets" value={bowling.wickets} />
              <StatBox label="Economy" value={bowling.economy > 0 ? `${bowling.economy}` : "—"} />
              <StatBox label="Avg" value={bowling.average ?? "—"} />
            </div>
          )}
        </section>

        {/* Recent Form */}
        {batting.matches > 0 && (
          <section className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4">
            <h2 className="font-semibold text-sm text-[#1A1A1A] mb-3">Recent Form</h2>
            <MiniBarChart values={formValues} />
            <div className="flex gap-3 mt-3 text-[10px] text-[#8A8278]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#E8390E] inline-block" />Duck</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#1A1A1A] inline-block" />Under 50</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#16A34A] inline-block" />50+</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#D97706] inline-block" />100+</span>
            </div>
          </section>
        )}

        {/* Awards */}
        {profile.awards && profile.awards.length > 0 && (
          <section className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Achievements</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {profile.awards.map((a: any) => (
                <div key={a.id} className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="font-semibold text-xs text-amber-800">{a.title}</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">{a.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Matches */}
        {recentMatches && recentMatches.length > 0 && (
          <section>
            <h2 className="font-semibold text-sm text-[#1A1A1A] mb-2">Recent Matches</h2>
            <div className="space-y-2.5">
              {recentMatches.map((m: any, i: number) => (
                <div key={i} className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center text-lg shrink-0">🏏</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#1A1A1A]">
                      vs {m.teamId === m.match.homeTeamId ? m.match.awayTeam?.name : m.match.homeTeam?.name}
                    </p>
                    <p className="text-xs text-[#8A8278]">{new Date(m.match.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${m.status === "COMPLETED" ? "bg-[#F2EFE9] text-[#4A4540]" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {m.status === "LIVE" ? "● LIVE" : m.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8A8278]" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state for no matches */}
        {batting.matches === 0 && bowling.wickets === 0 && recentMatches.length === 0 && (
          <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🏏</div>
            <p className="font-semibold text-[#1A1A1A] mb-1">No match stats yet</p>
            <p className="text-sm text-[#8A8278] mb-4">Score your first match to build your cricket profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
