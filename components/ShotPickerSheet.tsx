"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, SkipForward } from "lucide-react";

// ── Shot Types ─────────────────────────────────────────────────────────────
const SHOT_TYPES = [
  { id: "COVER_DRIVE",    label: "Cover Drive",    color: "#3b82f6" },
  { id: "STRAIGHT_DRIVE", label: "Straight",       color: "#8b5cf6" },
  { id: "ON_DRIVE",       label: "On Drive",       color: "#10b981" },
  { id: "OFF_DRIVE",      label: "Off Drive",      color: "#06b6d4" },
  { id: "PULL",           label: "Pull",           color: "#f59e0b" },
  { id: "HOOK",           label: "Hook",           color: "#ef4444" },
  { id: "CUT",            label: "Cut",            color: "#E8390E" },
  { id: "FLICK",          label: "Flick",          color: "#ec4899" },
  { id: "SWEEP",          label: "Sweep",          color: "#14b8a6" },
  { id: "REVERSE_SWEEP",  label: "Rev. Sweep",     color: "#a855f7" },
  { id: "GLANCE",         label: "Glance",         color: "#6366f1" },
  { id: "LOFT",           label: "Loft",           color: "#f97316" },
  { id: "DEFENSIVE",      label: "Defensive",      color: "#64748b" },
];

// ── Field zone labels (for display around the wagon wheel) ─────────────────
const FIELD_ZONES = [
  { angle: 270, label: "Straight" },
  { angle: 315, label: "Mid Off" },
  { angle: 0,   label: "Cover" },
  { angle: 45,  label: "Point" },
  { angle: 90,  label: "3rd Man" },
  { angle: 135, label: "Fine Leg" },
  { angle: 180, label: "Sq Leg" },
  { angle: 225, label: "Mid On" },
];

// ── Run colour ─────────────────────────────────────────────────────────────
function runColor(runs: number) {
  if (runs === 6) return "#10b981";
  if (runs === 4) return "#3b82f6";
  if (runs >= 2)  return "#f59e0b";
  return "#ffffff";
}

// ── Interactive Wagon Wheel ────────────────────────────────────────────────
function InteractiveWagonWheel({
  angle, onSelect,
}: { angle: number | null; onSelect: (a: number) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const CX = 100, CY = 100, R = 88;

  const handleClick = (e: React.MouseEvent<SVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Convert to SVG coordinate space
    const svgX = (x / rect.width) * 200 - CX;
    const svgY = (y / rect.height) * 200 - CY;
    // Angle in degrees, 0 = right, going clockwise
    let deg = (Math.atan2(svgY, svgX) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    onSelect(deg);
  };

  // Placement dot position from angle
  const dotX = angle !== null ? CX + R * 0.72 * Math.cos((angle * Math.PI) / 180) : null;
  const dotY = angle !== null ? CY + R * 0.72 * Math.sin((angle * Math.PI) / 180) : null;

  return (
    <div className="relative w-52 h-52 mx-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full h-full cursor-crosshair select-none"
        onClick={handleClick}
      >
        {/* Outer field */}
        <circle cx={CX} cy={CY} r={R} fill="#0d1f0e" stroke="#1f3620" strokeWidth="2" />
        {/* 30-yard circle */}
        <circle cx={CX} cy={CY} r={40} fill="none" stroke="#1f3620" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Pitch */}
        <rect x="94" y="78" width="12" height="44" fill="#c8a96e" rx="2" opacity="0.8" />
        {/* Field zone lines */}
        {FIELD_ZONES.map(z => {
          const rad = (z.angle * Math.PI) / 180;
          return (
            <line
              key={z.angle}
              x1={CX} y1={CY}
              x2={CX + R * Math.cos(rad)}
              y2={CY + R * Math.sin(rad)}
              stroke="#1f3620" strokeWidth="1" strokeDasharray="3 4"
            />
          );
        })}
        {/* Field zone labels */}
        {FIELD_ZONES.map(z => {
          const rad = (z.angle * Math.PI) / 180;
          const tx = CX + (R - 6) * 0.75 * Math.cos(rad);
          const ty = CY + (R - 6) * 0.75 * Math.sin(rad);
          return (
            <text
              key={z.angle}
              x={tx} y={ty}
              textAnchor="middle" dominantBaseline="central"
              fontSize="7" fill="#4d7a50" fontFamily="system-ui" fontWeight="600"
            >{z.label}</text>
          );
        })}
        {/* Placed dot */}
        {dotX !== null && dotY !== null && (
          <motion.circle
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 5, opacity: 1 }}
            cx={dotX} cy={dotY}
            fill={angle !== null ? "#E8390E" : "#fff"}
            stroke="white"
            strokeWidth="1.5"
          />
        )}
        {/* Center batsman indicator */}
        <circle cx={CX} cy={CY} r={5} fill="#E8390E" opacity="0.7" />
        {/* Tap hint if not selected */}
        {angle === null && (
          <text x={CX} y={CY + 20} textAnchor="middle" fontSize="8" fill="#4d7a50" opacity="0.7">
            tap field
          </text>
        )}
      </svg>
    </div>
  );
}

