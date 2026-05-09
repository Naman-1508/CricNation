"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Settings, Users, ArrowLeft } from "lucide-react";

export default function SetupMatchPage() {
  const router = useRouter();
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [overs, setOvers] = useState("20");

  const startScoring = (e: React.FormEvent) => {
    e.preventDefault();
    if(teamA && teamB) {
      // In real app: Create match in DB, get ID, then redirect
      router.push(`/score/new-match-id-123`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-heading font-bold">Start New Match</h1>
      </header>

      <form onSubmit={startScoring} className="space-y-6">
        {/* Teams Section */}
        <section className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Users className="w-5 h-5" />
            <h2 className="font-semibold text-foreground">Teams</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Home Team</label>
              <input 
                required
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                placeholder="e.g. Mumbai Indians"
                className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-4">
              <hr className="flex-1 border-border" />
              <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded-full border border-border">VS</span>
              <hr className="flex-1 border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Away Team</label>
              <input 
                required
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                placeholder="e.g. Chennai Super Kings"
                className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* Match Settings */}
        <section className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Settings className="w-5 h-5" />
            <h2 className="font-semibold text-foreground">Match Settings</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Overs</label>
              <select 
                value={overs}
                onChange={(e) => setOvers(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:border-primary appearance-none"
              >
                <option value="5">5 Overs</option>
                <option value="10">10 Overs</option>
                <option value="20">20 Overs</option>
                <option value="50">50 Overs</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ball Type</label>
              <select className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:border-primary appearance-none">
                <option>Leather</option>
                <option>Tennis (Hard)</option>
                <option>Tennis (Soft)</option>
                <option>Tape Ball</option>
              </select>
            </div>
          </div>
        </section>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!teamA || !teamB}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5 fill-current" /> Let's Play
        </motion.button>
      </form>
    </div>
  );
}
