"use client";

import { Trophy, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function WeeklyWinnerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-16 animate-in fade-in duration-700 pb-12 pt-10">
      
      {/* Editorial Header */}
      <header className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-[var(--color-accent)] font-medium tracking-widest text-sm uppercase">
          <Trophy className="w-4 h-4" />
          Week 35 Champion
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-medium tracking-tighter text-white">
            Ahmed Khan
          </h1>
          <p className="text-2xl text-[var(--color-muted-foreground)] font-light">
            Score: <span className="text-white font-medium">91.8</span> / 100
          </p>
        </div>
      </header>

      {/* Why he won */}
      <section className="space-y-6">
        <h2 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider text-center">
          Why He Won
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-lg space-y-3">
            <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-lg font-medium text-white">Consistency</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-medium text-white">96%</span>
              <span className="text-sm text-[var(--color-muted-foreground)]">7/7 days</span>
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)] pt-2 border-t border-[var(--color-border)]">
              Maintained a perfect streak throughout the week.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-lg space-y-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
            <h3 className="text-lg font-medium text-white">Execution</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-medium text-white">88%</span>
              <span className="text-sm text-[var(--color-muted-foreground)]">42 tasks</span>
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)] pt-2 border-t border-[var(--color-border)]">
              Completed almost all planned daily goals.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-lg space-y-3 md:col-span-2">
            <Clock className="w-5 h-5 text-[#888888]" />
            <h3 className="text-lg font-medium text-white">Study Time</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-medium text-white">18h 45m</span>
              <span className="text-sm text-[var(--color-success)]">+4h from last week</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-border)] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: '90%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* AI Test performance */}
      <section className="text-center space-y-4 pt-8 border-t border-[var(--color-border)]">
        <h2 className="text-xl font-medium text-white">Knowledge Mastery</h2>
        <p className="text-[var(--color-muted-foreground)] max-w-lg mx-auto">
          Ahmed scored <strong className="text-white">92%</strong> on the weekly AI interview, showing deep understanding of Backend Development and API authentication.
        </p>
      </section>

    </div>
  );
}
