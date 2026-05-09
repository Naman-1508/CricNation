"use client";

import { useState } from "react";
import { Trophy, Medal, Search } from "lucide-react";
import { trpc } from "@/app/_trpc/client";

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("batting");
  const { data: batters, isLoading } = trpc.tournament.getLeaderboard.useQuery();

  return (
    <div className="p-4 min-h-screen bg-background">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
          <Trophy className="w-6 h-6" /> Leaderboard
        </h1>
        <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border">
          <Search className="w-5 h-5" />
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
        {['batting', 'bowling', 'fielding', 'mvp'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium capitalize ${
              filter === f ? 'bg-primary text-white' : 'bg-surface border border-border text-muted-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex justify-between items-center p-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase">
          <span>Rank & Player</span>
          <span>{filter === 'batting' ? 'Runs' : 'Stat'}</span>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : batters?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No data available</div>
        ) : batters?.map((player: any, idx: number) => (
          <div key={player.rank} className="flex justify-between items-center p-4 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <span className={`font-bold w-6 text-center ${
                idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-muted-foreground'
              }`}>
                {idx < 3 ? <Medal className="w-5 h-5 mx-auto" /> : player.rank}
              </span>
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                 🧑🏽
              </div>
              <div>
                <h3 className="font-bold">{player.name}</h3>
                <p className="text-xs text-muted-foreground">{player.detail}</p>
              </div>
            </div>
            <div className="text-xl font-bold text-primary">
              {player.stat}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
