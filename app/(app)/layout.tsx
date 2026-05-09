"use client";

import { Home, Trophy, Plus, Activity, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Trophy, label: "Tourneys", href: "/tournaments" },
  { icon: Activity, label: "Social", href: "/social" },
  { icon: User, label: "Profile", href: "/profile/me" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overscroll-none">
        {children}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom)+3.5rem)] left-1/2 -translate-x-1/2 z-50">
        <Link href="/score">
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-[0_0_24px_rgba(34,197,94,0.5)] flex items-center justify-center border-2 border-primary/50 neon-glow"
          >
            <Plus className="w-6 h-6 font-bold" strokeWidth={2.5} />
          </motion.button>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-40 bg-background/90 backdrop-blur-xl border-t border-white/6 pb-safe">
        <div className="flex items-center h-16 px-2">
          {navItems.slice(0, 2).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative"
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-2 w-5 h-0.5 bg-primary rounded-full"
                  />
                )}
                <item.icon
                  className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className={`text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* FAB Spacer */}
          <div className="w-16 flex-shrink-0" />

          {navItems.slice(2, 4).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative"
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-2 w-5 h-0.5 bg-primary rounded-full"
                  />
                )}
                <item.icon
                  className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className={`text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
