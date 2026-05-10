"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Search, Plus, X, Check } from "lucide-react";
import { trpc } from "@/app/_trpc/client";

// ─── Overs Selector ───────────────────────────────────────────
function OversSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [custom, setCustom] = useState(false);
  const presets = [6, 10, 20, 50];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {presets.map(o => (
          <button key={o} type="button" onClick={() => { setCustom(false); onChange(o); }}
            className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${
              value === o && !custom
                ? "bg-[#E8390E] text-white border-[#E8390E]"
                : "bg-white border-[rgba(107,74,42,0.2)] text-[#4A4540] hover:border-[#E8390E]"
            }`}>
            {o}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setCustom(true)}
        className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors ${
          custom ? "border-[#E8390E] text-[#E8390E] bg-[#E8390E]/5"
                 : "border-dashed border-[rgba(107,74,42,0.25)] text-[#8A8278] hover:border-[#E8390E]"
        }`}>
        {custom ? `Custom: ${value} overs` : "+ Custom overs"}
      </button>
      {custom && (
        <div className="flex items-center gap-3 bg-[#F2EFE9] rounded-xl px-4 py-3">
          <button type="button" onClick={() => onChange(Math.max(1, value - 1))}
            className="w-10 h-10 rounded-full border border-[rgba(107,74,42,0.2)] bg-white text-xl font-medium flex items-center justify-center">−</button>
          <input type="number" value={value}
            onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= 100) onChange(v); }}
            className="flex-1 text-center text-2xl font-bold bg-transparent border-0 outline-none text-[#1A1A1A]" />
          <button type="button" onClick={() => onChange(Math.min(100, value + 1))}
            className="w-10 h-10 rounded-full border border-[rgba(107,74,42,0.2)] bg-white text-xl font-medium flex items-center justify-center">+</button>
          <span className="text-sm text-[#8A8278]">overs</span>
        </div>
      )}
    </div>
  );
}

// ─── Team Picker ──────────────────────────────────────────────
type TeamRef = { id: string; name: string; shortName: string; colorHex: string };

