"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Check, ChevronRight, User } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";

const COLOR_PRESETS = [
  "#E8390E", "#F5A623", "#2563EB", "#16A34A", "#7C3AED",
  "#DB2777", "#0891B2", "#DC2626", "#059669", "#D97706",
  "#1D4ED8", "#111827",
];

type AddedPlayer = {
  name: string;
  phone: string;
  role: "PLAYER" | "VICE_CAPTAIN" | "CAPTAIN";
  jerseyNo: string;
};

export default function CreateTeamPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<1 | 2>(1);

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  // Step 1 state
  const [teamName, setTeamName] = useState("");
  const [shortName, setShortName] = useState("");
  const [colorHex, setColorHex] = useState("#16A34A");
  const [homeGround, setHomeGround] = useState("");

  // Step 2 state
  const [players, setPlayers] = useState<AddedPlayer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState<AddedPlayer>({ name: "", phone: "", role: "PLAYER", jerseyNo: "" });

  const createTeam = trpc.team.create.useMutation();
  const addMember = trpc.team.addMember.useMutation();

  const handleAddPlayer = () => {
    if (!newPlayer.name.trim()) return;
    setPlayers([...players, newPlayer]);
    setNewPlayer({ name: "", phone: "", role: "PLAYER", jerseyNo: "" });
    setShowAddForm(false);
  };

  const handleCreate = async () => {
    if (!teamName || !shortName) return;
    try {
      const team = await createTeam.mutateAsync({ name: teamName, shortName, colorHex, homeGround });
      for (const p of players) {
        await addMember.mutateAsync({
          teamId: team.id,
          name: p.name,
          phone: p.phone || undefined,
          role: p.role,
          jerseyNo: p.jerseyNo ? parseInt(p.jerseyNo) : undefined,
        });
      }
      router.push(`/teams/${team.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const inputClass = "w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm text-[#1A1A1A] placeholder:text-[#8A8278] focus:outline-none focus:border-[#E8390E] transition-colors";

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.13)] px-4 pt-12 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => step === 2 ? setStep(1) : router.back()}
          className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[#4A4540]" />
        </motion.button>
        <div>
          <p className="text-xs text-[#8A8278]">Step {step} of 2</p>
          <h1 className="text-xl font-bold text-[#1A1A1A]">{step === 1 ? "Team Identity" : "Add Players"}</h1>
        </div>
        {/* Step dots */}
        <div className="ml-auto flex gap-1.5">
          {[1, 2].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s === step ? "bg-[#E8390E]" : s < step ? "bg-green-500" : "bg-[rgba(107,74,42,0.2)]"}`} />
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Team Name */}
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold text-sm text-[#4A4540]">Team Details</h2>
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1.5">Team Name *</label>
                  <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Royal Challengers" className={inputClass} maxLength={40} />
                </div>
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1.5">Short Name (max 5) *</label>
                  <input value={shortName} onChange={e => setShortName(e.target.value.toUpperCase().slice(0, 5))} placeholder="e.g. RCB" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1.5">Home Ground (optional)</label>
                  <input value={homeGround} onChange={e => setHomeGround(e.target.value)} placeholder="e.g. Chinnaswamy Stadium" className={inputClass} />
                </div>
              </div>

              {/* Color Picker */}
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5">
                <h2 className="font-semibold text-sm text-[#4A4540] mb-3">Team Color</h2>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PRESETS.map(c => (
                    <motion.button key={c} whileTap={{ scale: 0.85 }} onClick={() => setColorHex(c)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform"
                      style={{ backgroundColor: c }}
                    >
                      {colorHex === c && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              {teamName && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4">
                  <p className="text-xs text-[#8A8278] mb-3">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: colorHex }}>
                      {shortName || "??"}
                    </div>
                    <div>
                      <p className="font-bold text-[#1A1A1A]">{teamName || "Team Name"}</p>
                      {homeGround && <p className="text-xs text-[#8A8278] mt-0.5">📍 {homeGround}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!teamName || teamName.length < 3 || !shortName}
                onClick={() => setStep(2)}
                className="w-full bg-[#E8390E] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_4px_16px_rgba(232,57,14,0.35)]"
              >
                Next: Add Players <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Creator auto-listed */}
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4">
                <p className="text-xs text-[#8A8278] mb-3 font-medium">Squad</p>
                {/* Creator */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[rgba(107,74,42,0.1)]">
                  <div className="w-10 h-10 bg-[#E8390E]/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-[#E8390E]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#1A1A1A]">{session?.user?.name ?? "You"}</p>
                    <p className="text-xs text-[#8A8278]">Captain (you)</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">👑 C</span>
                </div>

                {/* Added players */}
                {players.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center font-semibold text-sm text-[#4A4540]">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#1A1A1A]">{p.name}</p>
                      <p className="text-xs text-[#8A8278]">{p.role.replace("_", " ")} {p.jerseyNo ? `· #${p.jerseyNo}` : ""}</p>
                    </div>
                    <button onClick={() => setPlayers(players.filter((_, j) => j !== i))} className="text-red-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Player Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-[#1A1A1A]">Add Player</p>
                    <input value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} placeholder="Player name *" className={inputClass} />
                    <input value={newPlayer.phone} onChange={e => setNewPlayer({ ...newPlayer, phone: e.target.value })} placeholder="Phone (optional, for invite)" className={inputClass} type="tel" />
                    <input value={newPlayer.jerseyNo} onChange={e => setNewPlayer({ ...newPlayer, jerseyNo: e.target.value })} placeholder="Jersey # (optional)" className={inputClass} type="number" />
                    <div className="flex gap-2">
                      {(["PLAYER", "VICE_CAPTAIN", "CAPTAIN"] as const).map(r => (
                        <button key={r} onClick={() => setNewPlayer({ ...newPlayer, role: r })}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${newPlayer.role === r ? "bg-[#E8390E] text-white" : "bg-[#F2EFE9] text-[#4A4540]"}`}>
                          {r === "VICE_CAPTAIN" ? "VC" : r === "CAPTAIN" ? "Captain" : "Player"}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddForm(false)} className="flex-1 py-2.5 rounded-xl bg-[#F2EFE9] text-[#4A4540] text-sm font-medium">Cancel</button>
                      <button onClick={handleAddPlayer} disabled={!newPlayer.name.trim()}
                        className="flex-1 py-2.5 rounded-xl bg-[#E8390E] text-white text-sm font-semibold disabled:opacity-40">
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAddForm && (
                <button onClick={() => setShowAddForm(true)}
                  className="w-full border-2 border-dashed border-[rgba(107,74,42,0.2)] rounded-2xl py-4 flex items-center justify-center gap-2 text-[#8A8278] hover:border-[#E8390E] hover:text-[#E8390E] transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Player</span>
                </button>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={createTeam.isPending}
                className="w-full bg-[#E8390E] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_16px_rgba(232,57,14,0.35)]"
              >
                {createTeam.isPending ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
                ) : (
                  <>🏏 Create Team</>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
