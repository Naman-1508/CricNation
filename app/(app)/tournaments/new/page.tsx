"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Copy, ExternalLink, Share2, Trophy } from "lucide-react";
import { trpc } from "@/app/_trpc/client";

const FORMAT_OPTIONS = ["T10", "T20", "ODI", "TEST"] as const;
const BRACKET_OPTIONS = [
  { key: "LEAGUE_KNOCKOUT", label: "League + Knockout" },
  { key: "ROUND_ROBIN", label: "Round Robin" },
];

export default function NewTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"T10" | "T20" | "ODI" | "TEST">("T20");
  const [bracketType, setBracketType] = useState("LEAGUE_KNOCKOUT");
  const [startDate, setStartDate] = useState("");
  const [maxTeams, setMaxTeams] = useState(16);
  const [entryFee, setEntryFee] = useState(0);
  const [autoApprove, setAutoApprove] = useState(false);
  const [created, setCreated] = useState<any>(null);

  const createTournament = trpc.tournament.create.useMutation({
    onSuccess: (data) => setCreated(data),
  });

  const shareUrl = created ? `${typeof window !== "undefined" ? window.location.origin : "https://cricnation.vercel.app"}/tournaments/join/${created.shareCode}` : "";

  const INPUT = "input-dark";

  if (created) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col">
        {/* Confetti / Glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 px-4 pt-14 pb-4 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => router.push(`/tournaments/${created.id}`)}
            className="w-10 h-10 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center btn-native shrink-0">
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h1 className="text-xl font-black text-white">Tournament Created!</h1>
        </div>

        <div className="relative z-10 flex-1 px-5 pt-8 flex flex-col items-center text-center pb-nav">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-7xl mb-6 drop-shadow-2xl"
          >
            🏆
          </motion.div>
          
          <h2 className="text-3xl font-black text-white mb-2">{created.name}</h2>
          <p className="text-white/40 text-sm mb-8 font-semibold uppercase tracking-widest">
            {created.format} · {created.maxTeams ?? 16} teams max
          </p>

          <div className="w-full glass-card rounded-3xl p-5 mb-6 text-left">
            <p className="text-xs text-white/50 mb-3 font-semibold uppercase tracking-widest">Share Link for Teams</p>
            <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-white/70 break-all font-mono mb-4 shadow-inner">
              {shareUrl}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigator.clipboard?.writeText(shareUrl)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-bold text-white btn-native transition-colors">
                <Copy className="w-4 h-4" /> Copy Link
              </motion.button>
              <a href={`https://wa.me/?text=${encodeURIComponent(`🏆 Join my tournament "${created.name}" on CricNation!\nRegister here: ${shareUrl}`)}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-sm font-bold text-emerald-400 btn-native transition-colors">
                <Share2 className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.96 }} onClick={() => router.push(`/tournaments/${created.id}`)}
            className="w-full bg-gradient-to-r from-[#E8390E] to-[#C42E09] text-white font-bold py-4 rounded-2xl shadow-[0_4px_16px_rgba(232,57,14,0.35)] flex items-center justify-center gap-2 btn-native">
            Go to Tournament Dashboard <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A]">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-4 pt-14 pb-5 border-b border-white/6 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0 btn-native">
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <h1 className="text-xl font-black text-white">Host Tournament</h1>
      </div>

      <div className="relative z-10 px-4 pt-5 pb-nav space-y-4">
        {/* Basic Info */}
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Tournament Details
          </h2>
          <div>
            <label className="text-xs text-white/40 block mb-2 font-semibold">Tournament Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Champions Cup 2026" className={INPUT} maxLength={80} />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-2 font-semibold">Match Format</label>
            <div className="grid grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map(f => (
                <motion.button key={f} whileTap={{ scale: 0.95 }} type="button" onClick={() => setFormat(f)}
                  className={`py-3 rounded-xl border text-xs font-black transition-all btn-native ${
                    format === f 
                      ? "bg-amber-500 text-white border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  }`}>
                  {f}
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-2 font-semibold">Tournament Bracket</label>
            <div className="grid grid-cols-2 gap-2">
              {BRACKET_OPTIONS.map(b => (
                <motion.button key={b.key} whileTap={{ scale: 0.97 }} type="button" onClick={() => setBracketType(b.key)}
                  className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all btn-native ${
                    bracketType === b.key 
                      ? "bg-white/15 border-white/30 text-white" 
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  }`}>
                  {b.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Dates & Registration */}
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-white/50 uppercase tracking-widest mb-2">Settings & Registration</h2>
          <div>
            <label className="text-xs text-white/40 block mb-2 font-semibold">Start Date *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={INPUT} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 block mb-2 font-semibold">Max Teams</label>
              <input type="number" value={maxTeams} onChange={e => setMaxTeams(parseInt(e.target.value) || 16)} className={INPUT} min={2} max={128} />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-2 font-semibold">Entry Fee (₹)</label>
              <input type="number" value={entryFee} onChange={e => setEntryFee(parseInt(e.target.value) || 0)} className={INPUT} min={0} />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Auto-approve Teams</p>
                <p className="text-[10px] text-white/35 mt-0.5">Let teams join without manual approval</p>
              </div>
              <button type="button" onClick={() => setAutoApprove(!autoApprove)}
                className={`w-12 h-7 rounded-full transition-colors relative border ${
                  autoApprove ? "bg-emerald-500 border-emerald-400" : "bg-white/10 border-white/15"
                }`}>
                <motion.div 
                  initial={false}
                  animate={{ x: autoApprove ? 22 : 4 }}
                  className="absolute top-1 bottom-1 w-5 h-5 rounded-full bg-white shadow-sm" 
                />
              </button>
            </label>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!name || !startDate || createTournament.isPending}
          onClick={() => createTournament.mutate({ name, format, bracketType: bracketType as any, startDate, maxTeams, entryFee, autoApprove })}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black py-4 rounded-2xl disabled:opacity-40 shadow-[0_4px_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 mt-4 btn-native"
        >
          {createTournament.isPending ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
          ) : (
            <>🏆 Launch Tournament</>
          )}
        </motion.button>
      </div>
    </div>
  );
}
