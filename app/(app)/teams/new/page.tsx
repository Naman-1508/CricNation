"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, Check, ChevronRight,
  Search, User, Crown, UserCheck,
} from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";

// ─── Color presets ─────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  "#E8390E","#F5A623","#2563EB","#16A34A","#7C3AED",
  "#DB2777","#0891B2","#DC2626","#059669","#D97706",
  "#1D4ED8","#111827",
];

type Player = {
  name: string;
  userId?: string;
  image?: string;
  role: "PLAYER" | "VICE_CAPTAIN" | "CAPTAIN";
  jerseyNo: string;
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8390E] transition-colors";

// ─── Player Search Sheet ──────────────────────────────────────────────────────
function PlayerSearchSheet({
  onSelect, onClose,
}: {
  onSelect: (p: { id: string; name: string; image?: string | null }) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [manualName, setManualName] = useState("");
  const [mode, setMode] = useState<"search" | "manual">("search");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isFetching } = trpc.user.search.useQuery(
    { query }, { enabled: query.length >= 2 }
  );

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-3xl z-50 max-h-[75vh] flex flex-col"
      >
        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-4 mb-3 shrink-0" />

        {/* Tab toggle */}
        <div className="flex px-4 gap-2 mb-3 shrink-0">
          {(["search", "manual"] as const).map(m => (
            <motion.button key={m} whileTap={{ scale: 0.95 }}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all btn-native flex items-center justify-center gap-1.5 ${
                mode === m
                  ? "bg-[#E8390E] text-white"
                  : "bg-white/5 text-white/40 border border-white/8"
              }`}
            >
              {m === "search" ? <><Search className="w-3 h-3" /> Find on CricNation</> : <><Plus className="w-3 h-3" /> Add Manually</>}
            </motion.button>
          ))}
        </div>

        {mode === "search" ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-4 pb-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8390E] transition-colors"
                />
                {isFetching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" />
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-2">
              {query.length < 2 && (
                <div className="py-8 text-center text-white/25 text-sm">
                  <div className="text-3xl mb-2">🔍</div>
                  Type at least 2 characters to search
                </div>
              )}
              {!isFetching && query.length >= 2 && results?.length === 0 && (
                <div className="py-6 text-center text-white/35 text-sm">
                  No users found for &ldquo;{query}&rdquo;
                  <motion.button whileTap={{ scale: 0.96 }}
                    onClick={() => { setMode("manual"); setManualName(query); }}
                    className="block w-full mt-3 text-[#E8390E] font-semibold text-sm btn-native"
                  >
                    Add &ldquo;{query}&rdquo; manually →
                  </motion.button>
                </div>
              )}
              {results?.map(u => (
                <motion.button
                  key={u.id} whileTap={{ scale: 0.97 }}
                  onClick={() => onSelect({ id: u.id, name: u.name ?? "Player", image: u.image })}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/4 hover:bg-white/8 border border-white/8 transition-colors text-left btn-native"
                >
                  {u.image ? (
                    <img src={u.image} alt={u.name ?? ""} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#E8390E]/10 flex items-center justify-center text-sm font-bold text-[#E8390E]">
                      {getInitials(u.name ?? "?")}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{u.name}</p>
                    <p className="text-xs text-white/35 truncate">{u.email}</p>
                  </div>
                  <UserCheck className="w-4 h-4 text-[#E8390E] shrink-0" />
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3 flex-1">
            <p className="text-xs text-white/40">Player not on CricNation? Add them anyway — they can join later.</p>
            <input
              autoFocus
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              placeholder="Full player name *"
              className={INPUT}
              onKeyDown={e => e.key === "Enter" && manualName.trim() && onSelect({ id: "", name: manualName.trim() })}
            />
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={!manualName.trim()}
              onClick={() => onSelect({ id: "", name: manualName.trim() })}
              className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-40 btn-native shadow-[0_4px_16px_rgba(232,57,14,0.35)]"
            >
              Add {manualName.trim() ? `"${manualName.trim()}"` : "Player"}
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateTeamPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const [step, setStep] = useState<1 | 2>(1);
  const [teamName, setTeamName]   = useState("");
  const [shortName, setShortName] = useState("");
  const [colorHex, setColorHex]   = useState("#2563EB");
  const [homeGround, setHomeGround] = useState("");
  const [players, setPlayers]     = useState<Player[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const createTeam = trpc.team.create.useMutation();
  const addMember  = trpc.team.addMember.useMutation();

  const handleSelectPlayer = (u: { id: string; name: string; image?: string | null }) => {
    if (players.some(p => p.userId && p.userId === u.id)) return;
    setPlayers(prev => [...prev, {
      name: u.name, userId: u.id || undefined,
      image: u.image || undefined, role: "PLAYER", jerseyNo: "",
    }]);
    setShowSearch(false);
  };

  const handleCreate = async () => {
    if (!teamName || !shortName) return;
    try {
      const team = await createTeam.mutateAsync({ name: teamName, shortName, colorHex, homeGround });
      for (const p of players) {
        await addMember.mutateAsync({
          teamId: team.id, name: p.name, role: p.role,
          jerseyNo: p.jerseyNo ? parseInt(p.jerseyNo) : undefined,
        });
      }
      router.push(`/teams/${team.id}`);
    } catch (e: any) {
      console.error("Create team error:", e?.message ?? e);
    }
  };

  if (status === "loading") return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-[120px]" style={{ backgroundColor: colorHex }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-14 pb-5 border-b border-white/6">
        <motion.button whileTap={{ scale: 0.88 }}
          onClick={() => step === 2 ? setStep(1) : router.back()}
          className="w-10 h-10 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0 btn-native">
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <div className="flex-1">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Step {step} of 2</p>
          <h1 className="text-lg font-black text-white">{step === 1 ? "Team Identity" : "Add Players"}</h1>
        </div>
        {/* Progress pills */}
        <div className="flex gap-1.5 items-center">
          {[1, 2].map(s => (
            <motion.div
              key={s}
              animate={{ width: s === step ? 20 : 8 }}
              className={`h-2 rounded-full ${s === step ? "bg-[#E8390E]" : s < step ? "bg-emerald-500" : "bg-white/15"}`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 px-4 pt-5 pb-nav">
        <AnimatePresence mode="wait">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-4"
            >
              {/* Team details card */}
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h2 className="font-bold text-sm text-white/50 uppercase tracking-widest">Team Details</h2>
                <div>
                  <label className="text-xs text-white/40 block mb-2 font-semibold">Team Name *</label>
                  <input value={teamName} onChange={e => setTeamName(e.target.value)}
                    placeholder="e.g. Royal Challengers Nagpur" className={INPUT} maxLength={40} />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-2 font-semibold">Short Name (3–5 letters) *</label>
                  <input value={shortName} onChange={e => setShortName(e.target.value.toUpperCase().slice(0, 5))}
                    placeholder="e.g. RCN" className={INPUT} />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-2 font-semibold">Home Ground</label>
                  <input value={homeGround} onChange={e => setHomeGround(e.target.value)}
                    placeholder="e.g. Vidarbha Cricket Association Ground" className={INPUT} />
                </div>
              </div>

              {/* Color picker */}
              <div className="glass-card rounded-3xl p-5">
                <h2 className="font-bold text-sm text-white/50 uppercase tracking-widest mb-4">Team Colour</h2>
                <div className="grid grid-cols-6 gap-3">
                  {COLOR_PRESETS.map(c => (
                    <motion.button key={c} whileTap={{ scale: 0.82 }} onClick={() => setColorHex(c)}
                      className="relative w-10 h-10 rounded-xl btn-native"
                      style={{ backgroundColor: c }}
                    >
                      <AnimatePresence>
                        {colorHex === c && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white drop-shadow-lg" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <AnimatePresence>
                {teamName && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                    className="glass-card rounded-3xl p-4"
                  >
                    <p className="text-xs text-white/30 mb-3 uppercase tracking-widest font-semibold">Live Preview</p>
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shrink-0"
                        style={{ backgroundColor: colorHex, boxShadow: `0 8px 24px ${colorHex}50` }}
                      >
                        {shortName || "??"}
                      </motion.div>
                      <div>
                        <p className="font-black text-white text-lg leading-tight">{teamName}</p>
                        {homeGround && <p className="text-xs text-white/35 mt-0.5">📍 {homeGround}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={!teamName || teamName.length < 3 || !shortName}
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_4px_16px_rgba(232,57,14,0.35)] btn-native"
              >
                Next: Add Players <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-4"
            >
              {/* Squad card */}
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
                  <h2 className="font-bold text-sm text-white">Squad ({players.length + 1})</h2>
                  <span className="text-xs text-white/30">You are auto-added as Captain</span>
                </div>

                {/* Creator row */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/6">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-[#E8390E]/15 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-[#E8390E]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-white">{session?.user?.name ?? "You"}</p>
                    <p className="text-xs text-white/35">Team Captain</p>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" /> C
                  </span>
                </div>

                {/* Added players */}
                <AnimatePresence>
                  {players.map((p, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-white/6 last:border-0"
                    >
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        {p.image ? (
                          <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-white/8 rounded-xl flex items-center justify-center font-bold text-sm text-white/60">
                            {getInitials(p.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-white truncate">{p.name}</p>
                            {p.userId && (
                              <span className="w-4 h-4 bg-emerald-500/15 rounded-full flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            {(["PLAYER","VICE_CAPTAIN","CAPTAIN"] as const).map(r => (
                              <motion.button key={r} whileTap={{ scale: 0.88 }}
                                onClick={() => setPlayers(prev => prev.map((pl, idx) => idx === i ? { ...pl, role: r } : pl))}
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all border btn-native ${p.role === r
                                  ? r === "CAPTAIN"      ? "bg-amber-500 text-white border-amber-500"
                                    : r === "VICE_CAPTAIN" ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-white/20 text-white border-white/20"
                                  : "bg-transparent text-white/30 border-white/10"}`}
                              >
                                {r === "VICE_CAPTAIN" ? "VC" : r === "CAPTAIN" ? "C" : "PL"}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                        <motion.button whileTap={{ scale: 0.88 }} onClick={() => setPlayers(p => p.filter((_, idx) => idx !== i))}
                          className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center btn-native">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add player button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSearch(true)}
                className="w-full rounded-2xl border-2 border-dashed border-white/10 py-4 flex items-center justify-center gap-2 text-white/35 hover:border-[#E8390E]/40 hover:text-[#E8390E]/60 transition-colors btn-native"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-semibold">Add Player</span>
              </motion.button>

              <p className="text-xs text-white/25 text-center px-4">
                Players with ✓ are on CricNation — their stats sync automatically
              </p>

              {/* Create button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleCreate}
                disabled={createTeam.isPending || addMember.isPending}
                className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_16px_rgba(232,57,14,0.35)] btn-native"
              >
                {(createTeam.isPending || addMember.isPending)
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                  : <>🏏 Create Team ({players.length + 1} players)</>}
              </motion.button>

              {(createTeam.isError || addMember.isError) && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl px-4 py-3 text-center">
                  {(createTeam.error || addMember.error)?.message ?? "Something went wrong. Please try again."}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Player search sheet */}
      <AnimatePresence>
        {showSearch && (
          <PlayerSearchSheet onSelect={handleSelectPlayer} onClose={() => setShowSearch(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
