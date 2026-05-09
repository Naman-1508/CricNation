"use client";

import { motion } from "framer-motion";

interface NumPadProps {
  onScore: (runs: number) => void;
  onWicket: () => void;
}

export default function NumPad({ onScore, onWicket }: NumPadProps) {
  const runs = [0, 1, 2, 3, 4, 6];
  const extras = ['Wide', 'No Ball', 'Bye', 'Leg Bye'];

  return (
    <div className="space-y-3">
      {/* Runs */}
      <div className="grid grid-cols-3 gap-2">
        {runs.map((run) => (
          <motion.button
            key={run}
            whileTap={{ scale: 0.95 }}
            onClick={() => onScore(run)}
            className={`h-14 rounded-xl text-xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
              run === 4 ? 'bg-blue-600 hover:bg-blue-500 border-blue-800 text-white' :
              run === 6 ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800 text-white' :
              'bg-surface hover:bg-surface/80 border-border text-foreground'
            }`}
          >
            {run}
          </motion.button>
        ))}
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-4 gap-2">
        <button className="col-span-1 h-12 rounded-xl text-sm font-bold bg-surface hover:bg-surface/80 border-b-4 border-border active:border-b-0 active:translate-y-1 transition-all text-muted-foreground">
          WD
        </button>
        <button className="col-span-1 h-12 rounded-xl text-sm font-bold bg-surface hover:bg-surface/80 border-b-4 border-border active:border-b-0 active:translate-y-1 transition-all text-muted-foreground">
          NB
        </button>
        <button className="col-span-1 h-12 rounded-xl text-sm font-bold bg-surface hover:bg-surface/80 border-b-4 border-border active:border-b-0 active:translate-y-1 transition-all text-muted-foreground">
          LB/B
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onWicket}
          className="col-span-1 h-12 rounded-xl text-sm font-bold bg-destructive/10 hover:bg-destructive/20 border-b-4 border-destructive/30 text-destructive active:border-b-0 active:translate-y-1 transition-all"
        >
          OUT
        </motion.button>
      </div>
    </div>
  );
}
