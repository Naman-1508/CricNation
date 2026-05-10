"use client";

import { motion } from "framer-motion";
import { Plus, Users, Crown, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

function TeamColorBadge({ color, shortName }: { color: string; shortName: string }) {
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm shrink-0"
      style={{ backgroundColor: color }}
    >
      {shortName}
    </div>
  );
}

import { useSession } from "next-auth/react";

export default function TeamsPage() {
  const { data: session } = useSession();
  const { data: teams, isLoading } = trpc.team.getMyTeams.useQuery(undefined, { enabled: !!session?.user });

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.13)] px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">My Teams</h1>
          <p className="text-sm text-[#8A8278] mt-0.5">{teams?.length ?? 0} team{teams?.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/teams/new">
          <motion.div
            whileTap={{ scale: 0.93 }}
            className="w-10 h-10 bg-[#E8390E] rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(232,57,14,0.35)]"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </motion.div>
        </Link>
      </div>

      <div className="px-4 pt-5 space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] p-4 h-20 animate-pulse" />
          ))
        ) : !teams || teams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-24 text-center px-6"
          >
            <div className="text-6xl mb-4">🏏</div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">No teams yet</h2>
            <p className="text-[#8A8278] text-sm mb-6 leading-relaxed">
              Create your team, add players, and start competing in tournaments.
            </p>
            <Link href="/teams/new">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="bg-[#E8390E] text-white font-semibold px-8 py-3.5 rounded-xl shadow-[0_4px_16px_rgba(232,57,14,0.35)]"
              >
                Create Your Team
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          teams.map((team, i) => (
            <Link href={`/teams/${team.id}`} key={team.id}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] p-4 flex items-center gap-4 hover:border-[rgba(107,74,42,0.25)] transition-colors"
              >
                <TeamColorBadge color={team.colorHex} shortName={team.shortName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-[#1A1A1A] truncate">{team.name}</h3>
                    {team.myRole === "CAPTAIN" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                        <Crown className="w-3 h-3" /> Captain
                      </span>
                    )}
                    {team.myRole === "VICE_CAPTAIN" && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                        Vice Captain
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#8A8278]">
                    <Users className="w-3 h-3" />
                    {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                    {team.homeGround && <span className="ml-2">📍 {team.homeGround}</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A8278] shrink-0" />
              </motion.div>
            </Link>
          ))
        )}

        {teams && teams.length > 0 && (
          <Link href="/teams/new">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl border-2 border-dashed border-[rgba(107,74,42,0.2)] p-4 flex items-center justify-center gap-2 text-[#8A8278] hover:border-[#E8390E] hover:text-[#E8390E] transition-colors mt-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Create Another Team</span>
            </motion.div>
          </Link>
        )}
      </div>
    </div>
  );
}
