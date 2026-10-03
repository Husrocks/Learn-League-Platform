"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  Users, 
  Trophy,
  Calendar,
  Settings,
  Brain,
  Shield,
  MoreHorizontal,
  LogOut,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "My Learning", href: "/learning", icon: BookOpen },
  { name: "Daily Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Friends", href: "/friends", icon: Users },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Weekly Test", href: "/test", icon: Brain },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

/**
 * Mobile Primary Bottom Navigation (Limited to 5 items maximum for optimal UX)
 */
const PRIMARY_MOBILE_NAV = [
  { name: "Home", href: "/", icon: Home },
  { name: "Learn", href: "/learning", icon: BookOpen },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Rank", href: "/leaderboard", icon: Trophy },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, initAuth, isInitializing, logout } = useStore();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Restore JWT session from localStorage on page load
  useEffect(() => { initAuth(); }, [initAuth]);

  // Route protection
  useEffect(() => {
    const isPublicRoute = pathname.startsWith("/auth") || pathname.startsWith("/onboarding") || pathname === "/welcome";
    if (!isInitializing && !currentUser && !isPublicRoute) {
      router.push("/auth/login");
    }
  }, [isInitializing, currentUser, pathname, router]);

  // Close mobile "More" menu automatically on route change
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [pathname]);

  // Close mobile "More" menu on Escape key press (Accessibility requirement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMoreMenuOpen) {
        setIsMoreMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMoreMenuOpen]);

  // Onboarding or auth pages shouldn't have the shell
  if (pathname.startsWith("/auth") || pathname.startsWith("/onboarding") || pathname === "/welcome") {
    return <>{children}</>;
  }
  
  // Loading state during auth check
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] text-white space-y-4">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading LearnLeague...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  const isAdmin = currentUser.role === "admin";

  const SECONDARY_MORE_NAV = [
    { name: "AI Test", href: "/test", icon: Brain },
    { name: "Friends", href: "/friends", icon: Users },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Weekly Winner", href: "/winner", icon: Trophy },
    { name: "Settings", href: "/settings", icon: Settings },
    ...(isAdmin ? [{ name: "Admin Dashboard", href: "/admin", icon: Shield }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] py-6 px-4">
        <div className="mb-10 px-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[var(--color-accent)] flex items-center justify-center shadow-md">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-medium tracking-tight text-white">LearnLeague</span>
        </div>
        
        <nav className="flex-1 space-y-1" aria-label="Desktop Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors min-h-[44px]",
                  isActive 
                    ? "bg-[var(--color-surface-hover)] text-white font-semibold border-l-2 border-[var(--color-accent)]" 
                    : "text-[var(--color-muted-foreground)] hover:text-white hover:bg-[var(--color-surface-hover)]"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link 
              href="/admin"
              aria-current={pathname === "/admin" ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors min-h-[44px]",
                pathname === "/admin"
                  ? "bg-red-500/10 text-red-400 font-semibold border-l-2 border-red-500" 
                  : "text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
              )}
            >
              <Shield className="w-4 h-4 shrink-0" />
              Admin Dashboard
            </Link>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-[var(--color-border)] space-y-2">
          <Link 
            href="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[var(--color-muted-foreground)] hover:text-white hover:bg-[var(--color-surface-hover)] transition-colors min-h-[44px]"
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </Link>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors min-h-[44px] text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area — pb-28 ensures fixed bottom navbar never covers interactive elements */}
      <main className="flex-1 overflow-y-auto pb-28 md:pb-0 bg-[var(--color-background)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-6xl p-4 sm:p-6 md:p-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation (4 Primary Links + 1 More Trigger) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-lg z-40">
        <nav className="flex justify-around items-center h-16 px-1" aria-label="Mobile Bottom Navigation">
          {PRIMARY_MOBILE_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors px-1 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] rounded-md",
                  isActive 
                    ? "text-[var(--color-accent)] font-semibold" 
                    : "text-[var(--color-muted-foreground)] hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-medium leading-tight tracking-tight">{item.name}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] -mt-0.5" />
                )}
              </Link>
            );
          })}

          {/* More Menu Trigger Button */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            aria-expanded={isMoreMenuOpen}
            aria-haspopup="dialog"
            aria-label="Open More Menu"
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors px-1 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] rounded-md",
              isMoreMenuOpen || SECONDARY_MORE_NAV.some(i => i.href === pathname)
                ? "text-[var(--color-accent)] font-semibold"
                : "text-[var(--color-muted-foreground)] hover:text-white"
            )}
          >
            <MoreHorizontal className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium leading-tight tracking-tight">More</span>
          </button>
        </nav>
      </div>

      {/* Secondary Mobile "More" Slide-up Sheet / Dialog */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Bottom Sheet Menu */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="More Navigation Menu"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-t-2xl p-6 space-y-6 z-50 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center font-bold text-white text-base">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base leading-tight">{currentUser.name}</h3>
                    <p className="text-xs text-[var(--color-muted-foreground)]">@{currentUser.username} &bull; <span className="text-[var(--color-accent)] font-medium">{currentUser.total_xp ?? 0} XP</span></p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:text-white hover:bg-[var(--color-surface-hover)] transition-colors focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links Grid/List */}
              <div className="space-y-1">
                {SECONDARY_MORE_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                        isActive
                          ? "bg-[var(--color-surface-hover)] text-white border-l-4 border-[var(--color-accent)] pl-3"
                          : "text-[var(--color-muted-foreground)] hover:text-white hover:bg-[var(--color-surface-hover)]"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0", item.href === "/admin" ? "text-red-400" : "")} />
                      <span className={item.href === "/admin" ? "text-red-400" : ""}>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Account Logout Divider & Action */}
              <div className="pt-2 border-t border-[var(--color-border)]">
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors min-h-[44px] text-left"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
