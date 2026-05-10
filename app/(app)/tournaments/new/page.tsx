"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Copy, ExternalLink, Share2 } from "lucide-react";
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

  const inputClass = "w-full bg-[#F2EFE9] border border-[rgba(107,74,42,0.13)] rounded-xl py-3 px-4 text-sm text-[#1A1A1A] placeholder:text-[#8A8278] focus:outline-none focus:border-[#E8390E] transition-colors";

  if (created) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
        <div className="bg-white border-b border-[rgba(107,74,42,0.1)] px-4 pt-12 pb-4 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push(`/tournaments/${created.id}`)}
            className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#4A4540]" />
          </motion.button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Tournament Created!</h1>
        </div>
        <div className="flex-1 px-4 pt-8 flex flex-col items-center text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{created.name}</h2>
          <p className="text-[#8A8278] text-sm mb-8">{created.format} · {created.maxTeams ?? 16} teams max</p>

          <div className="w-full bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 mb-4">
            <p className="text-xs text-[#8A8278] mb-2">Share this link with teams to register:</p>
            <div className="bg-[#F2EFE9] rounded-xl p-3 text-xs text-[#4A4540] break-all font-mono mb-3">{shareUrl}</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigator.clipboard?.writeText(shareUrl)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F2EFE9] text-sm font-medium text-[#4A4540]">
                <Copy className="w-4 h-4" /> Copy Link
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(`🏏 Join my tournament "${created.name}"!\nRegister here: ${shareUrl}`)}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-sm font-semibold text-white">
                <Share2 className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>

          <button onClick={() => router.push(`/tournaments/${created.id}`)}
            className="w-full bg-[#E8390E] text-white font-semibold py-4 rounded-xl shadow-[0_4px_16px_rgba(232,57,14,0.35)] flex items-center justify-center gap-2">
            Go to Tournament <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      <div className="bg-white border-b border-[rgba(107,74,42,0.1)] px-4 pt-12 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
          className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[#4A4540]" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Host Tournament</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Basic Info */}
        <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#4A4540]">Tournament Details</h2>
          <div>
            <label className="text-xs text-[#8A8278] block mb-1.5">Tournament Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Colony Cup 2025" className={inputClass} maxLength={80} />
          </div>
          <div>
            <label className="text-xs text-[#8A8278] block mb-1.5">Format</label>
            <div className="grid grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map(f => (
                <button key={f} type="button" onClick={() => setFormat(f)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${format === f ? "bg-[#E8390E] text-white border-[#E8390E]" : "bg-white border-[rgba(107,74,42,0.2)] text-[#4A4540]"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#8A8278] block mb-1.5">Bracket Type</label>
            <div className="grid grid-cols-2 gap-2">
              {BRACKET_OPTIONS.map(b => (
                <button key={b.key} type="button" onClick={() => setBracketType(b.key)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-colors ${bracketType === b.key ? "bg-[#E8390E]/10 text-[#E8390E] border-[#E8390E]/40" : "bg-white border-[rgba(107,74,42,0.2)] text-[#4A4540]"}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dates & Registration */}
        <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#4A4540]">Registration Settings</h2>
          <div>
            <label className="text-xs text-[#8A8278] block mb-1.5">Start Date *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8A8278] block mb-1.5">Max Teams</label>
              <input type="number" value={maxTeams} onChange={e => setMaxTeams(parseInt(e.target.value) || 16)} className={inputClass} min={2} max={64} />
            </div>
            <div>
              <label className="text-xs text-[#8A8278] block mb-1.5">Entry Fee (₹)</label>
              <input type="number" value={entryFee} onChange={e => setEntryFee(parseInt(e.target.value) || 0)} className={inputClass} min={0} />
            </div>
          </div>
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">Auto-approve teams</p>
                <p className="text-xs text-[#8A8278]">Teams are approved instantly on registration</p>
              </div>
              <button type="button" onClick={() => setAutoApprove(!autoApprove)}
                className={`w-12 h-6 rounded-full transition-colors relative ${autoApprove ? "bg-[#E8390E]" : "bg-[rgba(107,74,42,0.2)]"}`}>
                <span className={`absolute top-0.5 bottom-0.5 w-5 rounded-full bg-white shadow transition-transform ${autoApprove ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </label>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!name || !startDate || createTournament.isPending}
          onClick={() => createTournament.mutate({ name, format, bracketType: bracketType as any, startDate, maxTeams, entryFee, autoApprove })}
          className="w-full bg-[#E8390E] text-white font-semibold py-4 rounded-xl disabled:opacity-40 shadow-[0_4px_16px_rgba(232,57,14,0.35)] flex items-center justify-center gap-2"
        >
          {createTournament.isPending ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
          ) : "🏆 Create Tournament"}
        </motion.button>
      </div>
    </div>
  );
}
