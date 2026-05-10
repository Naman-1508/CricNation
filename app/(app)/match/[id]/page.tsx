"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Activity, Users, ChevronLeft, Share2 } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { pusherClient } from "@/lib/pusherClient";
import Link from "next/link";

export default function PublicScorecard() {
  const params = useParams();
  const matchId = params.id as string;
  const { data: match, isLoading, refetch } = trpc.match.getById.useQuery({ id: matchId });

  useEffect(() => {
    const channelName = `match-${matchId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("score-update", () => {
      refetch();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [matchId, refetch]);

  if (isLoading || !match) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" />
      </div>
    );
  }

  const overs = Math.floor((match.score.balls || 0) / 6);
  const ballsInOver = (match.score.balls || 0) % 6;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      {/* ── Navbar ── */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.1)] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#4A4540]" />
        </Link>
        <h1 className="font-bold text-[#1A1A1A] text-lg">Match Center</h1>
        <button className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center">
          <Share2 className="w-5 h-5 text-[#4A4540]" />
        </button>
      </div>

      {/* ── Live Score Banner ── */}
      <div className="px-4 py-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1A1A1A] rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8390E]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex items-center justify-center gap-2 mb-6">
            {match.status === "LIVE" ? (
              <>
                <div className="w-2 h-2 bg-[#E8390E] rounded-full animate-pulse" />
                <span className="text-[#E8390E] text-xs font-bold uppercase tracking-widest">Live Now</span>
              </>
            ) : (
              <span className="text-white/50 text-xs font-bold uppercase tracking-widest">{match.status}</span>
            )}
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="text-center w-1/3">
              <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-2 flex items-center justify-center text-xl font-bold backdrop-blur-sm border border-white/10">
                {match.homeTeam.substring(0, 3).toUpperCase()}
              </div>
              <p className="text-sm font-semibold truncate px-2">{match.homeTeam}</p>
            </div>
            
            <div className="text-center w-1/3">
              <div className="text-5xl font-black tracking-tighter text-white drop-shadow-md">
                {match.score.runs}<span className="text-2xl text-white/50">/{match.score.wickets}</span>
              </div>
              <p className="text-white/60 text-sm mt-1 font-medium bg-white/5 inline-block px-3 py-1 rounded-full backdrop-blur-md">
                {overs}.{ballsInOver} Overs
              </p>
            </div>

            <div className="text-center w-1/3">
              <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-2 flex items-center justify-center text-xl font-bold backdrop-blur-sm border border-white/10">
                {match.awayTeam.substring(0, 3).toUpperCase()}
              </div>
              <p className="text-sm font-semibold truncate px-2">{match.awayTeam}</p>
            </div>
          </div>
          
          {match.currentOver && match.currentOver.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">This Over</span>
              <div className="flex items-center gap-1.5">
                {match.currentOver.map((b: string, i: number) => (
                  <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    b === 'W' ? 'bg-[#E8390E] text-white' : 
                    b === '4' ? 'bg-blue-500 text-white' : 
                    b === '6' ? 'bg-green-500 text-white' : 
                    (b === 'wd' || b === 'nb') ? 'bg-amber-500/20 text-amber-300' : 
                    'bg-white/10 text-white'
                  }`}>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Tabs Placeholder ── */}
      <div className="px-4">
        <div className="bg-white border border-[rgba(107,74,42,0.1)] rounded-2xl p-1.5 flex gap-1 mb-4 shadow-sm">
          {["Scorecard", "Commentary", "Info"].map((tab, i) => (
            <button key={tab} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              i === 0 ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#8A8278] hover:bg-[#F2EFE9]"
            }`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white border border-[rgba(107,74,42,0.1)] rounded-3xl p-6 text-center shadow-sm">
          <Activity className="w-12 h-12 text-[#E8390E]/20 mx-auto mb-3" />
          <h3 className="font-bold text-[#1A1A1A] mb-1">Detailed Scorecard</h3>
          <p className="text-sm text-[#8A8278] max-w-xs mx-auto leading-relaxed">
            Full batting and bowling tables will populate here as the match progresses.
          </p>
        </div>
      </div>
    </div>
  );
}
