"use client";

import { useStore } from "@/store/useStore";
import { format } from "date-fns";
import { CheckCircle2, Circle, Flame, ArrowRight, Play, Trophy, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { getMe, getFriends } from "@/lib/api";

export default function DashboardPage() {
  const storeUser = useStore((state) => state.currentUser);
  const storeFriends = useStore((state) => state.friends);
  
  const [liveUser, setLiveUser] = useState<any>(storeUser);
  const [liveFriends, setLiveFriends] = useState<any[]>(storeFriends);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date();
  const USER_ID = 1; // Default for prototype

  useEffect(() => {
    const fetchLiveDashboard = async () => {
      try {
        const user = await getMe();
        setLiveUser(user);
        
        const friends = await getFriends(USER_ID);
        setLiveFriends(friends);
      } catch (e) {
        // Fallback to mock store if backend offline
        setLiveUser(storeUser);
        setLiveFriends(storeFriends);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiveDashboard();
  }, [storeUser, storeFriends]);

  if (isLoading || !liveUser) return null;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header Context */}
      <header className="space-y-1">
        <h1 className="text-3xl font-medium tracking-tight text-white">
          {format(today, "EEEE, MMMM d")}
        </h1>
        <p className="text-[var(--color-muted-foreground)] flex items-center gap-2">
          Your <span className="font-medium text-white">{liveUser.streak}th</span> consecutive day.
          <Flame className="w-4 h-4 text-[var(--color-accent)]" />
        </p>
      </header>

      {/* Today's Workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today's Action */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-medium text-white">Total Experience (XP)</h2>
              <div className="text-right">
                <span className="text-2xl font-medium text-[var(--color-accent)]">{liveUser.total_xp || liveUser.totalXp}</span>
                <span className="text-[var(--color-muted-foreground)] ml-2 text-sm">XP</span>
              </div>
            </div>
            
            <div className="h-2 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-1000" style={{ width: `${Math.min(((liveUser.total_xp || liveUser.totalXp) / 5000) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="glass-panel rounded-lg p-6 space-y-6">
            <h3 className="font-medium text-white text-lg">What are you learning today?</h3>
            
            <div className="space-y-3">
              {[
                { label: "Understand React's rendering model", done: true },
                { label: "Build custom hooks for data fetching", done: false },
                { label: "Complete 2 Leetcode algorithms", done: false },
              ].map((task, i) => (
                <div key={i} className="flex items-start gap-3 group cursor-pointer hover:bg-[var(--color-surface-hover)] p-2 rounded-md transition-colors">
                  {task.done ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--color-muted)] group-hover:text-white transition-colors shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm ${task.done ? 'text-[var(--color-muted-foreground)] line-through' : 'text-[var(--color-foreground)]'}`}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => window.location.href = '/learning'}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-white text-sm font-medium rounded-md transition-colors"
            >
              Log Today's Learning
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Activity Heatmap Mock */}
          <div className="pt-4">
            <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4">Consistency</h3>
            <div className="flex gap-1 overflow-hidden">
              {Array.from({ length: 28 }).map((_, i) => {
                const intensity = Math.random();
                let bgClass = "bg-[var(--color-surface)]";
                if (intensity > 0.8) bgClass = "bg-[var(--color-accent)]";
                else if (intensity > 0.5) bgClass = "bg-[var(--color-accent)] opacity-60";
                else if (intensity > 0.2) bgClass = "bg-[var(--color-accent)] opacity-30";
                
                return (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-sm ${bgClass}`}
                    title="Activity detail"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Context & Competition */}
        <div className="space-y-8">
          
          {/* Upcoming Test Context */}
          <div className="border border-[var(--color-border)] rounded-lg p-5 hover:border-[var(--color-accent)] transition-colors">
            <h3 className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4">Upcoming</h3>
            <div className="space-y-1 mb-4">
              <div className="font-medium text-white">Weekly Knowledge Interview</div>
              <div className="text-sm text-[var(--color-muted-foreground)]">Available Now</div>
            </div>
            <button 
              onClick={() => window.location.href = '/test'}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white text-sm font-medium rounded-md transition-colors border border-[var(--color-accent)]/20"
            >
              <Brain className="w-4 h-4 fill-current" />
              Take AI Test
            </button>
          </div>

          {/* Leaderboard Context */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Top Friends</h3>
              <span className="text-xs text-[var(--color-accent)]">Weekly</span>
            </div>
            
            <div className="space-y-1">
              {[...liveFriends].sort((a, b) => (b.total_xp || b.weeklyScore) - (a.total_xp || a.weeklyScore)).slice(0, 3).map((friend, i) => (
                <div key={friend.id} className="flex items-center justify-between p-2 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[var(--color-muted-foreground)] w-4">{`0${i + 1}`}</span>
                    <span className="text-sm font-medium text-white">{friend.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{friend.total_xp || friend.weeklyScore} XP</div>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] mt-2 cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors" onClick={() => window.location.href = '/leaderboard'}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[var(--color-accent)] w-4">--</span>
                  <span className="text-sm font-medium text-white">You</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[var(--color-accent)]">{liveUser.total_xp || liveUser.totalXp} XP</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      
    </div>
  );
}
