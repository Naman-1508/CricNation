"use client";

import { ArrowLeft, Edit3, Share2, Award, Target, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import WagonWheel from "@/components/analytics/WagonWheel";
import { trpc } from "@/app/_trpc/client";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: stats, isLoading } = trpc.player.getStats.useQuery({ playerId: params.id });

  return (
    <div className="min-h-screen bg-background">
      <div className="h-32 bg-primary/20 relative">
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <button onClick={() => router.back()} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-6 -mt-12 relative z-10">
        <div className="flex justify-between items-end mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-surface overflow-hidden flex items-center justify-center">
               <span className="text-4xl">🧑🏽</span>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center">
              <Award className="w-3 h-3 text-white" />
            </div>
          </div>
          <button className="bg-surface border border-border px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        </div>

        <h1 className="text-2xl font-heading font-bold mb-1">Player Profile</h1>
        <p className="text-sm text-muted-foreground mb-4">Right-hand Bat • Right-arm Off Spin</p>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <span className="block text-2xl font-bold">{stats?.matches || 0}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Matches</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <span className="block text-2xl font-bold text-primary">{stats?.runs ? (stats.runs / stats.matches).toFixed(1) : '0.0'}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Bat Avg</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <span className="block text-2xl font-bold text-accent">{stats?.wickets || 0}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Wickets</span>
          </div>
        </div>

        {/* Deep Analytics (Premium Feature made Free) */}
        <h2 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" /> Wagon Wheel
        </h2>
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px]">
           <WagonWheel />
           <p className="text-xs text-muted-foreground mt-4 text-center">Strongest in Mid-Wicket region</p>
        </div>
      </div>
    </div>
  );
}
