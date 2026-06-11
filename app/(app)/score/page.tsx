"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Search, X, Check, Users, Shield,
  ChevronDown, Zap, MapPin
} from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";

// ── Animation variants ─────────────────────────────────────────────────────
const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.18 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ── Types ──────────────────────────────────────────────────────────────────
type TeamRef = { id: string; name: string; shortName: string; colorHex: string };
type TeamMember = { id: string; name: string; role?: string; jerseyNo?: number | null };

// ── Team Picker Modal ──────────────────────────────────────────────────────
function TeamPicker({ label, value, onSelect }: {
  label: string;
  value: TeamRef | null;
  onSelect: (t: TeamRef | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: session } = useSession();
  const { data: myTeams } = trpc.team.getMyTeams.useQuery(undefined, { enabled: !!session?.user });
  const { data: searchResults } = trpc.team.search.useQuery({ query }, { enabled: query.length > 1 });
  const teams = query.length > 1 ? searchResults : myTeams;

  return (
    <div>
      <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">{label}</label>
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl py-4 px-4 flex items-center gap-3 text-left transition-all"
      >
        {value ? (
          <>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-lg"
              style={{ backgroundColor: value.colorHex }}
            >
              {value.shortName}
            </div>
            <span className="font-semibold text-white flex-1">{value.name}</span>
            <X
              className="w-4 h-4 text-white/30 hover:text-white/70"
              onClick={e => { e.stopPropagation(); onSelect(null); }}
            />
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white/30" />
            </div>
            <span className="text-white/40 flex-1">Select team…</span>
            <ChevronDown className="w-4 h-4 text-white/30" />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 40 } }}
              exit={{ y: "100%", opacity: 0, transition: { duration: 0.22 } }}
              className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-3xl z-50 max-h-[70vh] flex flex-col"
            >
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-4 mb-4" />
              <div className="px-4 pb-3 border-b border-white/8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search teams by name…"
                    className="w-full bg-white/8 rounded-xl py-3 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-white/12 transition-colors"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-2">
                {!teams || teams.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">No teams found</p>
                ) : (teams as TeamRef[]).map(t => (
                  <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => { onSelect(t); setOpen(false); setQuery(""); }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/8 transition-colors text-left"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg"
                      style={{ backgroundColor: t.colorHex }}
                    >
                      {t.shortName}
                    </div>
                    <span className="font-semibold text-white flex-1">{t.name}</span>
                    {value?.id === t.id && (
                      <div className="w-6 h-6 bg-[#E8390E] rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Playing XI Selector ────────────────────────────────────────────────────
function PlayingXIPicker({ team, selected, onToggle }: {
  team: TeamRef;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const { data: teamData, isLoading } = trpc.team.getTeam.useQuery(
    { teamId: team.id },
    { enabled: !!team.id }
  );
  const members: TeamMember[] = (teamData?.members ?? []).map((m: any) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    jerseyNo: m.jerseyNo,
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white"
          style={{ backgroundColor: team.colorHex }}
        >
          {team.shortName}
        </div>
        <div>
          <p className="font-bold text-white">{team.name}</p>
          <p className="text-xs text-white/40">{selected.length} selected</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-white/40 text-sm">No members found.</p>
          <p className="text-white/25 text-xs mt-1">Add members to this team first.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m, i) => {
            const isSelected = selected.includes(m.id);
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => onToggle(m.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? "bg-[#E8390E]/15 border-[#E8390E]/50"
                    : "bg-white/5 border-white/8 hover:border-white/20"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                  isSelected ? "bg-[#E8390E] text-white" : "bg-white/8 text-white/50"
                }`}>
                  {m.jerseyNo ?? m.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm transition-colors ${isSelected ? "text-white" : "text-white/60"}`}>
                    {m.name}
                  </p>
                  {m.role && (
                    <p className="text-[10px] text-white/30 uppercase tracking-wide mt-0.5">{m.role}</p>
                  )}
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? "bg-[#E8390E] border-[#E8390E]" : "border-white/20"
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Overs Selector ─────────────────────────────────────────────────────────
function OversSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [custom, setCustom] = useState(false);
  const presets = [6, 10, 20, 50];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {presets.map(o => (
          <motion.button
            key={o}
            whileTap={{ scale: 0.93 }}
            type="button"
            onClick={() => { setCustom(false); onChange(o); }}
            className={`py-3.5 rounded-2xl border text-sm font-bold transition-all ${
              value === o && !custom
                ? "bg-[#E8390E] text-white border-transparent shadow-[0_0_20px_rgba(232,57,14,0.4)]"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            {o}
          </motion.button>
        ))}
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => setCustom(true)}
        className={`w-full py-3 rounded-2xl border text-sm font-medium transition-all ${
          custom ? "border-[#E8390E] text-[#E8390E] bg-[#E8390E]/10"
                 : "border-dashed border-white/15 text-white/40 hover:border-white/30"
        }`}
      >
        {custom ? `Custom: ${value} overs` : "+ Custom overs"}
      </motion.button>
      <AnimatePresence>
        {custom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => onChange(Math.max(1, value - 1))}
              className="w-10 h-10 rounded-full bg-white/10 text-white text-xl font-medium flex items-center justify-center"
            >−</button>
            <input
              type="number"
              value={value}
              onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= 100) onChange(v); }}
              className="flex-1 text-center text-2xl font-bold bg-transparent border-0 outline-none text-white"
            />
            <button
              type="button"
              onClick={() => onChange(Math.min(100, value + 1))}
              className="w-10 h-10 rounded-full bg-white/10 text-white text-xl font-medium flex items-center justify-center"
            >+</button>
            <span className="text-sm text-white/40">overs</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Step Indicator ─────────────────────────────────────────────────────────
const STEP_LABELS = ["Teams", "Format", "Playing XI", "Toss"];
function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const s = i + 1;
        const done = s < step;
        const active = s === step;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
              done ? "bg-[#E8390E] text-white" :
              active ? "bg-white text-[#1A1A1A]" :
              "bg-white/10 text-white/30"
            }`}>
              {done ? <Check className="w-3 h-3" /> : s}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 w-6 rounded-full transition-colors ${done ? "bg-[#E8390E]" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Setup Form ────────────────────────────────────────────────────────
function SetupMatchInner() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [homeTeam, setHomeTeam] = useState<TeamRef | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamRef | null>(null);
  const [overs, setOvers] = useState(20);
  const [ballType, setBallType] = useState("Leather");
  const [matchType, setMatchType] = useState<"LIMITED_OVERS" | "UNLIMITED">("LIMITED_OVERS");
  const [venue, setVenue] = useState("");
  const [homePlayerIds, setHomePlayerIds] = useState<string[]>([]);
  const [awayPlayerIds, setAwayPlayerIds] = useState<string[]>([]);
  const [tossWinner, setTossWinner] = useState<"home" | "away" | null>(null);
  const [tossDecision, setTossDecision] = useState<"BAT" | "BOWL" | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createMatch = trpc.match.create.useMutation({
    onSuccess: (data) => router.push(`/score/${data.id}`),
    onError: () => setIsCreating(false),
  });

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  const toggleHomePlayer = (id: string) =>
    setHomePlayerIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAwayPlayer = (id: string) =>
    setAwayPlayerIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const battingFirst =
    tossWinner === "home"
      ? (tossDecision === "BAT" ? homeTeam : awayTeam)
      : (tossDecision === "BAT" ? awayTeam : homeTeam);

  const handleCreate = () => {
    if (!homeTeam || !awayTeam || !tossWinner || !tossDecision) return;
    setIsCreating(true);
    createMatch.mutate({
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      tossWinnerId: tossWinner === "home" ? homeTeam.id : awayTeam.id,
      tossDecision,
      overs: matchType === "UNLIMITED" ? 0 : overs,
      ballType,
      location: venue,
      homePlayerIds: homePlayerIds.length > 0 ? homePlayerIds : [],
      awayPlayerIds: awayPlayerIds.length > 0 ? awayPlayerIds : [],
    });
  };

  const BALL_TYPES = ["Leather", "Tennis (Hard)", "Tennis (Soft)", "Tape Ball"];

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors";

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8390E]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-14 pb-5 flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => step > 1 ? setStep((step - 1) as any) : router.back()}
          className="w-10 h-10 bg-white/8 hover:bg-white/15 rounded-2xl flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <div className="flex-1">
          <p className="text-xs text-white/40 mb-2">
            {step === 1 ? "Select Teams" : step === 2 ? "Match Format" : step === 3 ? "Playing XI" : "Toss & Start"}
          </p>
          <StepIndicator step={step} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pt-2">
        <AnimatePresence mode="wait">

          {/* STEP 1 — Teams */}
          {step === 1 && (
            <motion.div key="s1" {...slideIn} className="space-y-5">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">Pick your teams</h1>
                <p className="text-white/40 text-sm">Select the two teams playing today</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-3xl p-5 space-y-4">
                <TeamPicker label="Home Team" value={homeTeam} onSelect={setHomeTeam} />
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-xs font-black text-white/30 px-3 py-1.5 bg-white/5 rounded-full">VS</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>
                <TeamPicker label="Away Team" value={awayTeam} onSelect={setAwayTeam} />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!homeTeam || !awayTeam || homeTeam.id === awayTeam.id}
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold py-4 rounded-2xl disabled:opacity-30 shadow-[0_0_40px_rgba(232,57,14,0.3)] flex items-center justify-center gap-2 hover:shadow-[0_0_60px_rgba(232,57,14,0.5)] transition-shadow"
              >
                Next: Match Format <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2 — Format */}
          {step === 2 && (
            <motion.div key="s2" {...slideIn} className="space-y-5">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">Match format</h1>
                <p className="text-white/40 text-sm">Configure how this match will be played</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-3xl p-5 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-3">Innings Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["LIMITED_OVERS", "UNLIMITED"] as const).map(t => (
                      <motion.button
                        key={t}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setMatchType(t)}
                        className={`py-3.5 rounded-2xl border text-sm font-bold transition-all ${
                          matchType === t
                            ? "bg-[#E8390E] text-white border-transparent shadow-[0_0_20px_rgba(232,57,14,0.4)]"
                            : "bg-white/5 border-white/10 text-white/50 hover:border-white/25"
                        }`}
                      >
                        {t === "LIMITED_OVERS" ? "⏱ Limited" : "∞ Unlimited"}
                      </motion.button>
                    ))}
                  </div>
                </div>
                {matchType === "LIMITED_OVERS" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-3">Overs per Innings</label>
                    <OversSelector value={overs} onChange={setOvers} />
                  </motion.div>
                )}
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-3">Ball Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BALL_TYPES.map(b => (
                      <motion.button
                        key={b}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setBallType(b)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          ballType === b
                            ? "bg-white/15 text-white border-white/30"
                            : "bg-white/4 border-white/8 text-white/40 hover:border-white/20"
                        }`}
                      >
                        {b}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-3">
                    <MapPin className="w-3.5 h-3.5 inline mr-1.5" />Venue (optional)
                  </label>
                  <input
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    placeholder="e.g. Chinnaswamy Stadium"
                    className={inputClass}
                  />
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(3)}
                className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold py-4 rounded-2xl shadow-[0_0_40px_rgba(232,57,14,0.3)] flex items-center justify-center gap-2"
              >
                Next: Playing XI <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* STEP 3 — Playing XI */}
          {step === 3 && homeTeam && awayTeam && (
            <motion.div key="s3" {...slideIn} className="space-y-5">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">Playing XI</h1>
                <p className="text-white/40 text-sm">Select players for each team</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-3xl p-5">
                <PlayingXIPicker team={homeTeam} selected={homePlayerIds} onToggle={toggleHomePlayer} />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/8" />
                <Users className="w-4 h-4 text-white/20" />
                <div className="flex-1 h-px bg-white/8" />
              </div>
              <div className="bg-white/5 border border-white/8 rounded-3xl p-5">
                <PlayingXIPicker team={awayTeam} selected={awayPlayerIds} onToggle={toggleAwayPlayer} />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(4)}
                className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold py-4 rounded-2xl shadow-[0_0_40px_rgba(232,57,14,0.3)] flex items-center justify-center gap-2"
              >
                Next: Toss <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* STEP 4 — Toss */}
          {step === 4 && homeTeam && awayTeam && (
            <motion.div key="s4" {...slideIn} className="space-y-5">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">Toss</h1>
                <p className="text-white/40 text-sm">Who won the coin flip?</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-3xl p-5 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-3">Toss Winner</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([["home", homeTeam], ["away", awayTeam]] as const).map(([side, team]) => (
                      <motion.button
                        key={side}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setTossWinner(side)}
                        className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2.5 ${
                          tossWinner === side
                            ? "border-[#E8390E] bg-[#E8390E]/10"
                            : "border-white/10 bg-white/4 hover:border-white/25"
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg"
                          style={{ backgroundColor: team?.colorHex ?? "#ccc" }}
                        >
                          {team?.shortName ?? "?"}
                        </div>
                        <span className="text-white/80 text-xs font-semibold text-center leading-tight px-1">{team?.name ?? side}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                <AnimatePresence>
                  {tossWinner && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-3">
                        {tossWinner === "home" ? homeTeam.name : awayTeam.name} chose to…
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["BAT", "BOWL"] as const).map(d => (
                          <motion.button
                            key={d}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setTossDecision(d)}
                            className={`py-4 rounded-2xl border text-sm font-bold transition-all ${
                              tossDecision === d
                                ? "bg-[#E8390E] text-white border-transparent shadow-[0_0_20px_rgba(232,57,14,0.4)]"
                                : "bg-white/5 border-white/10 text-white/50 hover:border-white/25"
                            }`}
                          >
                            {d === "BAT" ? "🏏 Bat First" : "⚾ Bowl First"}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {tossWinner && tossDecision && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-gradient-to-br from-white/8 to-white/4 border border-white/15 rounded-3xl p-5"
                  >
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Match Summary</p>
                    <div className="flex items-center justify-between mb-5">
                      <div className="text-center">
                        <div
                          className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center font-black text-sm text-white shadow-lg"
                          style={{ backgroundColor: homeTeam.colorHex }}
                        >
                          {homeTeam.shortName}
                        </div>
                        <p className="text-xs text-white/70 font-semibold">{homeTeam.name}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/25 font-black text-xl mb-1">VS</p>
                        <p className="text-[10px] text-white/35">{matchType === "UNLIMITED" ? "Unlimited" : `${overs} Overs`}</p>
                        <p className="text-[10px] text-white/25 mt-0.5">{ballType}</p>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center font-black text-sm text-white shadow-lg"
                          style={{ backgroundColor: awayTeam.colorHex }}
                        >
                          {awayTeam.shortName}
                        </div>
                        <p className="text-xs text-white/70 font-semibold">{awayTeam.name}</p>
                      </div>
                    </div>
                    <div className="bg-white/8 rounded-2xl px-4 py-3 text-center">
                      <p className="text-white font-bold">
                        <span className="text-[#E8390E]">{battingFirst?.name}</span>
                        <span className="text-white/50 font-normal"> will bat first</span>
                      </p>
                      {venue && <p className="text-xs text-white/30 mt-1">📍 {venue}</p>}
                    </div>
                    <div className="flex justify-between text-xs text-white/30 mt-3 px-1">
                      <span>🏏 {homePlayerIds.length} Home Players</span>
                      <span>🏏 {awayPlayerIds.length} Away Players</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!tossWinner || !tossDecision || isCreating}
                onClick={handleCreate}
                className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-black py-5 rounded-2xl disabled:opacity-30 shadow-[0_0_60px_rgba(232,57,14,0.4)] flex items-center justify-center gap-3 text-lg hover:shadow-[0_0_80px_rgba(232,57,14,0.6)] transition-shadow"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting Match…
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Start Scoring
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────
export default function SetupMatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#E8390E] rounded-full animate-spin" />
      </div>
    }>
      <SetupMatchInner />
    </Suspense>
  );
}
