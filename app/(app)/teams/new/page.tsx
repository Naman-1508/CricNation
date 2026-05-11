"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, Check, ChevronRight,
  Search, X, User, Crown, Shield, UserCheck
} from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import Image from "next/image";

const COLOR_PRESETS = [
  "#E8390E", "#F5A623", "#2563EB", "#16A34A", "#7C3AED",
  "#DB2777", "#0891B2", "#DC2626", "#059669", "#D97706",
  "#1D4ED8", "#111827",
];

type AddedPlayer = {
  name: string;
  userId?: string;      // if linked to a real user account
  image?: string;
  role: "PLAYER" | "VICE_CAPTAIN" | "CAPTAIN";
  jerseyNo: string;
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Player Search Component ──────────────────────────────────────────────────
function PlayerSearchInput({
  onSelect,
  onClose,
}: {
  onSelect: (player: { id: string; name: string; image?: string | null }) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [manualName, setManualName] = useState("");
  const [mode, setMode] = useState<"search" | "manual">("search");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isFetching } = trpc.user.search.useQuery(
    { query },
    { enabled: query.length >= 2 }
  );

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white border border-[rgba(107,74,42,0.15)] rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Mode toggle */}
      <div className="flex border-b border-[rgba(107,74,42,0.1)]">
        <button
          onClick={() => setMode("search")}
          className={`flex-1 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${mode === "search" ? "text-[#E8390E] bg-[#E8390E]/5" : "text-[#8A8278]"}`}
        >
          <Search className="w-3.5 h-3.5" /> Find on CricNation
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${mode === "manual" ? "text-[#E8390E] bg-[#E8390E]/5" : "text-[#8A8278]"}`}
        >
          <Plus className="w-3.5 h-3.5" /> Add Manually
        </button>
      </div>

      {mode === "search" ? (
        <div>
          {/* Search input */}
          <div className="relative p-3">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type a name or email..."
              className="w-full bg-[#F2EFE9] rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8390E]/20"
            />
          </div>

          {/* Results */}
          <div className="max-h-52 overflow-y-auto">
            {isFetching && query.length >= 2 && (
              <div className="py-5 text-center">
                <div className="w-5 h-5 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin mx-auto" />
              </div>
            )}

            {!isFetching && query.length >= 2 && results && results.length === 0 && (
              <div className="py-5 text-center text-sm text-[#8A8278] px-4">
                No users found for "{query}"
                <button
                  onClick={() => { setMode("manual"); setManualName(query); }}
                  className="block w-full mt-2 text-[#E8390E] font-medium"
                >
                  Add "{query}" manually instead →
                </button>
              </div>
            )}

            {results?.map(user => (
              <button
                key={user.id}
                onClick={() => onSelect({ id: user.id, name: user.name ?? "Player", image: user.image })}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F2EFE9] transition-colors border-b border-[rgba(107,74,42,0.06)] last:border-0 text-left"
              >
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
              <div className="px-4 py-5 text-center text-sm text-[#8A8278]">
                Start typing to search registered players
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#8A8278] font-medium">Player not on CricNation? Add them anyway.</p>
          <input
            autoFocus
            value={manualName}
            onChange={e => setManualName(e.target.value)}
            placeholder="Full name *"
            className="w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#E8390E] transition-colors"
            onKeyDown={e => e.key === "Enter" && manualName.trim() && onSelect({ id: "", name: manualName.trim() })}
          />
          <button
            disabled={!manualName.trim()}
            onClick={() => onSelect({ id: "", name: manualName.trim() })}
            className="w-full bg-[#E8390E] text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-40"
          >
            Add {manualName.trim() ? `"${manualName.trim()}"` : "Player"}
          </button>
        </div>
      )}

      <div className="border-t border-[rgba(107,74,42,0.1)] px-4 py-2">
        <button onClick={onClose} className="w-full text-sm text-[#8A8278] py-1">Cancel</button>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function CreateTeamPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [teamName, setTeamName] = useState("");
  const [shortName, setShortName] = useState("");
  const [colorHex, setColorHex] = useState("#2563EB");
  const [homeGround, setHomeGround] = useState("");

  // Step 2
  const [players, setPlayers] = useState<AddedPlayer[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [editingRole, setEditingRole] = useState<number | null>(null);

  const createTeam = trpc.team.create.useMutation();
  const addMember = trpc.team.addMember.useMutation();

  const handleSelectPlayer = (user: { id: string; name: string; image?: string | null }) => {
    // Don't allow duplicates
    if (players.some(p => p.userId && p.userId === user.id)) return;
    setPlayers(prev => [...prev, {
      name: user.name,
      userId: user.id || undefined,
      image: user.image || undefined,
      role: "PLAYER",
      jerseyNo: "",
    }]);
    setShowSearch(false);
  };

  const removePlayer = (idx: number) => setPlayers(prev => prev.filter((_, i) => i !== idx));

  const handleCreate = async () => {
    if (!teamName || !shortName) return;
    try {
      const team = await createTeam.mutateAsync({ name: teamName, shortName, colorHex, homeGround });
      for (const p of players) {
        await addMember.mutateAsync({
          teamId: team.id,
          name: p.name,
          role: p.role,
          jerseyNo: p.jerseyNo ? parseInt(p.jerseyNo) : undefined,
        });
      }
      router.push(`/teams/${team.id}`);
    } catch (e: any) {
      console.error("Create team error:", e?.message ?? e);
    }
  };

  const inputClass = "w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm text-[#1A1A1A] placeholder:text-[#8A8278] focus:outline-none focus:border-[#E8390E] transition-colors";

  if (status === "loading") return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.13)] px-4 pt-12 pb-4 flex items-center gap-3 sticky top-0 z-20">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => step === 2 ? setStep(1) : router.back()}
          className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center shrink-0">
          <ArrowLeft className="w-5 h-5 text-[#4A4540]" />
        </motion.button>
        <div className="flex-1">
          <p className="text-xs text-[#8A8278]">Step {step} of 2</p>
          <h1 className="text-xl font-bold text-[#1A1A1A]">{step === 1 ? "Team Identity" : "Add Players"}</h1>
        </div>
        <div className="flex gap-1.5">
          {[1, 2].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-all ${s === step ? "bg-[#E8390E] w-5" : s < step ? "bg-green-500" : "bg-[rgba(107,74,42,0.2)]"}`} />
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        <AnimatePresence mode="wait">
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">

              {/* Team Details */}
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5 space-y-4 shadow-sm">
                <h2 className="font-semibold text-sm text-[#4A4540]">Team Details</h2>
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1.5 font-medium">Team Name *</label>
                  <input value={teamName} onChange={e => setTeamName(e.target.value)}
                    placeholder="e.g. Royal Challengers Nagpur" className={inputClass} maxLength={40} />
                </div>
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1.5 font-medium">Short Name (3–5 letters) *</label>
                  <input value={shortName} onChange={e => setShortName(e.target.value.toUpperCase().slice(0, 5))}
                    placeholder="e.g. RCN" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1.5 font-medium">Home Ground</label>
                  <input value={homeGround} onChange={e => setHomeGround(e.target.value)}
                    placeholder="e.g. Vidarbha Cricket Association Ground" className={inputClass} />
                </div>
              </div>

              {/* Color Picker */}
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold text-sm text-[#4A4540] mb-3">Team Color</h2>
                <div className="grid grid-cols-6 gap-2.5">
                  {COLOR_PRESETS.map(c => (
                    <motion.button key={c} whileTap={{ scale: 0.85 }} onClick={() => setColorHex(c)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform ring-2 ring-offset-2 ring-transparent"
                      style={{ backgroundColor: c, ...(colorHex === c ? { ringColor: c } : {}) }}
                    >
                      {colorHex === c && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <AnimatePresence>
                {teamName && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-[#8A8278] mb-3 font-medium">Live Preview</p>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg"
                        style={{ backgroundColor: colorHex }}>
                        {shortName || "??"}
                      </div>
                      <div>
                        <p className="font-bold text-[#1A1A1A] text-base">{teamName}</p>
                        {homeGround && <p className="text-xs text-[#8A8278] mt-0.5">📍 {homeGround}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!teamName || teamName.length < 3 || !shortName}
                onClick={() => setStep(2)}
                className="w-full bg-[#E8390E] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_4px_16px_rgba(232,57,14,0.35)] text-sm"
              >
                Next: Add Players <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">

              {/* Squad card */}
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-[rgba(107,74,42,0.08)] flex items-center justify-between">
                  <h2 className="font-semibold text-sm text-[#1A1A1A]">Squad ({players.length + 1})</h2>
                  <span className="text-xs text-[#8A8278]">Min. 1 player recommended</span>
                </div>

                {/* Creator (captain) row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(107,74,42,0.07)]">
                  {session?.user?.image ? (
                    <Image src={session.user.image} alt="" width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-[#E8390E]/10 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-[#E8390E]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#1A1A1A]">{session?.user?.name ?? "You"}</p>
                    <p className="text-xs text-[#8A8278]">Team Captain</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">👑 C</span>
                </div>

                {/* Added players */}
                <AnimatePresence>
                  {players.map((p, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(107,74,42,0.07)] last:border-0"
                    >
                      {p.image ? (
                        <Image src={p.image} alt="" width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center font-bold text-sm text-[#4A4540]">
                          {getInitials(p.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-[#1A1A1A] truncate">{p.name}</p>
                          {p.userId && (
                            <span className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-green-600" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        {/* Role selector */}
                        <div className="flex gap-1 mt-1">
                          {(["PLAYER", "VICE_CAPTAIN", "CAPTAIN"] as const).map(r => (
                            <button key={r} onClick={() => setPlayers(prev => prev.map((pl, idx) => idx === i ? { ...pl, role: r } : pl))}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors border ${p.role === r
                                ? r === "CAPTAIN" ? "bg-amber-500 text-white border-amber-500"
                                  : r === "VICE_CAPTAIN" ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                : "bg-[#F2EFE9] text-[#8A8278] border-transparent"}`}>
                              {r === "VICE_CAPTAIN" ? "VC" : r === "CAPTAIN" ? "C" : "PL"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => removePlayer(i)} className="text-red-400 p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Search/Add player */}
              <AnimatePresence>
                {showSearch ? (
                  <PlayerSearchInput onSelect={handleSelectPlayer} onClose={() => setShowSearch(false)} />
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => setShowSearch(true)}
                    className="w-full border-2 border-dashed border-[rgba(107,74,42,0.2)] rounded-2xl py-4 flex items-center justify-center gap-2 text-[#8A8278] hover:border-[#E8390E] hover:text-[#E8390E] transition-colors bg-white shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-semibold">Add Player</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Info text */}
              <p className="text-xs text-[#8A8278] text-center px-4">
                Players with ✓ are registered CricNation users — their stats will sync automatically.
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={createTeam.isPending || addMember.isPending}
                className="w-full bg-[#E8390E] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_16px_rgba(232,57,14,0.35)] text-sm"
              >
                {(createTeam.isPending || addMember.isPending) ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Team...</>
                ) : (
                  <>🏏 Create Team ({players.length + 1} players)</>
                )}
              </motion.button>

              {(createTeam.isError || addMember.isError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
                  {(createTeam.error || addMember.error)?.message ?? "Something went wrong. Please try again."}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
