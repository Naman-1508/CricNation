"use client";

import { Home, Trophy, Plus, Users, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Trophy, label: "Tourneys", href: "/tournaments" },
  { icon: Users, label: "Teams", href: "/teams" },
  { icon: User, label: "Profile", href: "/profile/me" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const showNav = status === "authenticated";

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAF8]">
      <main className="flex-1 overflow-y-auto overscroll-none">{children}</main>

      {/* FAB — Start Match */}
      <AnimatePresence>
        {showNav && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom)+3.5rem)] right-4 z-50"
          >
            <Link href="/score">
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                className="w-14 h-14 rounded-full bg-[#E8390E] text-white shadow-[0_4px_16px_rgba(232,57,14,0.45)] flex items-center justify-center"
              >
                <Plus className="w-6 h-6" strokeWidth={2.5} />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <AnimatePresence>
        {showNav && (
          <motion.nav 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 w-full z-40 bg-white border-t border-[rgba(107,74,42,0.13)] pb-safe"
          >
            <div className="flex items-center h-16 px-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative"
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active-bar"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#E8390E] rounded-full"
                      />
                    )}
                    <item.icon
                      className={`w-5 h-5 transition-colors ${active ? "text-[#E8390E]" : "text-[#8A8278]"}`}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                    <span className={`text-[10px] font-medium transition-colors ${active ? "text-[#E8390E]" : "text-[#8A8278]"}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
