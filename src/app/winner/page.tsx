"use client";

import { Trophy, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getWeeklyWinner } from "@/lib/api";

export default function WeeklyWinnerPage() {
  const [winner, setWinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWeeklyWinner()
      .then((data) => {
        setWinner(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center pt-20 text-[var(--color-muted-foreground)]">Loading winner data...</div>;
  }

  if (error || !winner) {
    return (
      <div className="text-center pt-20 space-y-4 animate-in fade-in duration-500">
        <Trophy className="w-12 h-12 text-[var(--color-muted)] mx-auto" />
        <h2 className="text-2xl text-white font-medium">No winner yet</h2>
        <p className="text-[var(--color-muted-foreground)]">{error || "Check back on Monday!"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-16 animate-in fade-in duration-700 pb-12 pt-10">
      
      {/* Editorial Header */}
      <header className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-[var(--color-accent)] font-medium tracking-widest text-sm uppercase">
          <Trophy className="w-4 h-4" />
          Week of {winner.week_start} Champion
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-medium tracking-tighter text-white capitalize">
            {winner.winner_name}
          </h1>
          <p className="text-2xl text-[var(--color-muted-foreground)] font-light">
            Total XP: <span className="text-white font-medium">{winner.total_xp}</span>
          </p>
        </div>
      </header>

      {/* Why they won */}
      <section className="space-y-6">
        <h2 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider text-center">
          Weekly Achievements
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-lg space-y-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
            <h3 className="text-lg font-medium text-white">Execution</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-medium text-white">{winner.tasks_completed}</span>
              <span className="text-sm text-[var(--color-muted-foreground)]">tasks completed</span>
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)] pt-2 border-t border-[var(--color-border)]">
              Completed {winner.tasks_completed} tasks this week to secure the top spot.
            </p>
          </div>
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-lg space-y-3">
            <Trophy className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-lg font-medium text-white">Experience</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-medium text-white">{winner.total_xp}</span>
              <span className="text-sm text-[var(--color-muted-foreground)]">XP earned</span>
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)] pt-2 border-t border-[var(--color-border)]">
              Dominated the leaderboard by grinding experience points.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