// ── Shot Picker Sheet ──────────────────────────────────────────────────────
export default function ShotPickerSheet({
  isOpen,
  runs,
  onSave,
  onSkip,
}: {
  isOpen: boolean;
  runs: number;
  onSave: (shotType: string | null, fieldAngle: number | null) => void;
  onSkip: () => void;
}) {
  const [selectedShot, setSelectedShot] = useState<string | null>(null);
  const [fieldAngle, setFieldAngle] = useState<number | null>(null);

  const handleSave = () => {
    onSave(selectedShot, fieldAngle);
    setSelectedShot(null);
    setFieldAngle(null);
  };

  const handleSkip = () => {
    onSkip();
    setSelectedShot(null);
    setFieldAngle(null);
  };

  const runLabel = runs === 4 ? "FOUR" : runs === 6 ? "SIX" : `${runs} run${runs !== 1 ? "s" : ""}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
            onClick={handleSkip}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 40 } }}
            exit={{ y: "100%", opacity: 0, transition: { duration: 0.22 } }}
            className="fixed bottom-0 left-0 right-0 bg-[#0F0F0F] border-t border-white/10 rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-3 mb-3 flex-shrink-0" />

            {/* Header */}
            <div className="px-5 pb-4 border-b border-white/8 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-black text-white text-lg">How was it played?</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black`}
                    style={{ backgroundColor: runColor(runs) + "30", color: runColor(runs) }}>
                    {runs}
                  </div>
                  <span className="text-white/40 text-sm">{runLabel}</span>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 text-white/30 text-sm hover:text-white/60 transition-colors"
              >
                Skip <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 pb-6">
              {/* Shot Types */}
              <div className="mt-4 mb-5">
                <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-3">Shot Type</p>
                <div className="flex flex-wrap gap-2">
                  {SHOT_TYPES.map((s, i) => {
                    const isActive = selectedShot === s.id;
                    return (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.03 } }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedShot(isActive ? null : s.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isActive
                            ? "text-white border-transparent"
                            : "bg-white/5 border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                        }`}
                        style={isActive ? { backgroundColor: s.color + "30", borderColor: s.color + "60", color: s.color } : {}}
                      >
                        {isActive && <Check className="w-3 h-3 inline mr-1" />}
                        {s.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Wagon Wheel */}
              <div>
                <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-3">
                  Field Placement
                  {fieldAngle !== null && <span className="text-[#E8390E] ml-2">• Placed ✓</span>}
                </p>
                <InteractiveWagonWheel angle={fieldAngle} onSelect={setFieldAngle} />
                {fieldAngle !== null && (
                  <button
                    onClick={() => setFieldAngle(null)}
                    className="block mx-auto mt-2 text-xs text-white/25 hover:text-white/50"
                  >
                    Clear placement
                  </button>
                )}
              </div>

              {/* Save Button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSave}
                disabled={!selectedShot && fieldAngle === null}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: (selectedShot || fieldAngle !== null)
                    ? "linear-gradient(135deg, #E8390E, #C42E09)"
                    : "rgba(255,255,255,0.08)",
                }}
              >
                {selectedShot || fieldAngle !== null ? "Save Shot Data" : "Select shot or placement"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
