"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Crown, ChevronRight, Shield, Star } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26, delay } },
});

function RoleBadge({ role }: { role: string }) {
  if (role === "CAPTAIN") return (
    <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
      <Crown className="w-2.5 h-2.5" /> C
    </span>
  );
  if (role === "VICE_CAPTAIN") return (
    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0">VC</span>
  );
  return null;
}

export default function TeamsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: teams, isLoading } = trpc.team.getMyTeams.useQuery(
    undefined,
    { enabled: !!session?.user }
  );

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-6xl mb-5"
        >🏏</motion.div>
        <h2 className="text-2xl font-black text-white mb-2">Join the Field</h2>
        <p className="text-white/40 text-sm mb-8 max-w-xs leading-relaxed">
          Sign in to create your team, add players, and start competing.
        </p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.push("/login")}
          className="bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold px-8 py-4 rounded-2xl shadow-[0_4px_24px_rgba(232,57,14,0.4)] btn-native text-sm">
          Sign In
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A]">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <motion.div {...fadeUp(0)} className="relative z-10 px-5 pt-14 pb-5 border-b border-white/6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-0.5">My Squad</p>
            <h1 className="text-2xl font-black text-white">Teams</h1>
          </div>
          <Link href="/teams/new">
            <motion.div
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              className="w-11 h-11 bg-gradient-to-br from-[#E8390E] to-[#C42E09] rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(232,57,14,0.4)] btn-native"
            >
              <Plus className="w-5 h-5 text-white" strokeWidth={2.8} />
            </motion.div>
          </Link>
        </div>
        {teams && teams.length > 0 && (
          <p className="text-white/35 text-xs mt-1.5">
            {teams.length} team{teams.length !== 1 ? "s" : ""} · {teams.reduce((a: number, t: any) => a + (t.memberCount || 0), 0)} players
          </p>
        )}
      </motion.div>

      <div className="relative z-10 px-4 pt-4 pb-nav space-y-3">
        {/* Loading skeletons */}
        {isLoading && [...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}

        {/* Empty state */}
        {!isLoading && (!teams || teams.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 text-center mt-8"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-4"
            >🛡️</motion.div>
            <h2 className="text-xl font-black text-white mb-2">No Teams Yet</h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              Build your squad, pick your colors, and start your cricket journey.
            </p>
            <Link href="/teams/new">
              <motion.button whileTap={{ scale: 0.96 }}
                className="bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold px-8 py-4 rounded-2xl text-sm shadow-[0_4px_16px_rgba(232,57,14,0.35)] btn-native">
                Create Your First Team
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Team cards */}
        <AnimatePresence>
          {teams && teams.map((team: any, i: number) => (
            <motion.div key={team.id} {...fadeUp(i * 0.07)}>
              <Link href={`/teams/${team.id}`}>
                <motion.div
                  whileTap={{ scale: 0.975 }}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4 btn-native active:bg-white/6 transition-colors"
                >
                  {/* Team badge */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-lg"
                    style={{ backgroundColor: team.colorHex }}
                  >
                    <div>
                      <div className="text-center text-sm font-black">{team.shortName}</div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate text-base">{team.name}</h3>
                      <RoleBadge role={team.myRole} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {team.memberCount} player{team.memberCount !== 1 ? "s" : ""}
                      </span>
                      {team.homeGround && (
                        <span className="flex items-center gap-1 truncate">
                          <span>📍</span>
                          <span className="truncate">{team.homeGround}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add another team */}
        {teams && teams.length > 0 && (
          <motion.div {...fadeUp(teams.length * 0.07 + 0.05)}>
            <Link href="/teams/new">
              <motion.div whileTap={{ scale: 0.97 }}
                className="rounded-2xl border-2 border-dashed border-white/10 p-4 flex items-center justify-center gap-2 text-white/30 hover:border-[#E8390E]/40 hover:text-[#E8390E]/60 transition-colors btn-native">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-semibold">Create Another Team</span>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
