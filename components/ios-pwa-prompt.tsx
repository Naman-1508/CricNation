"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share } from "lucide-react";

export default function IosPwaPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIos = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());
    
    // Check if app is already installed/running in standalone mode
    // @ts-ignore
    const isStandalone = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;

    // Show prompt if iOS and not installed, and hasn't been dismissed recently
    if (isIos && !isStandalone) {
      const hasDismissed = localStorage.getItem("iosPwaPromptDismissed");
      if (!hasDismissed) {
        // Delay prompt slightly so it's not jarring on initial load
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem("iosPwaPromptDismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-safe left-0 right-0 z-50 p-4 pb-8"
        >
          <div className="bg-white rounded-2xl border border-[rgba(107,74,42,0.13)] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 bg-[#F2EFE9] text-[#8A8278] rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-[#1A1A1A] rounded-2xl flex items-center justify-center shrink-0">
                <img src="/icons/icon-192x192.png" alt="Icon" className="w-10 h-10 object-contain" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-[#1A1A1A] text-sm">Install CricNation</h3>
                <p className="text-xs text-[#8A8278] mt-1 leading-relaxed">
                  Install this app on your iPhone for quick access and full-screen scoring.
                </p>
              </div>
            </div>
            <div className="mt-3 bg-[#F2EFE9] rounded-xl p-3 flex items-center justify-center gap-2 text-sm text-[#4A4540]">
              Tap <Share className="w-4 h-4 text-[#007AFF]" strokeWidth={2.5} /> then <strong>Add to Home Screen</strong>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
