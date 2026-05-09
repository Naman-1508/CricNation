"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 30 seconds of usage
      setTimeout(() => setShowBanner(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 bg-surface border border-primary/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-2xl p-4 z-50 flex items-center gap-4"
      >
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <span className="text-2xl">🏏</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm">Add CricNation to Home Screen</h3>
          <p className="text-xs text-muted-foreground">Get the native app experience. Offline scoring available.</p>
        </div>
        <button 
          onClick={handleInstall}
          className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"
        >
          <Download className="w-4 h-4" /> Install
        </button>
        <button onClick={() => setShowBanner(false)} className="absolute -top-2 -right-2 bg-muted p-1 rounded-full text-muted-foreground hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
