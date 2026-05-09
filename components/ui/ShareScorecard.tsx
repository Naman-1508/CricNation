"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { Share2, Download } from "lucide-react";

export default function ShareScorecard() {
  const scorecardRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (!scorecardRef.current) return;
    const canvas = await html2canvas(scorecardRef.current, { backgroundColor: '#0f172a' });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = 'cricnation-scorecard.png';
    link.click();
  };

  const shareWhatsApp = () => {
    const text = `🏆 MI vs CSK\nMI won by 4 wickets.\nMI: 184/4 (19.2)\nCSK: 183/8 (20.0)\n\nFollow live on CricNation!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div>
      {/* Hidden Scorecard for Capture */}
      <div className="absolute -left-[9999px]">
        <div ref={scorecardRef} className="w-[1080px] h-[1080px] bg-[#0f172a] text-white p-12 flex flex-col justify-between">
           <h1 className="text-6xl font-bold text-[#10b981]">CricNation</h1>
           <div className="text-center">
             <h2 className="text-8xl font-black mb-4">MI Won!</h2>
             <p className="text-4xl text-slate-400">by 4 wickets</p>
           </div>
           {/* Detailed stats would go here */}
           <p className="text-2xl text-center text-slate-500">cricnation.com</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={downloadImage} className="flex-1 bg-surface border border-border py-2 rounded-lg text-sm font-medium hover:bg-surface/80 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Save Post
        </button>
        <button onClick={shareWhatsApp} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" /> WhatsApp
        </button>
      </div>
    </div>
  );
}
