"use client";

import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans selection:bg-[var(--color-accent)] selection:text-white pb-20">
      
      <nav className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[var(--color-accent)] flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-medium tracking-tight text-white">LearnLeague</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth/login" className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Start Learning
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-20 space-y-24">
        
        {/* Hero */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter text-white leading-tight">
            Learn with your friends.<br />
            <span className="text-[var(--color-muted-foreground)]">See who actually improves.</span>
          </h1>
          <p className="text-xl text-[var(--color-muted-foreground)] max-w-2xl font-light leading-relaxed">
            A private learning competition where your daily consistency, weekly knowledge, and long-term progress actually matter.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Link href="/auth/signup" className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-md text-base font-medium hover:bg-gray-200 transition-colors">
              Start a learning group
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-6 py-3 rounded-md text-base font-medium text-[var(--color-muted-foreground)] hover:text-white transition-colors">
              See how it works
            </button>
          </div>
        </section>

        {/* Realistic UI Mock / Hero Visual */}
        <section className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 md:p-8 overflow-hidden shadow-2xl shadow-[var(--color-accent)]/5 animate-in fade-in duration-1000 delay-300">
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-50" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90">
            <div className="space-y-4">
              <div className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Your Week</div>
              <div className="text-4xl font-medium text-white mb-2">18h 45m</div>
              <div className="flex gap-1">
                {[1,1,1,1,1,0.5,0.2].map((v, i) => (
                  <div key={i} className="flex-1 h-12 bg-[var(--color-accent)] rounded-sm" style={{ opacity: v }} />
                ))}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Social Proof</div>
              <div className="space-y-2">
                <div className="p-3 bg-[var(--color-background)] rounded border border-[var(--color-border)] text-sm">
                  <strong className="text-white">Ahmed</strong> completed 2h 14m today
                </div>
                <div className="p-3 bg-[var(--color-background)] rounded border border-[var(--color-border)] text-sm">
                  <strong className="text-white">Sara</strong> moved from #5 → #3
                </div>
                <div className="p-3 bg-[var(--color-background)] rounded border border-[var(--color-border)] text-sm">
                  <strong className="text-white">Hamza</strong> started a 9-day streak
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-[var(--color-border)]">
          <div className="space-y-3">
            <h3 className="text-xl font-medium text-white">Daily Consistency</h3>
            <p className="text-[var(--color-muted-foreground)]">
              Track exactly what you learned, build your streak, and see your progress mapped on a heatmap calendar.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-medium text-white">Weekly AI Tests</h3>
            <p className="text-[var(--color-muted-foreground)]">
              A specialized AI interviewer tests you every weekend based entirely on the specific topics you studied.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-medium text-white">Social Leaderboard</h3>
            <p className="text-[var(--color-muted-foreground)]">
              Compete against your friends in a private league. Earn points for consistency, study time, and test scores.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-20">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">Your next 30 days could change everything.</h2>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors">
            Start Learning
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

      </main>
    </div>
  );
}
