"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share } from "lucide-react";

const DISMISS_KEY = "cricnation_pwa_dismissed_until";

export default function IosPwaPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only iOS Safari (not Chrome on iOS which can't install PWAs the same way)
    const ua = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua) && !ua.includes("crios") && !ua.includes("fxios");

    // Already running as installed PWA
    const isStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (!isIos || isStandalone) return;

    // Respect user dismissal (7-day cooldown)
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;

    const timer = setTimeout(() => setShowPrompt(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed left-3 right-3 z-[9999]"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 16px) + 80px)" }}
        >
          <div className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.18)] relative">
            <button
              onClick={dismiss}
              className="absolute top-2.5 right-2.5 w-7 h-7 bg-[#F2EFE9] text-[#8A8278] rounded-full flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-3 items-center mb-3">
              <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/icons/icon-192x192.png" alt="CricNation" className="w-10 h-10 object-contain" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-[#1A1A1A] text-sm">Install CricNation</h3>
                <p className="text-xs text-[#8A8278] mt-0.5 leading-snug">
                  Get the full app experience — score matches offline!
                </p>
              </div>
            </div>

            <div className="bg-[#F2EFE9] rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm text-[#4A4540] font-medium">
              Tap&nbsp;
              <span className="inline-flex items-center gap-0.5">
                <Share className="w-4 h-4 text-[#007AFF]" strokeWidth={2.5} />
              </span>
              &nbsp;then&nbsp;<strong className="text-[#1A1A1A]">Add to Home Screen</strong>
            </div>

            {/* Arrow pointing down toward share button */}
            <div className="flex justify-center mt-2">
              <div className="w-4 h-4 border-b-2 border-r-2 border-[#8A8278] rotate-45 -mb-1" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
