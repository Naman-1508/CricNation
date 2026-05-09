"use client";

import { Home, Trophy, Plus, Activity, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Trophy, label: "Tourneys", href: "/tournaments" },
    { icon: Activity, label: "Social", href: "/social" },
    { icon: User, label: "Profile", href: "/profile/me" },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Floating Action Button (Start Match) */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <Link href="/score">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center border-4 border-background"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full h-16 bg-surface border-t border-border flex items-center justify-around px-2 pb-safe z-40">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-16 h-full text-muted-foreground hover:text-foreground">
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
        
        {/* Spacer for FAB */}
        <div className="w-16" />

        {navItems.slice(2, 4).map((item) => {
          const isActive = pathname.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : 'not-matching');
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-16 h-full text-muted-foreground hover:text-foreground">
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
