"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Share2, Check, ChevronRight, Shield } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";

const FORMAT_COLORS: Record<string, string> = {
  T10: "bg-purple-50 text-purple-700 border-purple-200",
  T20: "bg-blue-50 text-blue-700 border-blue-200",
  ODI: "bg-green-50 text-green-700 border-green-200",
  TEST: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS: Record<string, { pill: string; dot: string; label: string }> = {
  UPCOMING:  { pill: "bg-blue-50 text-blue-700 border border-blue-200",        dot: "bg-blue-400",               label: "Upcoming"  },
  LIVE:      { pill: "bg-red-50 text-red-700 border border-red-200",           dot: "bg-[#E8390E] animate-pulse", label: "Live"      },
  COMPLETED: { pill: "bg-[#F2EFE9] text-[#4A4540] border border-[rgba(107,74,42,0.15)]", dot: "bg-[#8A8278]",  label: "Completed" },
};

const TABS = ["Teams", "Matches", "Points Table"];

export default function TournamentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [tab, setTab] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const { data: tournament, isLoading, refetch } = trpc.tournament.getById.useQuery({ id });
  const { data: myTeams } = trpc.team.getMyTeams.useQuery(undefined, { enabled: !!session });
  const register = trpc.tournament.register.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-3">
        <div className="text-5xl">🏆</div>
        <p className="font-semibold text-[#1A1A1A]">Tournament not found</p>
        <button onClick={() => router.back()} className="text-[#E8390E] text-sm font-medium">Go back</button>
      </div>
    );
  }

  const st = STATUS[tournament.status] ?? STATUS.UPCOMING;
  const approvedTeams = (tournament.registrations ?? []).filter((r: any) => r.status === "APPROVED");
  const registeredCount = tournament._count?.registrations ?? tournament.registrations?.length ?? 0;
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/tournaments/join/${(tournament as any).shareCode ?? ""}`;

  // Simple points table from approved teams + matches
  const pointsTable = approvedTeams.map((reg: any) => {
    const tm = (tournament.matches ?? []).filter(
      (m: any) => m.homeTeamId === reg.teamId || m.awayTeamId === reg.teamId
    );
    const won = tm.filter((m: any) => m.status === "COMPLETED" && (m.result ?? "").includes(reg.team?.name ?? "___")).length;
    return { team: reg.team, played: tm.length, won, lost: tm.length - won, pts: won * 2 };
  }).sort((a: any, b: any) => b.pts - a.pts);

  const myCaptainTeams = (myTeams ?? []).filter((t: any) => t.myRole === "CAPTAIN");

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Dark Hero */}
      <div className="bg-[#1A1A1A] px-4 pt-12 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8390E]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex items-center justify-between mb-5 relative z-10">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <button
            onClick={() => {
              const nav = navigator as any;
              nav.share?.({ title: tournament.name, url: shareUrl }).catch(() => navigator.clipboard?.writeText(shareUrl));
            }}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="relative z-10">
          <div className="w-14 h-14 bg-[#E8390E] rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{tournament.name}</h1>
          <p className="text-white/50 text-sm mb-3">by {(tournament as any).organizer?.name ?? "Organizer"}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${FORMAT_COLORS[tournament.format] ?? "bg-[#F2EFE9] text-[#4A4540]"}`}>
              {tournament.format}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${st.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${st.dot}`} />
              {st.label}
            </span>
            {tournament.entryFee === 0
              ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200">Free Entry</span>
              : <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">₹{tournament.entryFee}</span>
            }
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.1)] px-4 py-4 grid grid-cols-3 divide-x divide-[rgba(107,74,42,0.1)] text-center">
        <div><p className="text-xl font-bold text-[#1A1A1A]">{registeredCount}</p><p className="text-[10px] text-[#8A8278] uppercase tracking-wide">Teams</p></div>
        <div><p className="text-xl font-bold text-[#1A1A1A]">{tournament.matches?.length ?? 0}</p><p className="text-[10px] text-[#8A8278] uppercase tracking-wide">Matches</p></div>
        <div><p className="text-xl font-bold text-[#1A1A1A]">{tournament.maxTeams ?? "∞"}</p><p className="text-[10px] text-[#8A8278] uppercase tracking-wide">Max Teams</p></div>
      </div>

      {/* Register CTA */}
      {tournament.registrationOpen && session && myCaptainTeams.length > 0 && (
        <div className="px-4 pt-4">
          <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4">
            <p className="font-semibold text-sm text-[#1A1A1A] mb-3">Register Your Team</p>
            <div className="space-y-2 mb-3 max-h-44 overflow-y-auto">
              {myCaptainTeams.map((team: any) => {
                const already = (tournament.registrations ?? []).some((r: any) => r.teamId === team.id);
                return (
                  <button key={team.id} onClick={() => !already && setSelectedTeamId(team.id)} disabled={already}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedTeamId === team.id ? "border-[#E8390E] bg-[#E8390E]/5"
                      : already ? "border-green-200 bg-green-50 cursor-default"
                      : "border-[rgba(107,74,42,0.15)] hover:border-[#E8390E]/40"
                    }`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0" style={{ backgroundColor: team.colorHex }}>
                      {team.shortName}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#1A1A1A]">{team.name}</p>
                      <p className="text-xs text-[#8A8278]">{team.memberCount} members</p>
                    </div>
                    {already
                      ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Registered</span>
                      : selectedTeamId === team.id && <Check className="w-4 h-4 text-[#E8390E]" />
                    }
                  </button>
                );
              })}
            </div>
            <motion.button whileTap={{ scale: 0.97 }}
              disabled={!selectedTeamId || register.isPending}
              onClick={() => selectedTeamId && register.mutate({ tournamentId: tournament.id, teamId: selectedTeamId })}
              className="w-full bg-[#E8390E] text-white font-semibold py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 text-sm shadow-[0_4px_12px_rgba(232,57,14,0.3)]">
              {register.isPending
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</>
                : "Register Selected Team"}
            </motion.button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-1 bg-[#F2EFE9] p-1 rounded-xl">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === i ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8A8278]"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-2 space-y-3">
        {/* Teams tab */}
        {tab === 0 && (
          approvedTeams.length === 0
            ? <div className="py-16 flex flex-col items-center gap-3 text-center">
                <Shield className="w-12 h-12 text-[#E8390E]/20" />
                <p className="font-semibold text-[#1A1A1A]">No teams registered yet</p>
                <p className="text-sm text-[#8A8278]">Be the first to register above!</p>
              </div>
            : approvedTeams.map((reg: any, i: number) => (
                <Link href={`/teams/${reg.teamId}`} key={reg.teamId}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                      style={{ backgroundColor: reg.team?.colorHex ?? "#E8390E" }}>
                      {reg.team?.shortName ?? "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#1A1A1A]">{reg.team?.name ?? "Team"}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8A8278]" />
                  </motion.div>
                </Link>
              ))
        )}

        {/* Matches tab */}
        {tab === 1 && (
          !tournament.matches || tournament.matches.length === 0
            ? <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="text-5xl">🏏</div>
                <p className="font-semibold text-[#1A1A1A]">No matches yet</p>
                <p className="text-sm text-[#8A8278]">Matches will appear here once scheduled</p>
              </div>
            : tournament.matches.map((m: any, i: number) => (
                <Link href={`/match/${m.id}`} key={m.id}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === "LIVE" ? "bg-red-50 text-red-700"
                        : m.status === "COMPLETED" ? "bg-[#F2EFE9] text-[#8A8278]"
                        : "bg-blue-50 text-blue-700"}`}>
                        {m.status === "LIVE" ? "● LIVE" : m.status}
                      </span>
                      <span className="text-xs text-[#8A8278]">
                        {m.startTime ? new Date(m.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "TBD"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-[10px]"
                          style={{ backgroundColor: m.homeTeam?.colorHex ?? "#E8390E" }}>
                          {m.homeTeam?.shortName ?? "H"}
                        </div>
                        <span className="font-medium text-sm text-[#1A1A1A]">{m.homeTeam?.name ?? "Home"}</span>
                      </div>
                      <span className="text-xs font-bold text-[#8A8278] bg-[#F2EFE9] px-2 py-1 rounded-lg">VS</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-[#1A1A1A]">{m.awayTeam?.name ?? "Away"}</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-[10px]"
                          style={{ backgroundColor: m.awayTeam?.colorHex ?? "#1A1A1A" }}>
                          {m.awayTeam?.shortName ?? "A"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
        )}

        {/* Points Table tab */}
        {tab === 2 && (
          pointsTable.length === 0
            ? <div className="py-16 flex flex-col items-center gap-3 text-center">
                <Trophy className="w-12 h-12 text-[#E8390E]/20" />
                <p className="font-semibold text-[#1A1A1A]">No standings yet</p>
                <p className="text-sm text-[#8A8278]">Points will appear once matches begin</p>
              </div>
            : <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-7 gap-1 px-4 py-2.5 bg-[#F2EFE9] text-[10px] text-[#8A8278] font-bold uppercase tracking-wide">
                  <div className="col-span-3">Team</div>
                  <div className="text-center">P</div>
                  <div className="text-center">W</div>
                  <div className="text-center">L</div>
                  <div className="text-center">Pts</div>
                </div>
                {pointsTable.map((row: any, i: number) => (
                  <div key={row.team?.id ?? i}
                    className={`grid grid-cols-7 gap-1 px-4 py-3 items-center ${i !== 0 ? "border-t border-[rgba(107,74,42,0.08)]" : ""}`}>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8A8278] w-4">{i + 1}</span>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[9px]"
                        style={{ backgroundColor: row.team?.colorHex ?? "#E8390E" }}>
                        {row.team?.shortName ?? "?"}
                      </div>
                      <span className="font-medium text-xs text-[#1A1A1A] truncate">{row.team?.name ?? "Team"}</span>
                    </div>
                    <div className="text-center text-xs text-[#8A8278]">{row.played}</div>
                    <div className="text-center text-xs text-green-700 font-semibold">{row.won}</div>
                    <div className="text-center text-xs text-[#E8390E] font-semibold">{row.lost}</div>
                    <div className="text-center text-sm font-bold text-[#1A1A1A]">{row.pts}</div>
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  );
}
