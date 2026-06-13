"use client";

import { Home, Trophy, Users, User, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { NotificationBell, NotificationPanel } from "@/components/NotificationCenter";

const NAV_ITEMS = [
  { icon: Home,   label: "Home",     href: "/" },
  { icon: Trophy, label: "Tourneys", href: "/tournaments" },
  { icon: Users,  label: "Teams",    href: "/teams" },
  { icon: User,   label: "Profile",  href: "/profile/me" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);

  const showNav = status === "authenticated";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Paths where nav + FAB should be hidden (full-screen scoring)
  const hideNav = pathname.startsWith("/score/");

  return (
    <div className="flex flex-col bg-[#0A0A0A] h-[100dvh] w-full overflow-hidden">
      <main
        className="flex-1 overflow-y-auto scroll-native hide-scrollbar pb-[calc(env(safe-area-inset-bottom,0px)+96px)]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </main>

      {/* Notification Panel */}
      {showNav && (
        <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      )}

      {/* FAB — Start Scoring */}
      <AnimatePresence>
        {showNav && !hideNav && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed z-50 gpu"
            style={{
              bottom: `calc(env(safe-area-inset-bottom, 0px) + 72px)`,
              right: "16px",
            }}
          >
            <Link href="/score">
              <motion.button
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.06 }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E8390E] to-[#C42E09] text-white flex items-center justify-center glow-brand btn-native"
              >
                <Plus className="w-6 h-6" strokeWidth={2.8} />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <AnimatePresence>
        {showNav && !hideNav && (
          <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0, transition: { type: "spring", stiffness: 380, damping: 36 } }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bottom-nav-bg border-t border-white/8 pb-safe"
          >
            <div className="flex items-center h-16 px-2">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative btn-native"
                  >
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#E8390E] rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                    </AnimatePresence>
                    <motion.div
                      animate={{ scale: active ? 1 : 0.92, opacity: active ? 1 : 0.45 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <item.icon
                        className={`w-5 h-5 transition-colors ${active ? "text-[#E8390E]" : "text-white/45"}`}
                        strokeWidth={active ? 2.5 : 1.8}
                      />
                    </motion.div>
                    <motion.span
                      animate={{ opacity: active ? 1 : 0.4, y: active ? 0 : 1 }}
                      className={`text-[10px] font-semibold leading-none ${active ? "text-[#E8390E]" : "text-white/40"}`}
                    >
                      {item.label}
                    </motion.span>
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
