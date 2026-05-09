"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface WicketSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WicketSheet({ isOpen, onClose }: WicketSheetProps) {
  const dismissalTypes = [
    "Bowled", "Caught", "LBW", "Run Out", "Stumped", "Hit Wicket", "Retired Hurt"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full bg-surface border-t border-border rounded-t-3xl p-4 pb-safe z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-destructive">Wicket! ☝️</h3>
              <button onClick={onClose} className="p-2 bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {dismissalTypes.map(type => (
                <button 
                  key={type}
                  onClick={onClose}
                  className="bg-background border border-border p-3 rounded-xl font-medium hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
