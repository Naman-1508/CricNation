"use client";

import { motion } from "framer-motion";

interface LiveBallTrackerProps {
  balls: string[];
}

export default function LiveBallTracker({ balls }: LiveBallTrackerProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
      <span className="text-xs text-muted-foreground mr-1 font-bold">This Over:</span>
      {balls.map((ball, i) => {
        let bgColor = "bg-muted text-muted-foreground"; // dot ball
        if (ball === 'W') bgColor = "bg-destructive text-white";
        else if (ball === '4') bgColor = "bg-blue-500 text-white";
        else if (ball === '6') bgColor = "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]";
        else if (['1', '2', '3'].includes(ball)) bgColor = "bg-background border border-border text-foreground";
        else if (ball.includes('Wd') || ball.includes('Nb')) bgColor = "bg-amber-500 text-white";

        return (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={i} 
            className={`min-w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${bgColor}`}
          >
            {ball}
          </motion.div>
        );
      })}
    </div>
  );
}
