"use client";

import { Flame, Trophy, Clock, Medal } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    {
      id: 1,
      title: "30 Day Streak",
      category: "Consistency",
      date: "Aug 22",
      icon: Flame,
      unlocked: true,
    },
    {
      id: 2,
      title: "100 Hours",
      category: "Persistence",
      date: "Aug 17",
      icon: Clock,
      unlocked: true,
    },
    {
      id: 3,
      title: "Weekly #1",
      category: "Competition",
      date: "Aug 30",
      icon: Trophy,
      unlocked: true,
    },
    {
      id: 4,
      title: "Perfect Month",
      category: "Consistency",
      date: null,
      icon: Medal,
      unlocked: false,
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      
      <header className="space-y-2 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-medium tracking-tight text-white">Achievements</h1>
        <p className="text-[var(--color-muted-foreground)]">
          Milestones earned through discipline and progress.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {achievements.map((a) => (
          <div 
            key={a.id} 
            className={`p-6 rounded-lg border transition-all ${
              a.unlocked 
                ? "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-muted)]" 
                : "bg-transparent border-[var(--color-border)] border-dashed opacity-50"
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                a.unlocked ? "bg-[var(--color-accent)]/10" : "bg-[var(--color-surface-hover)]"
              }`}>
                <a.icon className={`w-5 h-5 ${a.unlocked ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`} />
              </div>
              {a.unlocked && (
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {a.date}
                </span>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-1">{a.title}</h3>
              <p className="text-sm text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {a.category}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
