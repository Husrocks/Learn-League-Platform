"use client";

import { useStore } from "@/store/useStore";
import { Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { getLeaderboard } from "@/lib/api";

export default function LeaderboardPage() {
  const { currentUser } = useStore();
  const [filter, setFilter] = useState<"Today" | "Week" | "Month">("Week");
  
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const users = await getLeaderboard();
        setLeaderboardUsers(users);
      } catch (e) {
        console.error("Failed to load leaderboard data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoard();
  }, [currentUser]);

  if (!currentUser || isLoading) return null;

  const allUsers = leaderboardUsers;
  const userRankIndex = allUsers.findIndex(u => u.id === currentUser.id);

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      
      <header className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white mb-2">Leaderboard</h1>
            <p className="text-[var(--color-muted-foreground)]">
              Week 35 Objective: Be the most consistent learner.
            </p>
          </div>
          
          <div className="flex bg-[var(--color-surface)] p-1 rounded-md border border-[var(--color-border)]">
            {["Today", "Week", "Month"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                  filter === f 
                    ? "bg-[var(--color-surface-hover)] text-white shadow-sm" 
                    : "text-[var(--color-muted-foreground)] hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="space-y-4">
        {/* Leaderboard List */}
        <div className="space-y-3">
          {allUsers.map((user, i) => {
            const isMe = user.id === currentUser.id;
            const active = isMe
              ? true
              : user.last_seen
              ? (Date.now() - new Date(user.last_seen).getTime()) < 5 * 60 * 1000
              : false;

            return (
              <div 
                key={user.id}
                className={`flex items-center p-4 rounded-lg border transition-colors ${
                  isMe 
                    ? "bg-[var(--color-surface-hover)] border-[var(--color-border)] shadow-sm" 
                    : "bg-transparent border-transparent hover:border-[var(--color-border)]"
                }`}
              >
                <div className="w-12 text-center shrink-0">
                  <span className={`text-xl font-medium ${isMe ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted-foreground)]'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <div className="flex-1 flex items-center gap-6 ml-4">
                  <div className="w-48">
                    <div className="flex items-center gap-2">
                      {/* Green active dot */}
                      {active && (
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                        </span>
                      )}
                      <span className="text-lg font-medium text-white">{isMe ? "You" : user.name}</span>
                      {active && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-green-400 leading-none">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--color-muted-foreground)]">{user.learning_goal || "General"}</span>
                  </div>
                  
                  <div className="w-24 text-right">
                    <span className="text-xl font-medium text-white block">{user.total_xp || user.weekly_score}</span>
                    <span className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">Score</span>
                  </div>

                  <div className="w-24 text-right hidden md:block">
                    <span className="flex items-center justify-end gap-1 text-base text-white">
                      {user.streak} <Flame className="w-4 h-4 text-[var(--color-accent)]" />
                    </span>
                    <span className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">Streak</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actionable insight */}
        {userRankIndex > 0 && allUsers[userRankIndex - 1] && (
          <div className="pt-6 border-t border-[var(--color-border)] text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              You're <span className="text-white font-medium">
                {((allUsers[userRankIndex - 1].total_xp || allUsers[userRankIndex - 1].weekly_score || 0) - (currentUser.total_xp || currentUser.weekly_score || 0)).toFixed(1)} points
              </span> away from #{userRankIndex}.
            </p>
          </div>
        )}
      </section>

    </div>
  );
}
