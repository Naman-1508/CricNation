"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Crown, Share2, Plus, Trash2, Users,
  ChevronRight, Search, UserCheck, X, Check, MapPin, Trophy
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import Image from "next/image";

const ROLE_LABELS: Record<string, string> = {
  CAPTAIN: "👑 Captain",
  VICE_CAPTAIN: "VC",
  PLAYER: "Player",
};
const ROLE_COLORS: Record<string, string> = {
  CAPTAIN: "text-amber-700 bg-amber-50 border-amber-200",
  VICE_CAPTAIN: "text-blue-700 bg-blue-50 border-blue-200",
  PLAYER: "text-[#4A4540] bg-[#F2EFE9] border-[rgba(107,74,42,0.2)]",
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Add Player Sheet with search ─────────────────────────────────────────────
function InvitePlayerSheet({
  teamId,
  onClose,
  onSuccess,
}: {
  teamId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"search" | "manual">("search");
  const [manualName, setManualName] = useState("");
  const [role, setRole] = useState<"PLAYER" | "VICE_CAPTAIN" | "CAPTAIN">("PLAYER");
  const [jerseyNo, setJerseyNo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isFetching } = trpc.user.search.useQuery(
    { query },
    { enabled: query.length >= 2 }
  );
  const addMember = trpc.team.addMember.useMutation({ onSuccess });

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  const handleAdd = (name: string) => {
    addMember.mutate({
      teamId,
      name,
      role,
      jerseyNo: jerseyNo ? parseInt(jerseyNo) : undefined,
    });
  };

  const inputClass = "w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#E8390E] transition-colors";

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl pb-8"
      >
        <div className="w-10 h-1 bg-[rgba(107,74,42,0.2)] rounded-full mx-auto mt-4 mb-4" />
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1A1A1A] text-lg">Add Player</h3>
            <button onClick={onClose} className="w-8 h-8 bg-[#F2EFE9] rounded-lg flex items-center justify-center">
              <X className="w-4 h-4 text-[#4A4540]" />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex bg-[#F2EFE9] rounded-xl p-1 mb-4">
            <button onClick={() => setMode("search")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${mode === "search" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8A8278]"}`}>
              <Search className="w-3.5 h-3.5" /> Find on CricNation
            </button>
            <button onClick={() => setMode("manual")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${mode === "manual" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8A8278]"}`}>
              <Plus className="w-3.5 h-3.5" /> Add Manually
            </button>
          </div>

          {mode === "search" ? (
            <div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full bg-[#F2EFE9] rounded-xl py-3 pl-9 pr-4 text-sm focus:outline-none"
                />
              </div>

              <div className="max-h-52 overflow-y-auto rounded-xl border border-[rgba(107,74,42,0.1)]">
                {isFetching && <div className="py-5 flex justify-center"><div className="w-5 h-5 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" /></div>}

                {!isFetching && query.length >= 2 && (!results || results.length === 0) && (
                  <div className="py-5 text-center px-4">
                    <p className="text-sm text-[#8A8278] mb-2">No users found</p>
                    <button onClick={() => { setMode("manual"); setManualName(query); }}
                      className="text-sm text-[#E8390E] font-semibold">
                      Add "{query}" manually instead →
                    </button>
                  </div>
                )}

                {results?.map(user => (
                  <button key={user.id}
                    onClick={() => handleAdd(user.name ?? "Player")}
                    disabled={addMember.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F2EFE9] transition-colors border-b border-[rgba(107,74,42,0.06)] last:border-0 text-left">
                    {user.image ? (
                      <Image src={user.image} alt={user.name ?? ""} width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#E8390E]/10 flex items-center justify-center text-sm font-bold text-[#E8390E]">
                        {getInitials(user.name ?? "?")}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#1A1A1A] truncate">{user.name}</p>
                      <p className="text-xs text-[#8A8278] truncate">{user.email}</p>
                    </div>
                    <UserCheck className="w-4 h-4 text-[#E8390E] shrink-0" />
                  </button>
                ))}

                {query.length < 2 && (
                  <div className="py-6 text-center text-sm text-[#8A8278]">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                autoFocus
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="Player name *"
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1 font-medium">Jersey #</label>
                  <input
                    value={jerseyNo}
                    onChange={e => setJerseyNo(e.target.value)}
                    placeholder="e.g. 18"
                    type="number"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1 font-medium">Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className={inputClass}
                  >
                    <option value="PLAYER">Player</option>
                    <option value="VICE_CAPTAIN">Vice Captain</option>
                    <option value="CAPTAIN">Captain</option>
                  </select>
                </div>
              </div>
              <button
                disabled={!manualName.trim() || addMember.isPending}
                onClick={() => handleAdd(manualName.trim())}
                className="w-full bg-[#E8390E] text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(232,57,14,0.3)]"
              >
                {addMember.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Plus className="w-4 h-4" /> Add Player</>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showInvite, setShowInvite] = useState(false);

  const { data: team, isLoading, refetch } = trpc.team.getTeam.useQuery({ teamId: params.id });
  const removeMember = trpc.team.removeMember.useMutation({ onSuccess: () => refetch() });

  const isCaptain = team?.members.some(m => m.userId === session?.user?.id && m.role === "CAPTAIN");

  const recentMatches = [
    ...(team?.homeMatches ?? []).map(m => ({ ...m, side: "home" as const })),
    ...(team?.awayMatches ?? []).map(m => ({ ...m, side: "away" as const })),
  ].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, 5);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: team?.name, text: `Join my cricket team ${team?.name} on CricNation!`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pb-28">
        <div className="h-40 bg-[#F2EFE9] animate-pulse" />
        <div className="px-4 pt-4 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#F2EFE9] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!team) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-3">🏏</p>
        <p className="font-semibold text-[#1A1A1A]">Team not found</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* ── Hero Banner ── */}
      <div className="relative h-44" style={{ backgroundColor: team.colorHex }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />

        <div className="absolute top-12 left-4 right-4 flex justify-between items-start z-10">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Team name on banner */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h1 className="text-2xl font-black text-white drop-shadow-md">{team.name}</h1>
          {team.homeGround && (
            <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {team.homeGround}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        {/* Team Identity Card */}
        <div className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] p-4 flex items-center gap-4 mb-4 shadow-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shrink-0"
            style={{ backgroundColor: team.colorHex }}>
            {team.shortName}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8A8278] font-medium">Founded</p>
            <p className="font-semibold text-sm text-[#1A1A1A]">
              {new Date(team.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
            <p className="text-xs text-[#8A8278] mt-0.5">by {team.createdBy?.name}</p>
          </div>
          {isCaptain && (
            <Link href={`/teams/${params.id}/edit`}>
              <button className="text-xs text-[#E8390E] font-semibold px-3 py-1.5 border border-[#E8390E]/30 rounded-xl">
                Edit
              </button>
            </Link>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Members", value: team.members.length },
            { label: "Matches", value: recentMatches.length },
            { label: "Wins", value: "—" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-[#1A1A1A]">{s.value}</p>
              <p className="text-[10px] text-[#8A8278] uppercase tracking-wide mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Squad ── */}
        <div className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] mb-4 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(107,74,42,0.08)]">
            <h2 className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8A8278]" /> Squad ({team.members.length})
            </h2>
            {isCaptain && (
              <button onClick={() => setShowInvite(true)}
                className="text-xs text-[#E8390E] font-semibold flex items-center gap-1 bg-[#E8390E]/5 px-3 py-1.5 rounded-lg">
                <Plus className="w-3.5 h-3.5" /> Add Player
              </button>
            )}
          </div>

          {team.members.map((member, i) => (
            <motion.div key={member.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-4 py-3 ${i < team.members.length - 1 ? "border-b border-[rgba(107,74,42,0.06)]" : ""}`}
            >
              {/* Avatar */}
              {member.user?.image ? (
                <Image src={member.user.image} alt={member.name} width={40} height={40}
                  className="w-10 h-10 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                  style={{ backgroundColor: team.colorHex }}>
                  {getInitials(member.name)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-[#1A1A1A] truncate">{member.name}</p>
                  {member.userId && (
                    <span className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-green-600" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLORS[member.role]}`}>
                    {ROLE_LABELS[member.role]}
                  </span>
                  {member.jerseyNo && <span className="text-xs text-[#8A8278]">#{member.jerseyNo}</span>}
                </div>
              </div>

              {isCaptain && member.userId !== session?.user?.id && (
                <button
                  onClick={() => { if (confirm(`Remove ${member.name}?`)) removeMember.mutate({ memberId: member.id }); }}
                  className="text-red-400 p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Recent Matches ── */}
        <div className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] mb-4 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(107,74,42,0.08)]">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Recent Matches</h2>
          </div>
          {recentMatches.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-2xl mb-2">🏏</p>
              <p className="text-sm text-[#8A8278]">No matches played yet</p>
            </div>
          ) : recentMatches.map((m, i) => (
            <Link key={m.id} href={`/match/${m.id}`}>
              <div className={`flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF8] transition-colors ${i < recentMatches.length - 1 ? "border-b border-[rgba(107,74,42,0.06)]" : ""}`}>
                <div className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center text-lg shrink-0">🏏</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    vs {m.side === "home" ? (m as any).awayTeam?.name : (m as any).homeTeam?.name}
                  </p>
                  <p className="text-xs text-[#8A8278]">
                    {new Date(m.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A8278]" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Start Match CTA ── */}
        <Link href={`/score?homeTeamId=${params.id}`}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm"
            style={{ background: `linear-gradient(135deg, ${team.colorHex} 0%, ${team.colorHex}cc 100%)` }}
          >
            🏏 Start a Match with {team.shortName}
          </motion.button>
        </Link>
      </div>

      {/* ── Invite Sheet ── */}
      <AnimatePresence>
        {showInvite && (
          <InvitePlayerSheet
            teamId={params.id}
            onClose={() => setShowInvite(false)}
            onSuccess={() => { refetch(); setShowInvite(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
