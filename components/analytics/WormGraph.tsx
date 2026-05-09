"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WormGraphProps {
  data: { over: number; team1: number; team2: number | null }[];
}

export default function WormGraph({ data }: WormGraphProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 w-full flex items-center justify-center text-muted-foreground border border-border rounded-xl">No data available</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="over" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
          />
          <Line type="monotone" dataKey="team1" stroke="#3b82f6" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="team2" stroke="#eab308" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
