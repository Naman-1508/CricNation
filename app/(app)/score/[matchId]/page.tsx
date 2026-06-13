"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowRight, Trophy, ChevronLeft, Zap } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusherClient";
import ShotPickerSheet from "@/components/ShotPickerSheet";

// ── Types ──────────────────────────────────────────────────────────────────
type PlayerRef = { id: string; name: string };

// ── Ball Dot ───────────────────────────────────────────────────────────────
function BallDot({ val, animate = false }: { val: string; animate?: boolean }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0";
  let cls = "";
  if (val === "W") cls = "bg-[#E8390E] text-white shadow-[0_0_12px_rgba(232,57,14,0.6)]";
  else if (val === "4") cls = "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]";
  else if (val === "6") cls = "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]";
  else if (val === "wd" || val === "nb") cls = "bg-amber-400/20 text-amber-300 border border-amber-400/40";
  else if (val === "0" || val === ".") cls = "bg-white/8 text-white/30 border border-white/10";
  else cls = "bg-white/15 text-white";

  return (
    <motion.div
      initial={animate ? { scale: 0, opacity: 0 } : {}}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`${base} ${cls}`}
    >
      {val === "0" ? "•" : val}
    </motion.div>
  );
}

// ── Player Select Sheet ────────────────────────────────────────────────────
function PlayerSelectSheet({
  isOpen, title, subtitle, players, onSelect, onClose, allowClose = false,
}: {
  isOpen: boolean; title: string; subtitle?: string;
  players: PlayerRef[]; onSelect: (p: PlayerRef) => void;
  onClose?: () => void; allowClose?: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={allowClose ? onClose : undefined}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 38 } }}
            exit={{ y: "100%", opacity: 0, transition: { duration: 0.22 } }}
            className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-3xl z-50 max-h-[72vh] flex flex-col"
          >
            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-4 mb-4 flex-shrink-0" />
            <div className="px-5 pb-4 border-b border-white/8 flex-shrink-0">
              <h3 className="font-black text-white text-xl">{title}</h3>
              {subtitle && <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>}
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {players.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">No players available</p>
              ) : players.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelect(p)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-white">{p.name}</span>
                  <ArrowRight className="w-4 h-4 text-white/20 ml-auto" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Wicket Sheet ───────────────────────────────────────────────────────────
