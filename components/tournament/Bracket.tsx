"use client";

export default function Bracket() {
  return (
    <div className="min-w-[600px] flex gap-10 py-4">
      {/* Quarter Finals */}
      <div className="flex flex-col justify-around gap-8">
        <MatchBox team1="MI" team2="RCB" winner="MI" />
        <MatchBox team1="CSK" team2="DC" winner="CSK" />
        <MatchBox team1="RR" team2="PBKS" winner="RR" />
        <MatchBox team1="KKR" team2="SRH" winner="SRH" />
      </div>
      
      {/* Semi Finals */}
      <div className="flex flex-col justify-around gap-8 relative">
         <MatchBox team1="MI" team2="CSK" winner="MI" />
         <MatchBox team1="RR" team2="SRH" winner="RR" />
      </div>

      {/* Final */}
      <div className="flex flex-col justify-around gap-8 relative">
         <div className="bg-primary/20 border border-primary p-3 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
           <h3 className="text-xs font-bold text-primary mb-2 text-center uppercase tracking-widest">Final</h3>
           <div className="flex flex-col gap-1 w-32">
             <div className="flex justify-between text-sm font-bold bg-background p-1.5 rounded">
               <span>MI</span> <span>184/4</span>
             </div>
             <div className="flex justify-between text-sm font-bold bg-background p-1.5 rounded text-muted-foreground">
               <span>RR</span> <span>Yet to bat</span>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}

function MatchBox({ team1, team2, winner }: { team1: string, team2: string, winner: string }) {
  return (
    <div className="bg-surface border border-border p-2 rounded-lg w-32 relative">
      <div className="flex flex-col gap-1">
        <div className={`flex justify-between text-sm p-1 rounded ${winner === team1 ? 'font-bold' : 'text-muted-foreground'}`}>
          <span>{team1}</span>
        </div>
        <div className={`flex justify-between text-sm p-1 rounded ${winner === team2 ? 'font-bold' : 'text-muted-foreground'}`}>
          <span>{team2}</span>
        </div>
      </div>
    </div>
  );
}
