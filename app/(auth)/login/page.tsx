"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, ArrowRight, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) setStep("OTP");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setLoading(true);
      const res = await signIn("credentials", {
        phone,
        otp,
        redirect: false,
      });
      if (res?.ok) {
        router.push("/");
      } else {
        alert("Invalid OTP");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-border"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-heading font-bold text-center mb-2">
          {step === "PHONE" ? "Welcome to CricNation" : "Verify Phone"}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {step === "PHONE" 
            ? "Enter your phone number to continue" 
            : `We sent a code to ${phone}`}
        </p>

        {step === "PHONE" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="00000 00000"
                className="w-full bg-background border border-border rounded-xl py-3 pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
                autoFocus
              />
            </div>
            <button
              disabled={phone.length < 10}
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Get OTP <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-2xl tracking-widest"
              autoFocus
            />
            <button
              disabled={otp.length < 6 || loading}
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Verifying..." : <><ShieldCheck className="w-4 h-4" /> Verify & Secure Login</>}
            </button>
            <button 
              type="button"
              onClick={() => setStep("PHONE")}
              className="w-full text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
