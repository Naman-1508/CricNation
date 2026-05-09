"use client";

import { motion } from "framer-motion";

export default function WagonWheel() {
  const lines = [
    { angle: 30, length: 80, color: '#10b981', runs: 4 }, // Cover Drive
    { angle: 60, length: 60, color: '#f59e0b', runs: 2 },
    { angle: 90, length: 90, color: '#3b82f6', runs: 6 }, // Long Off
    { angle: 150, length: 85, color: '#10b981', runs: 4 }, // Square Leg
    { angle: 210, length: 40, color: '#94a3b8', runs: 1 }, // Fine Leg
    { angle: 330, length: 70, color: '#10b981', runs: 4 }, // Point
  ];

  return (
    <div className="relative w-64 h-64">
      <svg viewBox="0 0 200 200" className="w-full h-full rotate-[-90deg]">
        {/* Grass Background */}
        <circle cx="100" cy="100" r="95" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        
        {/* Inner Circle (30-yard) */}
        <circle cx="100" cy="100" r="40" fill="transparent" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Pitch */}
        <rect x="95" y="80" width="10" height="40" fill="#fef3c7" rx="1" />
        
        {/* Stumps */}
        <line x1="100" y1="85" x2="100" y2="85" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="115" x2="100" y2="115" stroke="black" strokeWidth="4" strokeLinecap="round" />

        {/* Shots */}
        {lines.map((line, i) => {
          const rad = (line.angle * Math.PI) / 180;
          const x2 = 100 + line.length * Math.cos(rad);
          const y2 = 100 + line.length * Math.sin(rad);

          return (
            <motion.line
              key={i}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.2 }}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke={line.color}
              strokeWidth={line.runs === 6 ? 3 : line.runs === 4 ? 2 : 1.5}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 text-[10px] font-bold">
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 6s</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 4s</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> 2s</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div> 1s</span>
      </div>
    </div>
  );
}
