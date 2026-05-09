"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, Settings, ChevronDown, Activity, Battery, BatteryCharging, History } from "lucide-react";
import NumPad from "@/components/scoring/NumPad";
import ScoreDisplay from "@/components/scoring/ScoreDisplay";
import LiveBallTracker from "@/components/scoring/LiveBallTracker";
import WicketSheet from "@/components/scoring/WicketSheet";
import { trpc } from "@/app/_trpc/client";

export default function MatchScoringPage({ params }: { params: { matchId: string } }) {
  const [isWicketSheetOpen, setIsWicketSheetOpen] = useState(false);
  const [currentOver, setCurrentOver] = useState<string[]>([]);
  
  const { data: match, isLoading } = trpc.match.getById.useQuery({ id: params.matchId });

  const handleRun = (runs: number) => {
    // Vibrate on score
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    setCurrentOver([...currentOver, runs.toString()]);
  };

  const handleWicket = () => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([100, 50, 100]); // Danger pattern
    }
    setIsWicketSheetOpen(true);
  };

  if (isLoading || !match) return <div className="p-8 text-center">Loading match...</div>;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-bold text-destructive">{match.status}</span>
          <span className="text-sm font-medium ml-2 text-muted-foreground">{match.homeTeam} vs {match.awayTeam}</span>
        </div>
        <div className="flex gap-4">
          <button className="text-muted-foreground hover:text-foreground">
            <Undo2 className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Score Area (Scrollable if needed, but flex-1 keeps it contained) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ScoreDisplay score={match.score} target={match.target} />
        
        {/* Batters */}
        <div className="bg-surface rounded-xl border border-border p-3 space-y-2">
          <div className="flex justify-between items-center bg-accent/10 p-2 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-accent text-xl">🏏</span>
              <span className="font-bold">{match.striker.name}</span>
            </div>
            <div className="font-mono font-bold">
              {match.striker.runs} <span className="text-xs text-muted-foreground font-sans font-normal">({match.striker.balls})</span>
            </div>
          </div>
          <div className="flex justify-between items-center p-2">
            <div className="flex items-center gap-2 pl-7">
              <span className="font-medium text-muted-foreground">{match.nonStriker.name}</span>
            </div>
            <div className="font-mono text-muted-foreground">
              {match.nonStriker.runs} <span className="text-xs text-muted-foreground font-sans font-normal">({match.nonStriker.balls})</span>
            </div>
          </div>
        </div>

        {/* Bowler */}
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-primary text-xl">⚾</span>
              <span className="font-bold">{match.bowler.name}</span>
            </div>
            <div className="font-mono">
              {match.bowler.wickets}-{match.bowler.runs} <span className="text-xs text-muted-foreground font-sans">({match.bowler.overs})</span>
            </div>
          </div>
          
          <LiveBallTracker balls={currentOver} />
        </div>

        {/* Action Bar */}
        <div className="flex gap-2">
           <button className="flex-1 bg-surface border border-border py-2 rounded-lg text-sm font-medium hover:bg-surface/80 flex items-center justify-center gap-2">
             <History className="w-4 h-4" /> Match Log
           </button>
           <button className="flex-1 bg-surface border border-border py-2 rounded-lg text-sm font-medium hover:bg-surface/80 flex items-center justify-center gap-2">
             <Activity className="w-4 h-4" /> Stats
           </button>
        </div>
      </div>

      {/* Input Pad - Fixed at bottom */}
      <div className="bg-surface border-t border-border p-4 pb-safe">
        <NumPad onScore={handleRun} onWicket={handleWicket} />
      </div>

      <WicketSheet 
        isOpen={isWicketSheetOpen} 
        onClose={() => setIsWicketSheetOpen(false)} 
      />
    </div>
  );
}
