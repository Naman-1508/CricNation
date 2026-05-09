"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Settings, Users, ArrowLeft, Shield, Zap, Clock } from "lucide-react";
import { trpc } from "@/app/_trpc/client";

const OVERS_OPTIONS = ["5", "10", "20", "50"];
const BALL_TYPES = ["Leather", "Tennis (Hard)", "Tennis (Soft)", "Tape Ball"];

export default function SetupMatchPage() {
  const router = useRouter();
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [overs, setOvers] = useState("20");
  const [ballType, setBallType] = useState("Leather");
  const [location, setLocation] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createMatch = trpc.match.create.useMutation({
    onSuccess: (data) => {
      router.push(`/score/${data.id}`);
    },
    onError: () => {
      setIsCreating(false);
    },
  });

  const startScoring = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamA && teamB) {
      setIsCreating(true);
      createMatch.mutate({
        teamA,
        teamB,
        overs: parseInt(overs),
        ballType,
        location,
      });
    }
  };

  const inputClass =
    "w-full bg-background/60 border border-white/8 rounded-2xl py-3.5 px-4 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all text-sm placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 pt-5 pb-4 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <p className="text-xs text-muted-foreground">Set up the</p>
          <h1 className="text-xl font-bold">New Match</h1>
        </div>
      </div>

      <form onSubmit={startScoring} className="px-4 pt-5 pb-28 space-y-4">
        {/* Teams Section */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-primary/15 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-sm">Teams</h2>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5 ml-1">Home Team</label>
            <input
              required
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              placeholder="e.g. Royal Challengers"
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-xs font-bold text-muted-foreground px-3 py-1.5 glass rounded-full">
              VS
            </span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5 ml-1">Away Team</label>
            <input
              required
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              placeholder="e.g. Mumbai Warriors"
              className={inputClass}
            />
          </div>
        </div>

        {/* Overs Selection */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-amber-500/15 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="font-semibold text-sm">Overs</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {OVERS_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOvers(o)}
                className={`py-3 rounded-2xl text-sm font-bold transition-all ${
                  overs === o
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Match Settings */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Settings className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="font-semibold text-sm">Settings</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 ml-1">Ball Type</label>
              <div className="grid grid-cols-2 gap-2">
                {BALL_TYPES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBallType(b)}
                    className={`py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      ballType === b
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 ml-1">
                Venue <span className="opacity-50">(optional)</span>
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chinnaswamy Stadium"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Match Summary Preview */}
        {teamA && teamB && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-primary" /> Match Preview
              </p>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="font-bold text-sm truncate">{teamA}</p>
                </div>
                <div className="px-3 py-1.5 glass rounded-xl mx-2">
                  <p className="text-xs font-bold text-muted-foreground">{overs} Ov</p>
                </div>
                <div className="text-center flex-1">
                  <p className="font-bold text-sm truncate">{teamB}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Start Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={!teamA || !teamB || isCreating}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all"
        >
          {isCreating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Match...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Let's Play!
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
