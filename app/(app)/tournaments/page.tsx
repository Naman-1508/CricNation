"use client";

import { Trophy, Search, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { trpc } from "@/app/_trpc/client";

export default function TournamentsPage() {
  const { data: tournaments, isLoading } = trpc.tournament.getAll.useQuery();

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Tournaments</h1>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <Link href="/tournaments/new" className="block">
        <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-xl p-4 text-white flex items-center justify-between shadow-lg">
          <div>
            <h2 className="font-bold text-lg mb-1">Host a Tournament</h2>
            <p className="text-sm text-emerald-100">100% Free • Auto-Fixtures • Points Table</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Plus className="w-6 h-6" />
          </div>
        </div>
      </Link>

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {['All', 'Live', 'Upcoming', 'My Tournaments', 'Completed'].map(tag => (
          <button key={tag} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${tag === 'All' ? 'bg-primary text-white' : 'bg-surface border border-border'}`}>
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : tournaments?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No tournaments found</div>
        ) : tournaments?.map((t: any) => (
          <Link href={`/tournaments/${t.id}`} key={t.id}>
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="bg-surface border border-border rounded-xl p-4 flex gap-4"
            >
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold line-clamp-1">{t.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                    t.status === 'LIVE' ? 'bg-destructive/10 text-destructive' : 
                    t.status === 'UPCOMING' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{t.location || 'Online'} • {t.teams || 0} Teams</p>
                
                {t.status === 'LIVE' && (
                  <div className="text-xs font-medium text-accent bg-accent/10 py-1 px-2 rounded inline-block">
                    Live Now
                  </div>
                )}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
