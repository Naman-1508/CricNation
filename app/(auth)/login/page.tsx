"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Zap, Shield, ChevronRight } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* ── Stadium Floodlights ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-0 left-1/4 w-32 h-[150vh] bg-gradient-to-b from-white/20 via-white/5 to-transparent floodlight-l blur-3xl mix-blend-overlay" />
        <div className="absolute top-0 right-1/4 w-32 h-[150vh] bg-gradient-to-b from-white/20 via-white/5 to-transparent floodlight-r blur-3xl mix-blend-overlay" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#E8390E]/20 to-transparent blur-3xl" />
      </div>

      {/* ── Animated Pitch Lines ── */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-64 h-[200vh] border-x-2 border-white/30 transform perspective-[1000px] rotateX(60deg) origin-bottom">
          <div className="w-full h-[5px] bg-white/50 pitch-scanner" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        
        {/* Logo / Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-10 text-center relative"
        >
          <motion.div 
            className="w-24 h-24 mx-auto bg-gradient-to-br from-[#E8390E] to-[#C42E09] rounded-[2rem] flex items-center justify-center shadow-[0_0_80px_rgba(232,57,14,0.4)] mb-6 border border-white/20 relative"
            whileHover={{ scale: 1.05, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {/* Spinning seam overlay */}
            <div className="absolute inset-2 border-[3px] border-dashed border-white/30 rounded-full seam-spin" />
            <span className="text-5xl relative z-10">🏏</span>
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">CricNation</h1>
          <p className="text-[#E8390E] font-bold tracking-[0.2em] text-xs mt-2 uppercase">Live Broadcast Platform</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
          className="w-full bg-[#111]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E8390E] to-transparent opacity-50" />
          
          <h2 className="font-black text-2xl text-white mb-2">Take the Field</h2>
          <p className="text-sm text-white/40 mb-8 font-medium">
            Join the ultimate cricket network.
          </p>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#E8390E]/10 border border-[#E8390E]/30 text-[#E8390E] text-xs font-bold rounded-xl px-4 py-3 mb-6">
              Authentication failed. The umpire signaled a wide!
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] relative overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="relative z-10 tracking-tight text-[15px]">Sign in with Google</span>
          </motion.button>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Live Sync</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Verified</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <LoginContent />
    </Suspense>
  );
}
