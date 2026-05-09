"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) setStep("OTP");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setLoading(true);
      setError("");
      const res = await signIn("credentials", { phone, otp, redirect: false });
      if (res?.ok) {
        router.push("/");
      } else {
        setError("Invalid OTP. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="text-5xl mb-3">🏏</div>
        <h1 className="text-3xl font-bold gradient-text">CricNation</h1>
        <p className="text-sm text-muted-foreground mt-1">Score. Compete. Celebrate.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm glass-card p-6"
      >
        <AnimatePresence mode="wait">
          {step === "PHONE" ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/15 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold">Welcome back!</h2>
                  <p className="text-xs text-muted-foreground">Enter your phone to continue</p>
                </div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-sm">🇮🇳</span>
                    <span className="text-sm font-semibold">+91</span>
                    <div className="w-px h-4 bg-white/15 ml-1" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="00000 00000"
                    className="w-full bg-background/60 border border-white/8 rounded-2xl py-3.5 pl-20 pr-4 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 text-base tracking-wider transition-all"
                    autoFocus
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={phone.length < 10}
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all"
                >
                  Get OTP <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>

              <p className="text-xs text-center text-muted-foreground mt-5">
                By continuing, you agree to our{" "}
                <span className="text-primary underline cursor-pointer">Terms of Service</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setStep("PHONE"); setError(""); setOtp(""); }}
                  className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-muted-foreground"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <div>
                  <h2 className="font-bold">Enter OTP</h2>
                  <p className="text-xs text-muted-foreground">Sent to +91 {phone}</p>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  placeholder="• • • • • •"
                  className="w-full bg-background/60 border border-white/8 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 text-center text-2xl font-bold tracking-[0.5em] transition-all"
                  autoFocus
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={otp.length < 6 || loading}
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Verify & Login
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  className="w-full text-muted-foreground text-xs flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend OTP in 30s
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-muted-foreground mt-6 text-center"
      >
        🔒 Secured with end-to-end encryption
      </motion.p>
    </div>
  );
}