function TeamPicker({ label, value, onSelect }: {
  label: string; value: TeamRef | null; onSelect: (t: TeamRef | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: myTeams } = trpc.team.getMyTeams.useQuery();
  const { data: searchResults } = trpc.team.search.useQuery({ query }, { enabled: query.length > 1 });
  const teams = query.length > 1 ? searchResults : myTeams;

  return (
    <div>
      <label className="text-xs text-[#8A8278] block mb-1.5">{label}</label>
      <button type="button" onClick={() => setOpen(true)}
        className="w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 flex items-center gap-3 text-left hover:border-[#E8390E] transition-colors">
        {value ? (
          <>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: value.colorHex }}>{value.shortName}</div>
            <span className="font-medium text-sm text-[#1A1A1A] flex-1">{value.name}</span>
            <X className="w-4 h-4 text-[#8A8278]" onClick={e => { e.stopPropagation(); onSelect(null); }} />
          </>
        ) : (
          <>
            <Search className="w-4 h-4 text-[#8A8278]" />
            <span className="text-sm text-[#8A8278] flex-1">Search or select team</span>
            <ChevronRight className="w-4 h-4 text-[#8A8278]" />
          </>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[70vh] flex flex-col">
              <div className="p-4 border-b border-[rgba(107,74,42,0.1)]">
                <div className="w-10 h-1 bg-[rgba(107,74,42,0.15)] rounded-full mx-auto mb-4" />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]" />
                  <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search teams..."
                    className="w-full bg-[#F2EFE9] rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-2">
                {!teams || teams.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-[#8A8278] text-sm mb-3">No teams found</p>
                    <button onClick={() => setOpen(false)} className="text-[#E8390E] text-sm font-medium flex items-center gap-1 mx-auto"><Plus className="w-4 h-4" /> Create New Team</button>
                  </div>
                ) : (teams as TeamRef[]).map(t => (
                  <button key={t.id} type="button" onClick={() => { onSelect(t); setOpen(false); setQuery(""); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2EFE9] transition-colors text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: t.colorHex }}>{t.shortName}</div>
                    <div className="flex-1"><p className="font-medium text-sm text-[#1A1A1A]">{t.name}</p></div>
                    {value?.id === t.id && <Check className="w-4 h-4 text-[#E8390E]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Inner page (uses useSearchParams) ───────────────────────
function SetupMatchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [homeTeam, setHomeTeam] = useState<TeamRef | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamRef | null>(null);
  const [overs, setOvers] = useState(20);
  const [ballType, setBallType] = useState("Leather");
  const [matchType, setMatchType] = useState<"LIMITED_OVERS" | "UNLIMITED">("LIMITED_OVERS");
  const [venue, setVenue] = useState("");
  const [tossWinner, setTossWinner] = useState<"home" | "away" | null>(null);
  const [tossDecision, setTossDecision] = useState<"BAT" | "BOWL" | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createMatch = trpc.match.create.useMutation({
    onSuccess: (data) => router.push(`/score/${data.id}`),
    onError: () => setIsCreating(false),
  });

  const BALL_TYPES = ["Leather", "Tennis (Hard)", "Tennis (Soft)", "Tape Ball"];

  const inputClass = "w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm text-[#1A1A1A] placeholder:text-[#8A8278] focus:outline-none focus:border-[#E8390E] transition-colors";

  const battingFirst = tossWinner === "home"
    ? (tossDecision === "BAT" ? homeTeam : awayTeam)
    : (tossDecision === "BAT" ? awayTeam : homeTeam);

  const handleCreate = () => {
    if (!homeTeam || !awayTeam || !tossWinner || !tossDecision) return;
    setIsCreating(true);
    createMatch.mutate({ teamA: homeTeam.name, teamB: awayTeam.name, overs: matchType === "UNLIMITED" ? 0 : overs, ballType, location: venue });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.13)] px-4 pt-12 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => step > 1 ? setStep((step - 1) as any) : router.back()}
          className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[#4A4540]" />
        </motion.button>
        <div className="flex-1">
          <div className="flex gap-1.5 mb-1">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-[#E8390E]" : "bg-[rgba(107,74,42,0.15)]"}`} />
            ))}
          </div>
          <p className="text-xs text-[#8A8278]">{step === 1 ? "Select Teams" : step === 2 ? "Match Format" : "Toss & Confirm"}</p>
        </div>
      </div>

      <div className="px-4 pt-5">
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold text-[#1A1A1A]">Select Teams</h2>
                <TeamPicker label="Your Team (Home)" value={homeTeam} onSelect={setHomeTeam} />
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[rgba(107,74,42,0.1)]" />
                  <span className="text-xs font-bold text-[#8A8278] px-3 py-1.5 bg-[#F2EFE9] rounded-full">VS</span>
                  <div className="flex-1 h-px bg-[rgba(107,74,42,0.1)]" />
                </div>
                <TeamPicker label="Opponent (Away)" value={awayTeam} onSelect={setAwayTeam} />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} disabled={!homeTeam || !awayTeam || homeTeam.id === awayTeam.id} onClick={() => setStep(2)}
                className="w-full bg-[#E8390E] text-white font-semibold py-4 rounded-xl disabled:opacity-40 shadow-[0_4px_16px_rgba(232,57,14,0.35)] flex items-center justify-center gap-2">
                Next: Match Format <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5">
                <h2 className="font-semibold text-[#1A1A1A] mb-3">Innings Type</h2>
                <div className="grid grid-cols-2 gap-2">
                  {(["LIMITED_OVERS", "UNLIMITED"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setMatchType(t)}
                      className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${matchType === t ? "bg-[#E8390E] text-white border-[#E8390E]" : "bg-white border-[rgba(107,74,42,0.2)] text-[#4A4540]"}`}>
                      {t === "LIMITED_OVERS" ? "⏱ Limited Overs" : "∞ Unlimited"}
                    </button>
                  ))}
                </div>
              </div>
              {matchType === "LIMITED_OVERS" && (
                <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5">
                  <h2 className="font-semibold text-[#1A1A1A] mb-3">Overs per Innings</h2>
                  <OversSelector value={overs} onChange={setOvers} />
                </div>
              )}
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold text-[#1A1A1A]">Settings</h2>
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1.5">Ball Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BALL_TYPES.map(b => (
                      <button key={b} type="button" onClick={() => setBallType(b)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-colors ${ballType === b ? "bg-[#E8390E]/10 text-[#E8390E] border-[#E8390E]/40" : "bg-white border-[rgba(107,74,42,0.2)] text-[#4A4540]"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#8A8278] block mb-1.5">Venue (optional)</label>
                  <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Chinnaswamy Stadium" className={inputClass} />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(3)}
                className="w-full bg-[#E8390E] text-white font-semibold py-4 rounded-xl shadow-[0_4px_16px_rgba(232,57,14,0.35)] flex items-center justify-center gap-2">
                Next: Toss <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5">
                <h2 className="font-semibold text-[#1A1A1A] mb-4">Who won the toss?</h2>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {([["home", homeTeam], ["away", awayTeam]] as const).map(([side, team]) => (
                    <button key={side} type="button" onClick={() => setTossWinner(side)}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${tossWinner === side ? "border-[#E8390E] bg-[#E8390E]/5" : "border-[rgba(107,74,42,0.15)]"}`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: team?.colorHex ?? "#ccc" }}>{team?.shortName ?? "?"}</div>
                      <span className="text-[#1A1A1A] text-xs">{team?.name ?? side}</span>
                    </button>
                  ))}
                </div>
                {tossWinner && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm text-[#4A4540] mb-2 font-medium">Choose to...</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["BAT", "BOWL"] as const).map(d => (
                        <button key={d} type="button" onClick={() => setTossDecision(d)}
                          className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${tossDecision === d ? "bg-[#E8390E] text-white border-[#E8390E]" : "bg-white border-[rgba(107,74,42,0.2)] text-[#4A4540]"}`}>
                          {d === "BAT" ? "🏏 Bat First" : "⚾ Bowl First"}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Match Summary */}
              {tossWinner && tossDecision && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1A1A1A] rounded-2xl p-5 text-white">
                  <p className="text-xs text-white/50 mb-3 uppercase tracking-wide">Match Summary</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl mx-auto mb-1 flex items-center justify-center font-bold text-xs" style={{ backgroundColor: homeTeam?.colorHex }}>{homeTeam?.shortName}</div>
                      <p className="text-xs font-medium">{homeTeam?.name}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white/40">{matchType === "UNLIMITED" ? "Unlimited" : `${overs} Ov`}</p>
                      <p className="text-xs text-white/40 mt-0.5">{ballType}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl mx-auto mb-1 flex items-center justify-center font-bold text-xs" style={{ backgroundColor: awayTeam?.colorHex }}>{awayTeam?.shortName}</div>
                      <p className="text-xs font-medium">{awayTeam?.name}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center">
                    <p className="text-sm"><span className="font-bold">{battingFirst?.name}</span><span className="text-white/60"> will bat first</span></p>
                    {venue && <p className="text-xs text-white/40 mt-0.5">📍 {venue}</p>}
                  </div>
                </motion.div>
              )}

              <motion.button whileTap={{ scale: 0.97 }} disabled={!tossWinner || !tossDecision || isCreating} onClick={handleCreate}
                className="w-full bg-[#E8390E] text-white font-bold py-4 rounded-xl disabled:opacity-40 shadow-[0_4px_16px_rgba(232,57,14,0.35)] flex items-center justify-center gap-2">
                {isCreating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Starting...</> : "🏏 Start Scoring"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Exported page wrapped in Suspense ────────────────────────
export default function SetupMatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" />
      </div>
    }>
      <SetupMatchInner />
    </Suspense>
  );
}
