"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Share2, Activity } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { pusherClient } from "@/lib/pusherClient";
import Link from "next/link";

// ── Ball dot (reused) ─────────────────────────────────────────
function BallDot({ val }: { val: string }) {
  const base = "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold";
  if (val === "W") return <div className={`${base} bg-[#E8390E] text-white`}>W</div>;
  if (val === "4") return <div className={`${base} bg-blue-500 text-white`}>4</div>;
  if (val === "6") return <div className={`${base} bg-green-500 text-white`}>6</div>;
  if (val === "Wd" || val === "wd" || val === "Nb" || val === "nb")
    return <div className={`${base} bg-amber-100 text-amber-700 border border-amber-300`}>{val}</div>;
  if (val === "0" || val === ".")
    return <div className={`${base} bg-[#F2EFE9] text-[#8A8278] border border-[rgba(107,74,42,0.15)]`}>·</div>;
  return <div className={`${base} bg-[#1A1A1A] text-white`}>{val}</div>;
}

// ── Batting table ─────────────────────────────────────────────
function BattingTable({ rows }: { rows: any[] }) {
  if (rows.length === 0) return (
    <div className="py-10 text-center text-[#8A8278] text-sm">No batting data yet</div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#F2EFE9] text-[#8A8278] font-bold uppercase tracking-wide">
            <th className="text-left py-2.5 px-3">Batter</th>
            <th className="py-2.5 px-2 text-center">R</th>
            <th className="py-2.5 px-2 text-center">B</th>
            <th className="py-2.5 px-2 text-center">4s</th>
            <th className="py-2.5 px-2 text-center">6s</th>
            <th className="py-2.5 px-2 text-center">SR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any, i: number) => (
            <tr key={r.id} className={`border-t border-[rgba(107,74,42,0.08)] ${i % 2 === 0 ? "" : "bg-[#FAFAF8]"}`}>
              <td className="py-2.5 px-3">
                <p className="font-semibold text-[#1A1A1A]">{r.name}</p>
                <p className="text-[10px] text-[#8A8278]">
                  {r.isOut
                    ? (r.dismissalType?.replace(/_/g, " ").toLowerCase() ?? "out")
                    : <span className="text-green-600 font-semibold">not out</span>
                  }
                </p>
              </td>
              <td className="py-2.5 px-2 text-center font-bold text-[#1A1A1A]">{r.runs}</td>
              <td className="py-2.5 px-2 text-center text-[#8A8278]">{r.ballsFaced}</td>
              <td className="py-2.5 px-2 text-center text-blue-600 font-semibold">{r.fours}</td>
              <td className="py-2.5 px-2 text-center text-green-600 font-semibold">{r.sixes}</td>
              <td className="py-2.5 px-2 text-center text-[#4A4540]">{r.sr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Bowling table ─────────────────────────────────────────────
function BowlingTable({ rows }: { rows: any[] }) {
  if (rows.length === 0) return (
    <div className="py-10 text-center text-[#8A8278] text-sm">No bowling data yet</div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#F2EFE9] text-[#8A8278] font-bold uppercase tracking-wide">
            <th className="text-left py-2.5 px-3">Bowler</th>
            <th className="py-2.5 px-2 text-center">O</th>
            <th className="py-2.5 px-2 text-center">R</th>
            <th className="py-2.5 px-2 text-center">W</th>
            <th className="py-2.5 px-2 text-center">Eco</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any, i: number) => (
            <tr key={r.id} className={`border-t border-[rgba(107,74,42,0.08)] ${i % 2 === 0 ? "" : "bg-[#FAFAF8]"}`}>
              <td className="py-2.5 px-3 font-semibold text-[#1A1A1A]">{r.name}</td>
              <td className="py-2.5 px-2 text-center text-[#8A8278]">{r.overs}</td>
              <td className="py-2.5 px-2 text-center text-[#1A1A1A] font-semibold">{r.runs}</td>
              <td className="py-2.5 px-2 text-center font-bold text-[#E8390E]">{r.wickets}</td>
              <td className="py-2.5 px-2 text-center text-[#4A4540]">{r.economy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Over timeline ─────────────────────────────────────────────
function OverTimeline({ overSummary }: { overSummary: any[] }) {
  if (overSummary.length === 0) return (
    <div className="py-10 text-center text-[#8A8278] text-sm">No overs bowled yet</div>
  );
  return (
    <div className="space-y-3">
      {[...overSummary].reverse().map((ov: any) => (
        <div key={ov.over} className="bg-[#F2EFE9] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4A4540]">Over {ov.over}</span>
            <span className="text-xs font-semibold text-[#1A1A1A]">
              {ov.runs} runs {ov.wkts > 0 && <span className="text-[#E8390E]">· {ov.wkts}W</span>}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ov.display.map((b: string, i: number) => <BallDot key={i} val={b} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function PublicScorecard() {
  const params = useParams();
  const matchId = params.id as string;
  const [tab, setTab] = useState(0); // 0=Scorecard, 1=Commentary, 2=Info
  const [inningsIdx, setInningsIdx] = useState(0); // which innings to show

  const { data: match, isLoading: matchLoading, refetch: refetchMatch } = trpc.match.getById.useQuery({ id: matchId });
  const { data: scorecard, isLoading: scLoading, refetch: refetchSc } = trpc.match.getScorecard.useQuery({ id: matchId });

  useEffect(() => {
    const channel = pusherClient.subscribe(`match-${matchId}`);
    channel.bind("score-update", () => {
      refetchMatch();
      refetchSc();
    });
    return () => { pusherClient.unsubscribe(`match-${matchId}`); };
  }, [matchId, refetchMatch, refetchSc]);

  if (matchLoading || !match) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" />
      </div>
    );
  }

  const overs = Math.floor((match.score.balls || 0) / 6);
  const ballsInOver = (match.score.balls || 0) % 6;
  const innings = scorecard ?? [];
  const currentInnings = innings[inningsIdx];

  const TABS = ["Scorecard", "Commentary", "Info"];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      {/* Navbar */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.1)] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#4A4540]" />
        </Link>
        <h1 className="font-bold text-[#1A1A1A] text-base">Match Centre</h1>
        <button
          onClick={() => navigator.share?.({ title: `${match.homeTeam} vs ${match.awayTeam}`, url: window.location.href }).catch(() => {})}
          className="w-10 h-10 bg-[#F2EFE9] rounded-xl flex items-center justify-center">
          <Share2 className="w-5 h-5 text-[#4A4540]" />
        </button>
      </div>

      {/* Live Score Banner */}
      <div className="px-4 py-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1A1A] rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8390E]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex items-center justify-center gap-2 mb-4">
            {match.status === "LIVE" ? (
              <><div className="w-2 h-2 bg-[#E8390E] rounded-full animate-pulse" />
                <span className="text-[#E8390E] text-xs font-bold uppercase tracking-widest">Live Now</span></>
            ) : (
              <span className="text-white/50 text-xs font-bold uppercase tracking-widest">{match.status}</span>
            )}
          </div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="text-center w-1/3">
              <div className="w-14 h-14 bg-white/10 rounded-2xl mx-auto mb-2 flex items-center justify-center text-sm font-bold backdrop-blur-sm border border-white/10">
                {match.homeTeam.substring(0, 3).toUpperCase()}
              </div>
              <p className="text-xs font-semibold truncate px-1">{match.homeTeam}</p>
            </div>

            <div className="text-center w-1/3">
              <div className="text-4xl font-black tracking-tighter text-white drop-shadow-md">
                {match.score.runs}<span className="text-xl text-white/50">/{match.score.wickets}</span>
              </div>
              <p className="text-white/60 text-xs mt-1 font-medium bg-white/5 inline-block px-3 py-1 rounded-full">
                {overs}.{ballsInOver} {match.overs ? `/ ${match.overs}` : ""} Ov
              </p>
            </div>

            <div className="text-center w-1/3">
              <div className="w-14 h-14 bg-white/10 rounded-2xl mx-auto mb-2 flex items-center justify-center text-sm font-bold backdrop-blur-sm border border-white/10">
                {match.awayTeam.substring(0, 3).toUpperCase()}
              </div>
              <p className="text-xs font-semibold truncate px-1">{match.awayTeam}</p>
            </div>
          </div>

          {match.currentOver && match.currentOver.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">This Over</span>
              <div className="flex items-center gap-1">
                {match.currentOver.map((b: string, i: number) => <BallDot key={i} val={b} />)}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-white border border-[rgba(107,74,42,0.1)] rounded-2xl p-1.5 flex gap-1 shadow-sm">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === i ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#8A8278] hover:bg-[#F2EFE9]"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">

        {/* ── Scorecard Tab ─────────────────────── */}
        {tab === 0 && (
          <div className="space-y-4">
            {/* Innings selector if multiple */}
            {innings.length > 1 && (
              <div className="flex gap-2">
                {innings.map((inn: any, i: number) => (
                  <button key={i} onClick={() => setInningsIdx(i)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      inningsIdx === i ? "bg-[#E8390E] text-white border-[#E8390E]" : "bg-white border-[rgba(107,74,42,0.15)] text-[#4A4540]"
                    }`}>
                    {inn.battingTeam?.shortName ?? `Inn ${i + 1}`} batting
                  </button>
                ))}
              </div>
            )}

            {scLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" />
              </div>
            ) : !currentInnings ? (
              <div className="bg-white border border-[rgba(107,74,42,0.1)] rounded-3xl p-8 text-center shadow-sm">
                <Activity className="w-10 h-10 text-[#E8390E]/20 mx-auto mb-3" />
                <h3 className="font-bold text-[#1A1A1A] mb-1">No scorecard yet</h3>
                <p className="text-sm text-[#8A8278]">Start scoring to see the live scorecard here.</p>
              </div>
            ) : (
              <>
                {/* Batting card */}
                <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-[rgba(107,74,42,0.08)] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#1A1A1A]">🏏 Batting — {currentInnings.battingTeam?.name}</p>
                    </div>
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      {currentInnings.totalRuns}/{currentInnings.totalWickets}
                    </span>
                  </div>
                  <BattingTable rows={currentInnings.batting} />
                </div>

                {/* Bowling card */}
                <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-[rgba(107,74,42,0.08)]">
                    <p className="font-bold text-sm text-[#1A1A1A]">⚾ Bowling — {currentInnings.bowlingTeam?.name}</p>
                  </div>
                  <BowlingTable rows={currentInnings.bowling} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Commentary Tab ─────────────────────── */}
        {tab === 1 && (
          <div className="space-y-3">
            {scLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#E8390E]/30 border-t-[#E8390E] rounded-full animate-spin" />
              </div>
            ) : !currentInnings || currentInnings.overSummary.length === 0 ? (
              <div className="bg-white border border-[rgba(107,74,42,0.1)] rounded-3xl p-8 text-center shadow-sm">
                <Activity className="w-10 h-10 text-[#E8390E]/20 mx-auto mb-3" />
                <h3 className="font-bold text-[#1A1A1A] mb-1">No commentary yet</h3>
                <p className="text-sm text-[#8A8278]">Ball-by-ball updates will appear here.</p>
              </div>
            ) : (
              <OverTimeline overSummary={currentInnings.overSummary} />
            )}
          </div>
        )}

        {/* ── Info Tab ─────────────────────────────── */}
        {tab === 2 && (
          <div className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-[#1A1A1A]">Match Info</h3>
            {[
              { label: "Format", value: match.overs ? `${match.overs} overs` : "Unlimited" },
              { label: "Ball Type", value: (match as any).ballType ?? "—" },
              { label: "Venue", value: (match as any).groundName ?? "Not specified" },
              { label: "Status", value: match.status },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-[rgba(107,74,42,0.08)] last:border-0">
                <span className="text-sm text-[#8A8278]">{row.label}</span>
                <span className="text-sm font-semibold text-[#1A1A1A]">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
