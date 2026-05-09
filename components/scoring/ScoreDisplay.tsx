"use client";

interface ScoreDisplayProps {
  score: { runs: number; wickets: number; overs: number };
  target?: { runs: number; ballsLeft: number; rrr: number };
}

export default function ScoreDisplay({ score, target }: ScoreDisplayProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 text-center">
      <div className="text-sm font-bold text-muted-foreground mb-1">MUMBAI INDIANS</div>
      <div className="text-6xl font-heading font-black tracking-tight flex items-baseline justify-center">
        {score.runs}<span className="text-3xl text-destructive ml-1">/{score.wickets}</span>
      </div>
      <div className="text-muted-foreground font-mono mt-1 mb-3">
        Overs: <span className="font-bold text-foreground">{score.overs}</span>
      </div>

      {target && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-2 text-sm text-accent">
          Need <strong>{target.runs - score.runs}</strong> runs in <strong>{target.ballsLeft}</strong> balls
          <span className="block text-xs mt-0.5 opacity-80">Req. RR: {target.rrr}</span>
        </div>
      )}
    </div>
  );
}
