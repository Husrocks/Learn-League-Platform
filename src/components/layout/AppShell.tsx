"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  Users, 
  Trophy,
  Calendar,
  Settings,
  Brain
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useStore();

  useEffect(() => {
    const isPublicRoute = pathname.startsWith("/auth") || pathname.startsWith("/onboarding") || pathname === "/welcome";
    if (!currentUser && !isPublicRoute) {
      router.push("/auth/login");
    }
  }, [currentUser, pathname, router]);

  // Onboarding or auth pages shouldn't have the shell
  if (pathname.startsWith("/auth") || pathname.startsWith("/onboarding") || pathname === "/welcome") {
    return <>{children}</>;
  }
  
  // Wait for redirect to happen
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] py-6 px-4">
        <div className="mb-10 px-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[var(--color-accent)] flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-medium tracking-tight text-white">LearnLeague</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive 
                    ? "bg-[var(--color-surface-hover)] text-white font-medium" 
                    : "text-[var(--color-muted-foreground)] hover:text-white hover:bg-[var(--color-surface-hover)]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
          <Link 
            href="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-white hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl p-6 md:p-10">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-lg z-50">
        <nav className="flex justify-around items-center h-16 px-2">
          {[
            { name: "Home", href: "/", icon: Home },
            { name: "Learn", href: "/learning", icon: BookOpen },
            { name: "Friends", href: "/friends", icon: Users },
            { name: "Rank", href: "/leaderboard", icon: Trophy },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                  isActive ? "text-[var(--color-accent)]" : "text-[var(--color-muted-foreground)] hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