function WicketSheet({ isOpen, onClose, onConfirm }: {
  isOpen: boolean; onClose: () => void; onConfirm: (type: string) => void;
}) {
  const types = ["Bowled", "Caught", "LBW", "Run Out", "Stumped", "Hit Wicket", "Handled Ball", "Obstructing Field"];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 38 } }}
            exit={{ y: "100%", opacity: 0, transition: { duration: 0.22 } }}
            className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-3xl z-50 p-6"
          >
            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#E8390E] rounded-2xl flex items-center justify-center">
                <span className="text-white font-black text-base">W</span>
              </div>
              <div>
                <h3 className="font-black text-white text-lg">Wicket!</h3>
                <p className="text-white/40 text-xs">How was the batsman out?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {types.map(t => (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onConfirm(t.toUpperCase().replace(/ /g, "_"))}
                  className="py-3 px-4 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:border-[#E8390E]/60 hover:bg-[#E8390E]/10 hover:text-white transition-all text-left"
                >
                  {t}
                </motion.button>
              ))}
            </div>
            <button onClick={onClose} className="w-full mt-3 py-3 rounded-2xl text-white/30 text-sm font-medium hover:text-white/50 transition-colors">
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Undo Sheet ─────────────────────────────────────────────────────────────
function UndoSheet({ isOpen, lastBall, onClose, onConfirm }: {
  isOpen: boolean; lastBall: string; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 38 } }}
            exit={{ y: "100%", opacity: 0, transition: { duration: 0.22 } }}
            className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-3xl z-50 p-6"
          >
            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5" />
            <h3 className="font-black text-white text-xl mb-1">Undo last ball?</h3>
            <p className="text-white/40 text-sm mb-6">
              Last entry: <span className="font-bold text-white">{lastBall}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onClose} className="py-4 rounded-2xl bg-white/8 text-white/60 font-semibold hover:bg-white/12 transition-colors">
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="py-4 rounded-2xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
              >
                Undo Ball
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Innings Complete Screen ────────────────────────────────────────────────
function InningsCompleteScreen({
  inningsNumber, runs, wickets, overs, teamName, target, onStartSecond, onEndMatch, isStarting,
}: {
  inningsNumber: number; runs: number; wickets: number; overs: string;
  teamName: string; target?: number | null; onStartSecond?: () => void;
  onEndMatch?: () => void; isStarting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 26 } }}
      className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col items-center justify-center p-6"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#E8390E]/10 rounded-full blur-[100px]" />
      </div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.15, type: "spring", stiffness: 260 } }}
        className="text-center relative z-10 w-full max-w-sm"
      >
        <div className="w-20 h-20 bg-[#E8390E]/15 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#E8390E]/30">
          <Trophy className="w-10 h-10 text-[#E8390E]" />
        </div>
        <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-2">
          Innings {inningsNumber} Complete
        </p>
        <p className="font-black text-white text-3xl mb-1 tracking-tight">{teamName}</p>
        <div className="flex items-baseline justify-center gap-2 my-4">
          <span className="text-6xl font-black text-white">{runs}</span>
          <span className="text-3xl text-white/30 font-bold">/{wickets}</span>
        </div>
        <p className="text-white/40 text-base">{overs} overs</p>

        {inningsNumber === 1 && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Target</p>
            <p className="text-4xl font-black text-[#E8390E]">{runs + 1}</p>
          </div>
        )}

        {inningsNumber === 2 && target !== null && target !== undefined && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs">
              {runs >= target
                ? "🎉 Target achieved!"
                : `Fell ${target - runs - 1} run${target - runs - 1 !== 1 ? "s" : ""} short`}
            </p>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {inningsNumber === 1 && onStartSecond && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onStartSecond}
              disabled={isStarting}
              className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-black py-5 rounded-2xl shadow-[0_0_50px_rgba(232,57,14,0.4)] flex items-center justify-center gap-2 text-base disabled:opacity-60"
            >
              {isStarting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Zap className="w-5 h-5" />Start 2nd Innings</>
              )}
            </motion.button>
          )}
          {inningsNumber === 2 && onEndMatch && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onEndMatch}
              className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-black py-5 rounded-2xl shadow-[0_0_50px_rgba(232,57,14,0.4)] flex items-center justify-center gap-2 text-base"
            >
              <Trophy className="w-5 h-5" /> End Match & See Result
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Match Complete Screen ──────────────────────────────────────────────────
function MatchCompleteScreen({ result, onBack }: { result: string; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col items-center justify-center p-6"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
      </div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.2, type: "spring", stiffness: 260 } }}
        className="text-center relative z-10 w-full max-w-sm"
      >
        <div className="text-6xl mb-6">🏆</div>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-semibold">Match Result</p>
        <p className="font-black text-white text-2xl leading-tight mb-8">{result}</p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className="w-full bg-white/10 border border-white/15 text-white font-bold py-4 rounded-2xl"
        >
          Back to Home
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Scoring Page ──────────────────────────────────────────────────────
export default function MatchScoringPage({ params }: { params: { matchId: string } }) {
  const router = useRouter();
  const { data: match, isLoading, refetch } = trpc.match.getById.useQuery({ id: params.matchId }, { refetchInterval: false });

  // Selections
  const [strikerId, setStrikerId] = useState<string>("");
  const [nonStrikerId, setNonStrikerId] = useState<string>("");
  const [bowlerId, setBowlerId] = useState<string>("");

  // UI state
  const [showOpenerPick, setShowOpenerPick] = useState<"striker" | "nonStriker" | "bowler" | null>(null);
  const [showNewBatsman, setShowNewBatsman] = useState(false);
  const [showNewBowler, setShowNewBowler] = useState(false);
  const [showWicket, setShowWicket] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [pendingWicketType, setPendingWicketType] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; color?: string } | null>(null);

  // Local override for optimistic UI
  const [optimisticOver, setOptimisticOver] = useState<string[] | null>(null);
  const [optimisticScore, setOptimisticScore] = useState<{ runs: number; wickets: number; balls: number } | null>(null);

  // Innings management
  const [showInningsComplete, setShowInningsComplete] = useState(false);
  const [showMatchComplete, setShowMatchComplete] = useState(false);
  const [matchResult, setMatchResult] = useState("");

  // Initialization phase
  const [phase, setPhase] = useState<"init" | "scoring">("init");
  const [initStep, setInitStep] = useState<"striker" | "nonStriker" | "bowler">("striker");

  // Shot Picker Flow
  const [shotDataPending, setShotDataPending] = useState<{ ballId: string; runs: number } | null>(null);

  const isInitialised = strikerId && nonStrikerId && bowlerId;

  // Mutations
  const recordBallMutation = trpc.match.recordBall.useMutation({
    onSuccess: (data) => {
      refetch();
      // If runs scored off the bat, open shot picker
      if (data.ball && data.ball.runs > 0 && !data.ball.isWide && !data.ball.isNoBall && !data.ball.isWicket && !data.ball.isBye && !data.ball.isLegBye) {
        setShotDataPending({ ballId: data.ball.id, runs: data.ball.runs });
      }
    }
  });
  const updateShotMutation = trpc.match.updateBallShot.useMutation();
  const undoMutation = trpc.match.undoLastBall.useMutation({ onSuccess: () => { refetch(); showToastMsg("Last ball removed", "amber"); } });
  const completeInningsMutation = trpc.match.completeInnings.useMutation({ onSuccess: () => { refetch(); setShowInningsComplete(true); } });
  const startSecondInningsMutation = trpc.match.startSecondInnings.useMutation({
    onSuccess: () => { refetch(); setShowInningsComplete(false); setPhase("init"); setInitStep("striker"); setStrikerId(""); setNonStrikerId(""); setBowlerId(""); setOptimisticOver(null); setOptimisticScore(null); }
  });
  const endMatchMutation = trpc.match.endMatch.useMutation({
    onSuccess: (data) => { setMatchResult(data.result ?? "Match Complete"); setShowInningsComplete(false); setShowMatchComplete(true); }
  });

  // Sync from server - once we have data and are in init phase
  useEffect(() => {
    if (!match) return;
    if (match.status === "COMPLETED") {
      setMatchResult(match.result ?? "Match Complete");
      setShowMatchComplete(true);
    }
    if (match.isInningsComplete && !showInningsComplete) {
      setShowInningsComplete(true);
    }
    // If there are balls already, restore state
    if (match.striker?.id && match.bowler?.id && phase === "init") {
      setStrikerId(match.striker.id);
      setNonStrikerId(match.nonStriker?.id ?? "");
      setBowlerId(match.bowler.id);
      if (match.score.balls > 0) setPhase("scoring");
    }
  }, [match]);

  // Clear optimistic when server data updates
  useEffect(() => {
    if (match) { setOptimisticOver(null); setOptimisticScore(null); }
  }, [match?.score.balls]);

  // Pusher subscription
  useEffect(() => {
    const channel = pusherClient.subscribe(`match-${params.matchId}`);
    channel.bind("score-update", () => refetch());
    channel.bind("innings-complete", () => { refetch(); setShowInningsComplete(true); });
    channel.bind("second-innings-started", () => refetch());
    channel.bind("match-complete", (data: { result: string }) => {
      setMatchResult(data.result);
      setShowMatchComplete(true);
    });
    return () => pusherClient.unsubscribe(`match-${params.matchId}`);
  }, [params.matchId, refetch]);

  const currentOver = optimisticOver ?? match?.currentOver ?? [];
  const totalScore = optimisticScore ?? match?.score ?? { runs: 0, wickets: 0, balls: 0 };
  const overs = Math.floor(totalScore.balls / 6);
  const ballsInOver = totalScore.balls % 6;
  const maxOvers = match?.overs ?? 20;

  const showToastMsg = (msg: string, color = "white") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  };

  // ── Check end conditions ──────────────────────────────────────────────────
  const checkInningsEnd = useCallback((newScore: { runs: number; wickets: number; balls: number }, target: number | null) => {
    const allOut = newScore.wickets >= 10;
    const oversUp = maxOvers > 0 && newScore.balls >= maxOvers * 6;
    const targetHit = target !== null && newScore.runs >= target;
    return allOut || oversUp || targetHit;
  }, [maxOvers]);

  // ── Record a ball ─────────────────────────────────────────────────────────
  const recordBall = useCallback((display: string, runsAdded: number, isWicket = false, isExtra = false, dismissalType?: string) => {
    if (!match?.inningsId || !strikerId || !bowlerId) return;
    vibrate(isWicket ? [80, 40, 80] : 30);

    // Optimistic score update
    const baseScore = optimisticScore ?? match.score ?? { runs: 0, wickets: 0, balls: 0 };
    const newScore = isExtra
      ? { ...baseScore, runs: baseScore.runs + runsAdded }
      : { runs: baseScore.runs + runsAdded, wickets: baseScore.wickets + (isWicket ? 1 : 0), balls: baseScore.balls + 1 };
    setOptimisticScore(newScore);

    // Optimistic over update
    const baseOver = optimisticOver ?? (match.currentOver ?? []);
    const nextOver = isExtra ? [...baseOver] : [...baseOver, display === "0" ? "." : display];
    const legalInNext = nextOver.filter(b => b !== "wd" && b !== "nb").length;

    const isOverComplete = !isExtra && legalInNext >= 6;
    setOptimisticOver(isOverComplete ? [] : nextOver);

    // Strike rotation: rotate on odd runs (1, 3, 5...) at end of a legal ball
    const isLegalBall = !isExtra;
    if (isLegalBall && !isWicket) {
      if (runsAdded % 2 !== 0) {
        // Swap strike
        setStrikerId(nonStrikerId);
        setNonStrikerId(strikerId);
      }
    }

    // Persist to DB
    recordBallMutation.mutate({
      matchId: params.matchId,
      inningsId: match.inningsId,
      runs: runsAdded,
      isWicket,
      isWide: display === "wd",
      isNoBall: display === "nb",
      isLegBye: display === "lb",
      isBye: display === "by",
      dismissalType,
      batsmanId: strikerId,
      bowlerId,
    });

    // Check innings end
    if (checkInningsEnd(newScore, match.target)) {
      setTimeout(() => {
        completeInningsMutation.mutate({ inningsId: match.inningsId!, matchId: params.matchId });
      }, 500);
      return;
    }

    // Over complete — prompt new bowler, rotate strike
    if (isOverComplete) {
      // At end of over, always rotate strike
      setStrikerId(s => {
        const old = s;
        setNonStrikerId(old);
        return nonStrikerId;
      });
      setTimeout(() => setShowNewBowler(true), 400);
      showToastMsg("Over complete! Select next bowler.", "blue");
    }

    // Wicket — prompt new batsman (after we pick dismissal type)
    if (isWicket) {
      setTimeout(() => setShowNewBatsman(true), 600);
    }
  }, [match, strikerId, nonStrikerId, bowlerId, optimisticScore, optimisticOver, checkInningsEnd]);

  // ── Handle wicket button ──────────────────────────────────────────────────
  const handleWicketButton = () => setShowWicket(true);

  const confirmWicket = (type: string) => {
    setShowWicket(false);
    setPendingWicketType(type);
    recordBall("W", 0, true, false, type);
    showToastMsg(`Wicket! ${type.replace(/_/g, " ")}`, "red");
  };

  // ── Handle Shot Save ───────────────────────────────────────────────────────
  const saveShotData = (shotType: string | null, fieldAngle: number | null) => {
    if (shotDataPending) {
      updateShotMutation.mutate({ ballId: shotDataPending.ballId, shotType: shotType ?? undefined, fieldAngle: fieldAngle ?? undefined });
      setShotDataPending(null);
    }
  };

  // ── Handle undo ────────────────────────────────────────────────────────────
  const handleUndo = () => {
    if (currentOver.length === 0 && totalScore.balls === 0) return;
    setShowUndo(true);
  };

  const confirmUndo = () => {
    setShowUndo(false);
    if (match?.inningsId) undoMutation.mutate({ inningsId: match.inningsId, matchId: params.matchId });
  };

  // ── End match ──────────────────────────────────────────────────────────────
  const handleEndMatch = () => {
    if (!match) return;
    const innings2Runs = match.score.runs;
    const target = match.target ?? 0;
    const battingTeam = match.battingTeamId === match.homeTeamId ? match.homeTeam : match.awayTeam;
    const bowlingTeam = match.battingTeamId === match.homeTeamId ? match.awayTeam : match.homeTeam;

    let result = "Match tied";
    if (innings2Runs >= target) {
      const wktsLeft = 10 - match.score.wickets;
      result = `${battingTeam} won by ${wktsLeft} wicket${wktsLeft !== 1 ? "s" : ""}`;
    } else {
      const diff = target - innings2Runs - 1;
      result = `${bowlingTeam} won by ${diff} run${diff !== 1 ? "s" : ""}`;
    }
    endMatchMutation.mutate({ matchId: params.matchId, result });
  };

  const lastBallDisplay = currentOver.length > 0 ? currentOver[currentOver.length - 1] : "—";

  // ── Derive available players for selection ─────────────────────────────────
  const notYetBatted = (match?.notYetBatted ?? []).filter(p => p.id !== strikerId && p.id !== nonStrikerId);
  const bowlingPlayers = (match?.bowlingPlayers ?? []);
  const availableBowlers = bowlingPlayers.filter(p => p.id !== bowlerId);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading || !match) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-white/15 border-t-[#E8390E] rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Loading match…</p>
      </div>
    );
  }

  // ── Match Complete ─────────────────────────────────────────────────────────
  if (showMatchComplete) {
    return <MatchCompleteScreen result={matchResult} onBack={() => router.push("/")} />;
  }

  // ── Innings Complete ───────────────────────────────────────────────────────
  if (showInningsComplete) {
    const innings1Done = match.inningsNumber === 1;
    return (
      <InningsCompleteScreen
        inningsNumber={match.inningsNumber}
        runs={match.score.runs}
        wickets={match.score.wickets}
        overs={`${overs}.${ballsInOver}`}
        teamName={match.battingTeamId === match.homeTeamId ? match.homeTeam : match.awayTeam}
        target={match.target}
        onStartSecond={innings1Done ? () => startSecondInningsMutation.mutate({ matchId: params.matchId }) : undefined}
        onEndMatch={!innings1Done ? handleEndMatch : undefined}
        isStarting={startSecondInningsMutation.isPending}
      />
    );
  }

  // ── Init Phase ─────────────────────────────────────────────────────────────
  if (phase === "init") {
    const battingPlayers = match.battingPlayers ?? [];
    const bowlingTeamPlayers = match.bowlingPlayers ?? [];

    return (
      <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8390E]/8 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 px-4 pt-16 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#E8390E] rounded-full animate-pulse" />
              <span className="text-[#E8390E] text-xs font-bold uppercase tracking-widest">Live</span>
              <span className="text-white/30 text-xs ml-1">{match.homeTeam} vs {match.awayTeam}</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Select Opening Players</h1>
            <p className="text-white/40 text-sm mt-1">Pick the openers and first bowler to begin scoring</p>
          </motion.div>

          <div className="space-y-4">
            {/* Striker */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">🏏 Striker (On Strike)</label>
              <button
                onClick={() => setInitStep("striker")}
                className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  strikerId
                    ? "bg-[#E8390E]/10 border-[#E8390E]/40"
                    : "bg-white/5 border-white/10 hover:border-white/25"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                  {strikerId ? (battingPlayers.find(p => p.id === strikerId)?.name ?? "?").slice(0, 2).toUpperCase() : "?"}
                </div>
                <span className={strikerId ? "font-bold text-white" : "text-white/30"}>
                  {strikerId ? battingPlayers.find(p => p.id === strikerId)?.name : "Tap to select…"}
                </span>
                {strikerId && <span className="ml-auto text-[10px] font-bold text-[#E8390E] uppercase">On Strike</span>}
              </button>
            </motion.div>

            {/* Non-Striker */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.18 } }}>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">🏏 Non-Striker</label>
              <button
                onClick={() => setInitStep("nonStriker")}
                className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  nonStrikerId
                    ? "bg-white/8 border-white/20"
                    : "bg-white/5 border-white/10 hover:border-white/25"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                  {nonStrikerId ? (battingPlayers.find(p => p.id === nonStrikerId)?.name ?? "?").slice(0, 2).toUpperCase() : "?"}
                </div>
                <span className={nonStrikerId ? "font-bold text-white" : "text-white/30"}>
                  {nonStrikerId ? battingPlayers.find(p => p.id === nonStrikerId)?.name : "Tap to select…"}
                </span>
              </button>
            </motion.div>

            {/* Bowler */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.26 } }}>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">⚾ Opening Bowler</label>
              <button
                onClick={() => setInitStep("bowler")}
                className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  bowlerId
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-white/5 border-white/10 hover:border-white/25"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                  {bowlerId ? (bowlingTeamPlayers.find(p => p.id === bowlerId)?.name ?? "?").slice(0, 2).toUpperCase() : "?"}
                </div>
                <span className={bowlerId ? "font-bold text-white" : "text-white/30"}>
                  {bowlerId ? bowlingTeamPlayers.find(p => p.id === bowlerId)?.name : "Tap to select…"}
                </span>
              </button>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
              whileTap={{ scale: 0.96 }}
              disabled={!strikerId || !nonStrikerId || !bowlerId}
              onClick={() => setPhase("scoring")}
              className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-black py-5 rounded-2xl disabled:opacity-30 shadow-[0_0_50px_rgba(232,57,14,0.4)] flex items-center justify-center gap-2 text-base mt-4"
            >
              <Zap className="w-5 h-5" /> Begin Scoring
            </motion.button>
          </div>
        </div>

        {/* Player select sheets for init */}
        <PlayerSelectSheet
          isOpen={initStep === "striker" && phase === "init"}
          title="Select Striker"
          subtitle="Batsman who will face first"
          players={battingPlayers.filter(p => p.id !== nonStrikerId)}
          onSelect={p => { setStrikerId(p.id); }}
          onClose={() => {}}
          allowClose={false}
        />
        <PlayerSelectSheet
          isOpen={initStep === "nonStriker" && phase === "init"}
          title="Select Non-Striker"
          subtitle="Batsman at the non-striker end"
          players={battingPlayers.filter(p => p.id !== strikerId)}
          onSelect={p => { setNonStrikerId(p.id); }}
          onClose={() => {}}
          allowClose={false}
        />
        <PlayerSelectSheet
          isOpen={initStep === "bowler" && phase === "init"}
          title="Select Opening Bowler"
          subtitle="Who will bowl the first over?"
          players={bowlingTeamPlayers}
          onSelect={p => { setBowlerId(p.id); }}
          onClose={() => {}}
          allowClose={false}
        />
      </div>
    );
  }

  // ── Scoring View ───────────────────────────────────────────────────────────
  const striker = match.battingPlayers.find(p => p.id === strikerId) ?? match.striker;
  const nonStriker = match.battingPlayers.find(p => p.id === nonStrikerId) ?? match.nonStriker;
  const bowler = match.bowlingPlayers.find(p => p.id === bowlerId) ?? match.bowler;
  const strikerStats = match.striker.id === strikerId ? match.striker : { runs: 0, balls: 0 };
  const nonStrikerStats = match.nonStriker.id === nonStrikerId ? match.nonStriker : { runs: 0, balls: 0 };
  const bowlerStats = match.bowler.id === bowlerId ? match.bowler : { wickets: 0, runs: 0, overs: "0.0" };

  const needsRun = match.target ? match.target - totalScore.runs : null;
  const needsBalls = match.target ? maxOvers * 6 - totalScore.balls : null;
  const rrr = needsRun && needsBalls && needsBalls > 0 ? ((needsRun / needsBalls) * 6).toFixed(2) : null;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] overflow-hidden">

      {/* ── Scoreboard ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F0F0F] border-b border-white/8 px-4 pt-12 pb-4 flex-shrink-0"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#E8390E]/15 border border-[#E8390E]/30 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-[#E8390E] rounded-full animate-pulse" />
              <span className="text-[#E8390E] text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>
            <span className="text-white/25 text-xs">{match.homeTeam} vs {match.awayTeam}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={currentOver.length === 0 && totalScore.balls === 0}
              className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/30 hover:text-amber-400 hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main score */}
        <div className="flex items-end justify-between">
          <div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={totalScore.runs}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }}
                className="flex items-baseline gap-1.5"
              >
                <span className="text-5xl font-black text-white tracking-tighter leading-none">{totalScore.runs}</span>
                <span className="text-2xl text-white/30 font-bold">/{totalScore.wickets}</span>
              </motion.div>
            </AnimatePresence>
            <div className="text-white/40 text-sm mt-1">
              {overs}.{ballsInOver}
              {maxOvers > 0 && <span className="text-white/25"> / {maxOvers}</span>} Ov
              {match.inningsNumber === 2 && <span className="text-xs text-white/25 ml-2">Inn 2</span>}
            </div>
          </div>
          {match.target && (
            <div className="text-right">
              <p className="text-white/25 text-[10px] uppercase tracking-wide">Target</p>
              <p className="text-2xl font-black text-[#E8390E]">{match.target}</p>
              {needsRun !== null && (
                <p className="text-white/30 text-[10px] mt-0.5">
                  Need {needsRun} off {needsBalls}
                  {rrr && <span className="ml-1 text-amber-400">RRR {rrr}</span>}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Current over */}
        <div className="flex items-center gap-1.5 mt-3 min-h-[2rem]">
          <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest mr-1 flex-shrink-0">Over</span>
          {currentOver.length === 0 ? (
            <span className="text-white/15 text-xs">—</span>
          ) : (
            currentOver.map((b, i) => <BallDot key={i} val={b} animate={i === currentOver.length - 1} />)
          )}
        </div>
      </motion.div>

      {/* ── Batters & Bowler ── */}
      <div className="bg-[#141414] border-b border-white/8 px-4 py-3 flex-shrink-0 space-y-2">
        {/* Striker */}
        <div className="flex justify-between items-center bg-[#E8390E]/8 border-l-2 border-[#E8390E] px-3 py-2.5 rounded-r-xl">
          <div className="flex items-center gap-2">
            <span className="text-base">🏏</span>
            <span className="font-bold text-sm text-white">{striker.name}</span>
            <span className="text-[9px] text-[#E8390E] font-black bg-[#E8390E]/15 px-1.5 py-0.5 rounded uppercase">Strike</span>
          </div>
          <span className="font-mono font-bold text-white text-sm">
            {strikerStats.runs}<span className="text-white/30 text-xs font-normal">({strikerStats.balls})</span>
          </span>
        </div>
        {/* Non-Striker */}
        <div className="flex justify-between items-center px-3 py-1.5 pl-5">
          <span className="text-white/50 text-sm font-medium">{nonStriker.name}</span>
          <span className="font-mono text-white/40 text-sm">
            {nonStrikerStats.runs}<span className="text-white/20 text-xs">({nonStrikerStats.balls})</span>
          </span>
        </div>
        {/* Bowler */}
        <div className="flex justify-between items-center border-t border-white/5 pt-2 px-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⚾</span>
            <span className="text-white/60 text-sm font-medium">{bowler.name}</span>
          </div>
          <span className="font-mono text-sm text-white/40">
            {bowlerStats.wickets}/{bowlerStats.runs}
            <span className="text-white/25 text-xs"> ({bowlerStats.overs})</span>
          </span>
        </div>
      </div>

      {/* ── Scoring Pad ── */}
      <div className="flex-1 bg-[#0A0A0A] p-3 overflow-hidden flex flex-col gap-2">

        {/* Runs 0–3 */}
        <div className="grid grid-cols-4 gap-2 flex-1">
          {[0, 1, 2, 3].map(r => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.88, transition: { duration: 0.08 } }}
              onClick={() => recordBall(r === 0 ? "0" : r.toString(), r)}
              className="bg-[#1A1A1A] hover:bg-[#222] border border-white/8 hover:border-white/20 rounded-2xl flex items-center justify-center text-white font-black text-2xl transition-colors active:bg-white/10"
            >
              {r}
            </motion.button>
          ))}
        </div>

        {/* 4 and 6 */}
        <div className="grid grid-cols-2 gap-2 flex-1">
          <motion.button
            whileTap={{ scale: 0.9, transition: { duration: 0.08 } }}
            onClick={() => recordBall("4", 4)}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl text-blue-400 font-black text-2xl flex items-center justify-center gap-2 transition-all"
          >
            4 <span className="text-sm font-semibold opacity-60">FOUR</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9, transition: { duration: 0.08 } }}
            onClick={() => recordBall("6", 6)}
            className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-400/50 rounded-2xl text-emerald-400 font-black text-2xl flex items-center justify-center gap-2 transition-all"
          >
            6 <span className="text-sm font-semibold opacity-60">SIX</span>
          </motion.button>
        </div>

        {/* Extras */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "WD", desc: "Wide", val: "wd", runs: 1 },
            { label: "NB", desc: "No Ball", val: "nb", runs: 1 },
            { label: "BYE", desc: "Bye", val: "by", runs: 0 },
            { label: "LB", desc: "Leg Bye", val: "lb", runs: 0 },
          ].map(e => (
            <motion.button
              key={e.val}
              whileTap={{ scale: 0.9 }}
              onClick={() => recordBall(e.val, e.runs, false, true)}
              className="py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black hover:bg-amber-500/20 transition-colors uppercase tracking-wider"
            >
              {e.label}
            </motion.button>
          ))}
        </div>

        {/* Wicket */}
        <motion.button
          whileTap={{ scale: 0.96, transition: { duration: 0.08 } }}
          onClick={handleWicketButton}
          className="w-full py-4 rounded-2xl bg-[#E8390E] text-white text-lg font-black shadow-[0_0_30px_rgba(232,57,14,0.4)] hover:shadow-[0_0_50px_rgba(232,57,14,0.6)] flex items-center justify-center gap-3 transition-shadow"
        >
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-sm font-black">W</div>
          WICKET
        </motion.button>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm font-bold shadow-xl z-50 ${
              toast.color === "red" ? "bg-[#E8390E] text-white" :
              toast.color === "amber" ? "bg-amber-500 text-white" :
              toast.color === "blue" ? "bg-blue-500 text-white" :
              "bg-white text-[#1A1A1A]"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sheets ── */}
      <WicketSheet isOpen={showWicket} onClose={() => setShowWicket(false)} onConfirm={confirmWicket} />
      <UndoSheet isOpen={showUndo} lastBall={lastBallDisplay} onClose={() => setShowUndo(false)} onConfirm={confirmUndo} />

      <PlayerSelectSheet
        isOpen={showNewBatsman}
        title="New Batsman"
        subtitle="Select the incoming batsman"
        players={notYetBatted}
        onSelect={p => { setStrikerId(p.id); setShowNewBatsman(false); showToastMsg(`${p.name} is batting`, "white"); }}
        allowClose={true}
        onClose={() => setShowNewBatsman(false)}
      />

      <PlayerSelectSheet
        isOpen={showNewBowler}
        title="New Bowler"
        subtitle="Select the bowler for the next over"
        players={availableBowlers}
        onSelect={p => { setBowlerId(p.id); setShowNewBowler(false); showToastMsg(`${p.name} will bowl`, "blue"); }}
        allowClose={false}
      />

      <ShotPickerSheet
        isOpen={!!shotDataPending}
        runs={shotDataPending?.runs ?? 0}
        onSave={saveShotData}
        onSkip={() => setShotDataPending(null)}
      />
    </div>
  );
}
