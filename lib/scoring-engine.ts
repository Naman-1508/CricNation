export type Ball = {
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isBye: boolean;
  isLegBye: boolean;
  isWicket: boolean;
};

export function calculateRunRate(runs: number, ballsBowled: number): number {
  if (ballsBowled === 0) return 0;
  const overs = Math.floor(ballsBowled / 6) + (ballsBowled % 6) / 10;
  // Convert custom overs to mathematical decimal for calculation
  const oversDecimal = Math.floor(ballsBowled / 6) + (ballsBowled % 6) / 6;
  return Number((runs / oversDecimal).toFixed(2));
}

export function calculateRequiredRunRate(target: number, currentRuns: number, ballsRemaining: number): number {
  if (ballsRemaining === 0) return 0;
  const runsNeeded = target - currentRuns;
  if (runsNeeded <= 0) return 0;
  const oversRemainingDecimal = ballsRemaining / 6;
  return Number((runsNeeded / oversRemainingDecimal).toFixed(2));
}

export function calculateNRR(runsFor: number, oversFor: number, runsAgainst: number, oversAgainst: number): number {
  // overs are passed as floats e.g. 19.2
  const toDecOvers = (ov: number) => Math.floor(ov) + ((ov * 10) % 10) / 6;
  
  const of = toDecOvers(oversFor);
  const oa = toDecOvers(oversAgainst);
  
  const rrFor = of > 0 ? runsFor / of : 0;
  const rrAgainst = oa > 0 ? runsAgainst / oa : 0;
  
  return Number((rrFor - rrAgainst).toFixed(3));
}

export function calculateBattingAverage(runs: number, dismissals: number): number {
  if (dismissals === 0) return runs; // or Infinity if you prefer, but usually displayed as runs
  return Number((runs / dismissals).toFixed(2));
}

export function calculateStrikeRate(runs: number, balls: number): number {
  if (balls === 0) return 0;
  return Number(((runs / balls) * 100).toFixed(2));
}

export function calculateEconomy(runs: number, overs: number): number {
  if (overs === 0) return 0;
  const oversDecimal = Math.floor(overs) + ((overs * 10) % 10) / 6;
  return Number((runs / oversDecimal).toFixed(2));
}

export function calculateBowlingAverage(runs: number, wickets: number): number {
  if (wickets === 0) return 0;
  return Number((runs / wickets).toFixed(2));
}

export function getLegalBallsCount(balls: Ball[]): number {
  return balls.filter(b => !b.isWide && !b.isNoBall).length;
}

export function getCurrentOver(balls: Ball[]): string {
  // Returns something like "1 . W 4 . 6"
  return balls.map(b => {
    if (b.isWicket) return 'W';
    if (b.isWide) return `${b.runs > 0 ? b.runs : ''}Wd`;
    if (b.isNoBall) return `${b.runs > 0 ? b.runs : ''}Nb`;
    if (b.runs === 0) return '.';
    return b.runs.toString();
  }).join(' ');
}

export function getWinProbability(target: number, currentRuns: number, ballsRemaining: number, wicketsLost: number): number {
  // A very basic heuristic for demonstration
  if (ballsRemaining === 0) return currentRuns >= target ? 100 : 0;
  if (currentRuns >= target) return 100;
  if (wicketsLost >= 10) return 0;

  const rrr = calculateRequiredRunRate(target, currentRuns, ballsRemaining);
  const wicketsLeft = 10 - wicketsLost;
  
  // Base probability
  let prob = 50;
  
  // Adjust based on RRR
  if (rrr > 12) prob -= 30;
  else if (rrr > 10) prob -= 15;
  else if (rrr < 6) prob += 20;
  
  // Adjust based on Wickets
  if (wicketsLeft < 3) prob -= 30;
  else if (wicketsLeft > 7) prob += 20;

  return Math.max(1, Math.min(99, prob)); // Clamp between 1 and 99
}
