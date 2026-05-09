"use client";

import { ArrowLeft, Users, Trophy, ListOrdered, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Bracket from "@/components/tournament/Bracket";
import Link from "next/link";

export default function TournamentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Cover */}
      <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <button onClick={() => router.back()} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-4 pb-4 -mt-10 relative z-10">
        <div className="bg-surface rounded-xl p-4 border border-border shadow-lg">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-muted rounded-xl border-4 border-surface -mt-10 flex items-center justify-center">
               <Trophy className="w-10 h-10 text-primary" />
            </div>
            <div className="pt-1">
              <h1 className="font-heading font-bold text-xl leading-tight mb-1">Summer T20 Bash</h1>
              <p className="text-xs text-muted-foreground">Organized by CricNation Admin</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <span className="block text-lg font-bold">16</span>
              <span className="text-[10px] text-muted-foreground uppercase">Teams</span>
            </div>
            <div className="text-center border-l border-r border-border">
              <span className="block text-lg font-bold">31</span>
              <span className="text-[10px] text-muted-foreground uppercase">Matches</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-primary">T20</span>
              <span className="text-[10px] text-muted-foreground uppercase">Format</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-2">
        {['Matches', 'Points Table', 'Bracket', 'Stats'].map((tab, i) => (
          <button key={tab} className={`flex-1 py-3 text-sm font-medium ${i === 2 ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        <div className="bg-surface rounded-xl border border-border p-4 overflow-x-auto">
           <Bracket />
        </div>
      </div>
    </div>
  );
}
