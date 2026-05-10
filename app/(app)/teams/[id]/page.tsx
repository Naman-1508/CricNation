"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crown, Share2, Plus, Trash2, MoreVertical, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";

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

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");

  const { data: team, isLoading, refetch } = trpc.team.getTeam.useQuery({ teamId: params.id });
  const removeMember = trpc.team.removeMember.useMutation({ onSuccess: () => refetch() });
  const addMember = trpc.team.addMember.useMutation({
    onSuccess: () => { refetch(); setShowInviteSheet(false); setInviteName(""); setInvitePhone(""); },
  });

  const isCaptain = team?.members.some(m => m.userId === session?.user?.id && m.role === "CAPTAIN");

  const recentMatches = [
    ...(team?.homeMatches ?? []).map(m => ({ ...m, side: "home" as const })),
    ...(team?.awayMatches ?? []).map(m => ({ ...m, side: "away" as const })),
  ].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pb-28">
        <div className="h-32 bg-[#F2EFE9] animate-pulse" />
        <div className="px-4 pt-4 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#F2EFE9] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!team) return <div className="p-8 text-center text-[#8A8278]">Team not found</div>;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Hero */}
      <div className="relative h-40" style={{ backgroundColor: team.colorHex }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-12 left-4 right-4 flex justify-between items-start z-10">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Team Identity */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] p-4 flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-lg"
            style={{ backgroundColor: team.colorHex }}>
            {team.shortName}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1A1A1A]">{team.name}</h1>
            {team.homeGround && <p className="text-xs text-[#8A8278] mt-0.5">📍 {team.homeGround}</p>}
          </div>
          {isCaptain && (
            <Link href={`/teams/${params.id}/edit`}>
              <button className="text-xs text-[#E8390E] font-medium px-3 py-1.5 border border-[#E8390E]/30 rounded-xl">Edit</button>
            </Link>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Members", value: team.members.length },
            { label: "Matches", value: recentMatches.length },
            { label: "Wins", value: "—" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] p-3 text-center">
              <p className="text-xl font-bold text-[#1A1A1A]">{s.value}</p>
              <p className="text-[10px] text-[#8A8278] uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Members List */}
        <div className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(107,74,42,0.1)]">
            <h2 className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8A8278]" /> Squad ({team.members.length})
            </h2>
            {isCaptain && (
              <button onClick={() => setShowInviteSheet(true)} className="text-xs text-[#E8390E] font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Invite
              </button>
            )}
          </div>

          {team.members.map((member, i) => (
            <div key={member.id} className={`flex items-center gap-3 px-4 py-3 ${i < team.members.length - 1 ? "border-b border-[rgba(107,74,42,0.07)]" : ""}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm text-white"
                style={{ backgroundColor: team.colorHex }}>
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-[#1A1A1A] truncate">{member.name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLORS[member.role]}`}>
                    {ROLE_LABELS[member.role]}
                  </span>
                </div>
                {member.jerseyNo && <p className="text-xs text-[#8A8278]">#{member.jerseyNo}</p>}
              </div>
              {isCaptain && member.userId !== session?.user?.id && (
                <button onClick={() => removeMember.mutate({ memberId: member.id })}
                  className="text-red-400 p-1 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Recent Matches */}
        <div className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(107,74,42,0.1)]">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Recent Matches</h2>
          </div>
          {recentMatches.length === 0 ? (
            <div className="py-10 text-center text-[#8A8278] text-sm">No matches played yet</div>
          ) : recentMatches.map((m, i) => (
            <div key={m.id} className={`flex items-center gap-3 px-4 py-3 ${i < recentMatches.length - 1 ? "border-b border-[rgba(107,74,42,0.07)]" : ""}`}>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  vs {m.side === "home" ? (m as any).awayTeam?.name : (m as any).homeTeam?.name}
                </p>
                <p className="text-xs text-[#8A8278]">{new Date(m.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8A8278]" />
            </div>
          ))}
        </div>

        {/* Start Match CTA */}
        <Link href={`/score?homeTeamId=${params.id}`}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full bg-[#E8390E] text-white font-semibold py-4 rounded-xl shadow-[0_4px_16px_rgba(232,57,14,0.35)] flex items-center justify-center gap-2"
          >
            🏏 Start a Match with this Team
          </motion.button>
        </Link>
      </div>

      {/* Invite Sheet */}
      <AnimatePresence>
        {showInviteSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40" onClick={() => setShowInviteSheet(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6">
              <div className="w-10 h-1 bg-[rgba(107,74,42,0.2)] rounded-full mx-auto mb-5" />
              <h3 className="font-bold text-[#1A1A1A] text-lg mb-4">Invite Player</h3>
              <div className="space-y-3">
                <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Player name *"
                  className="w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#E8390E]" />
                <input value={invitePhone} onChange={e => setInvitePhone(e.target.value)} placeholder="Phone number (for invite link)"
                  className="w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#E8390E]" type="tel" />
                <button onClick={() => addMember.mutate({ teamId: params.id, name: inviteName, phone: invitePhone || undefined })}
                  disabled={!inviteName.trim() || addMember.isPending}
                  className="w-full bg-[#E8390E] text-white font-semibold py-3.5 rounded-xl disabled:opacity-40">
                  {addMember.isPending ? "Adding..." : "Add to Team"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
