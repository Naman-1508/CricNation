"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Settings, Activity, History, X, Check } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

import { pusherClient } from "@/lib/pusherClient";

// ─── Ball dot display ───────────────────────────────────────────
function BallDot({ val }: { val: string }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold";
  if (val === "W") return <div className={`${base} bg-[#E8390E] text-white`}>W</div>;
  if (val === "4") return <div className={`${base} bg-blue-600 text-white`}>4</div>;
  if (val === "6") return <div className={`${base} bg-green-600 text-white`}>6</div>;
  if (val === "wd" || val === "nb") return <div className={`${base} bg-amber-100 text-amber-700 border border-amber-300`}>{val.toUpperCase()}</div>;
  if (val === "0" || val === ".") return <div className={`${base} bg-[#F2EFE9] text-[#8A8278] border border-[rgba(107,74,42,0.15)]`}>•</div>;
  return <div className={`${base} bg-[#1A1A1A] text-white`}>{val}</div>;
}

// ─── Wicket confirmation sheet ──────────────────────────────────
function WicketSheet({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: (type: string) => void }) {
  const types = ["Bowled", "Caught", "LBW", "Run Out", "Stumped", "Hit Wicket"];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-40" onClick={onClose} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6">
            <div className="w-10 h-1 bg-[rgba(107,74,42,0.2)] rounded-full mx-auto mb-5" />
            <h3 className="font-bold text-[#1A1A1A] text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#E8390E] rounded-lg flex items-center justify-center text-white text-sm font-bold">W</span>
              How was the batsman out?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {types.map(t => (
                <button key={t} onClick={() => onConfirm(t.toUpperCase().replace(" ", "_"))}
                  className="py-3 px-4 rounded-xl border border-[rgba(107,74,42,0.15)] text-sm font-medium text-[#1A1A1A] hover:border-[#E8390E] hover:text-[#E8390E] hover:bg-[#E8390E]/5 transition-all text-left">
                  {t}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="w-full mt-3 py-3 rounded-xl text-[#8A8278] text-sm font-medium">Cancel</button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Undo confirmation sheet ────────────────────────────────────
function UndoSheet({ isOpen, lastBall, onClose, onConfirm }: {
  isOpen: boolean; lastBall: string; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-40" onClick={onClose} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6">
            <div className="w-10 h-1 bg-[rgba(107,74,42,0.2)] rounded-full mx-auto mb-5" />
            <h3 className="font-bold text-[#1A1A1A] text-lg mb-1">Undo last ball?</h3>
            <p className="text-[#8A8278] text-sm mb-5">Last entry: <span className="font-semibold text-[#1A1A1A]">{lastBall}</span></p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onClose} className="py-3 rounded-xl bg-[#F2EFE9] text-[#4A4540] font-medium">Cancel</button>
              <button onClick={onConfirm} className="py-3 rounded-xl bg-amber-50 text-amber-700 font-semibold border border-amber-200">Undo Ball</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Scoring Page ──────────────────────────────────────────
export default function MatchScoringPage({ params }: { params: { matchId: string } }) {
  const { data: match, isLoading, refetch } = trpc.match.getById.useQuery({ id: params.matchId });
  const [currentOver, setCurrentOver] = useState<string[]>([]);
  const [totalScore, setTotalScore] = useState({ runs: 0, wickets: 0, balls: 0 });
  const [isWicketOpen, setIsWicketOpen] = useState(false);
  const [isUndoOpen, setIsUndoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [target] = useState<number | null>(null);

  // Sync state with backend data on load
  useEffect(() => {
    if (match) {
      setCurrentOver(match.currentOver || []);
      setTotalScore({
        runs: match.score.runs,
        wickets: match.score.wickets,
        balls: match.score.balls
      });
    }
  }, [match]);

  // Subscribe to Pusher for real-time spectator updates
  useEffect(() => {
    const channelName = `match-${params.matchId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("score-update", (data: { ball: string, runsAdded: number, isWicket: boolean }) => {
      // NOTE: For the scorer themselves, optimistic UI already updated it. 
      // In a real app, we check if the update came from US or from another device. 
      // We can just refetch data on pusher event to keep perfectly in sync.
      refetch();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [params.matchId, refetch]);

  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const recordBallMutation = trpc.match.recordBall.useMutation();

  const recordBall = useCallback((display: string, runsAdded: number, isWicket = false, isExtra = false, dismissalType?: string) => {
    vibrate(isWicket ? [100, 50, 100] : 40);
    
    // Optimistic UI update
    setCurrentOver(prev => {
      const next = [...prev, display];
      const legalBalls = next.filter(b => b !== "wd" && b !== "nb").length;
      if (legalBalls >= 6) return [];
      return next;
    });
    
    if (!isExtra) {
      setTotalScore(prev => ({
        runs: prev.runs + runsAdded,
        wickets: prev.wickets + (isWicket ? 1 : 0),
        balls: prev.balls + (isExtra ? 0 : 1),
      }));
    } else {
      setTotalScore(prev => ({ ...prev, runs: prev.runs + runsAdded }));
    }

    // Save to Database
    if (match?.inningsId) {
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
        batsmanId: match.striker.id,
        bowlerId: match.bowler.id,
      });
    }
  }, [match, params.matchId]);

  const handleUndo = () => {
    if (currentOver.length === 0 && totalScore.balls === 0) return;
    setIsUndoOpen(true);
  };

  const confirmUndo = () => {
    const last = currentOver[currentOver.length - 1];
    setCurrentOver(prev => prev.slice(0, -1));
    // Revert score estimate
    if (last === "W") setTotalScore(prev => ({ ...prev, wickets: Math.max(0, prev.wickets - 1), balls: Math.max(0, prev.balls - 1) }));
    else if (last === "wd" || last === "nb") setTotalScore(prev => ({ ...prev, runs: Math.max(0, prev.runs - 1) }));
    else {
      const runs = parseInt(last) || 0;
      setTotalScore(prev => ({ runs: Math.max(0, prev.runs - runs), wickets: prev.wickets, balls: Math.max(0, prev.balls - 1) }));
    }
    setIsUndoOpen(false);
    showToast("Last ball removed");
  };

  const overs = Math.floor(totalScore.balls / 6);
  const ballsInOver = totalScore.balls % 6;
  const maxOvers = match?.score ? null : 20;
  const lastBallDisplay = currentOver.length > 0 ? currentOver[currentOver.length - 1] : "—";

  if (isLoading || !match) {
    return (
      <div className="h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-white gap-3">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-sm text-white/50">Loading match...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAF8] overflow-hidden">
      {/* ── Top Score Bar ── */}
      <div className="bg-[#1A1A1A] px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#E8390E] rounded-full animate-pulse" />
            <span className="text-[#E8390E] text-xs font-bold uppercase tracking-wide">Live</span>
            <span className="text-white/40 text-xs ml-1">{match.homeTeam} vs {match.awayTeam}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={handleUndo} className="text-white/40 hover:text-amber-400 transition-colors" disabled={currentOver.length === 0 && totalScore.balls === 0}>
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="text-white/40 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-5xl font-bold text-white tracking-tight">
              {totalScore.runs}<span className="text-white/40">/{totalScore.wickets}</span>
            </div>
            <div className="text-[#8A8278] text-base mt-1">
              {overs}.{ballsInOver} {maxOvers ? `/ ${maxOvers}` : ""} Ov
            </div>
          </div>
          {target && (
            <div className="text-right">
              <p className="text-white/40 text-xs">Target</p>
              <p className="text-white text-2xl font-bold">{target}</p>
              <p className="text-white/40 text-xs">Need {target - totalScore.runs} off {(maxOvers! * 6) - totalScore.balls} balls</p>
            </div>
          )}
        </div>

        {/* Current Over Balls */}
        <div className="flex items-center gap-1.5 mt-3 min-h-[2rem]">
          <span className="text-white/30 text-[10px] mr-1">THIS OVER</span>
          {currentOver.length === 0
            ? <span className="text-white/20 text-xs">No balls bowled yet</span>
            : currentOver.map((b, i) => <BallDot key={i} val={b} />)
          }
        </div>

        {/* Undo hint */}
        {currentOver.length > 0 && (
          <button onClick={() => setIsUndoOpen(true)} className="flex items-center gap-1.5 mt-2 text-amber-400/70 text-[10px] hover:text-amber-400 transition-colors">
            <RotateCcw className="w-3 h-3" /> Undo: {lastBallDisplay}
          </button>
        )}
      </div>

      {/* ── Batters & Bowler Info ── */}
      <div className="px-4 py-3 bg-white border-b border-[rgba(107,74,42,0.1)] space-y-2">
        <div className="flex justify-between items-center bg-[#E8390E]/5 border-l-[3px] border-[#E8390E] px-3 py-2 rounded-r-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏏</span>
            <span className="font-semibold text-sm text-[#1A1A1A]">{match.striker.name}</span>
            <span className="text-[10px] text-[#E8390E] font-bold bg-[#E8390E]/10 px-1.5 py-0.5 rounded">ON STRIKE</span>
          </div>
          <span className="font-mono font-bold text-[#1A1A1A]">
            {match.striker.runs} <span className="text-[#8A8278] text-xs font-normal">({match.striker.balls})</span>
          </span>
        </div>
        <div className="flex justify-between items-center px-3 py-2">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-[#8A8278] font-medium text-sm">{match.nonStriker.name}</span>
          </div>
          <span className="font-mono text-[#8A8278] text-sm">
            {match.nonStriker.runs} <span className="text-[#8A8278]/60 text-xs">({match.nonStriker.balls})</span>
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-[rgba(107,74,42,0.08)] pt-2 px-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⚾</span>
            <span className="text-[#4A4540] font-medium text-sm">{match.bowler.name}</span>
          </div>
          <span className="font-mono text-sm text-[#4A4540]">
            {match.bowler.wickets}/{match.bowler.runs} <span className="text-[#8A8278] text-xs">({match.bowler.overs})</span>
          </span>
        </div>
      </div>

      {/* ── Scoring NumPad ── */}
      <div className="flex-1 bg-[#FAFAF8] p-4 overflow-hidden">
        <div className="h-full flex flex-col gap-2">
          {/* Runs: 0 1 2 3 */}
          <div className="grid grid-cols-4 gap-2 flex-1">
            {[0, 1, 2, 3].map(r => (
              <motion.button key={r} whileTap={{ scale: 0.93 }}
                onClick={() => recordBall(r === 0 ? "." : r.toString(), r)}
                className="bg-white border-2 border-[rgba(107,74,42,0.15)] rounded-2xl text-2xl font-semibold text-[#1A1A1A] hover:border-[#E8390E] hover:text-[#E8390E] transition-colors flex items-center justify-center">
                {r}
              </motion.button>
            ))}
          </div>

          {/* 4 and 6 */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            <motion.button whileTap={{ scale: 0.93 }}
              onClick={() => recordBall("4", 4)}
              className="bg-blue-600 rounded-2xl text-white text-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              4 <span className="text-sm font-normal opacity-70">FOUR</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.93 }}
              onClick={() => recordBall("6", 6)}
              className="bg-green-600 rounded-2xl text-white text-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
              6 <span className="text-sm font-normal opacity-70">SIX</span>
            </motion.button>
          </div>

          {/* Extras row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "WD", desc: "Wide", val: "wd", runs: 1 },
              { label: "NB", desc: "No Ball", val: "nb", runs: 1 },
              { label: "BYE", desc: "Bye", val: "by", runs: 0 },
              { label: "LB", desc: "Leg Bye", val: "lb", runs: 0 },
            ].map(e => (
              <motion.button key={e.val} whileTap={{ scale: 0.93 }}
                onClick={() => recordBall(e.val, e.runs, false, true)}
                className="py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors">
                {e.label}
              </motion.button>
            ))}
          </div>

          {/* Wicket */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsWicketOpen(true)}
            className="w-full py-4 rounded-2xl bg-[#E8390E] text-white text-lg font-bold shadow-[0_4px_16px_rgba(232,57,14,0.35)] flex items-center justify-center gap-3">
            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-base font-bold">W</span>
            WICKET
          </motion.button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg z-50">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <WicketSheet
        isOpen={isWicketOpen}
        onClose={() => setIsWicketOpen(false)}
        onConfirm={(type) => { recordBall("W", 0, true); setIsWicketOpen(false); showToast(`Wicket! ${type.replace("_", " ")}`); }}
      />
      <UndoSheet
        isOpen={isUndoOpen}
        lastBall={lastBallDisplay}
        onClose={() => setIsUndoOpen(false)}
        onConfirm={confirmUndo}
      />
    </div>
  );
}
