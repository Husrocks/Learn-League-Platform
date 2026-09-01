"use client";

import { useStore } from "@/store/useStore";
import { format } from "date-fns";
import { CheckCircle2, Circle, Flame, ArrowRight, Play, Trophy, Brain, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getMe, getLeaderboard } from "@/lib/api";

function DashboardTaskItem({ task }: { task: any }) {
  const [expanded, setExpanded] = useState(false);
  const isDone = task.status === 'completed' || task.status === 'reviewed';

  return (
    <div className="flex flex-col gap-2 p-2 group hover:bg-[var(--color-surface-hover)] rounded-md transition-colors">
      <div className="flex items-start gap-3">
        <button 
          onClick={async (e) => {
            e.stopPropagation();
            if (!isDone) {
              await useStore.getState().completeTask(task.id);
            }
          }}
          className="shrink-0 mt-0.5 focus:outline-none"
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
          ) : (
            <Circle className="w-5 h-5 text-[var(--color-muted)] hover:text-[var(--color-success)] transition-colors" />
          )}
        </button>
        <div 
          className="flex-1 cursor-pointer min-w-0 flex justify-between items-start gap-4"
          onClick={() => setExpanded(!expanded)}
        >
          <span className={`text-sm whitespace-pre-wrap ${isDone ? 'text-[var(--color-muted-foreground)] line-through' : 'text-[var(--color-foreground)]'} ${expanded ? '' : 'line-clamp-1'}`}>
            {task.title}
          </span>
          <button className="text-[var(--color-muted)] hover:text-white shrink-0 mt-0.5">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const storeUser = useStore((state) => state.currentUser);
  const storeFriends = useStore((state) => state.friends);
  
  const [liveUser, setLiveUser] = useState<any>(storeUser);
  const [liveFriends, setLiveFriends] = useState<any[]>(storeFriends);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviousTasks, setShowPreviousTasks] = useState(false);

  const today = new Date();

  useEffect(() => {
    const fetchLiveDashboard = async () => {
      try {
        const user = await getMe();
        setLiveUser(user);

        // User requested all users to appear instead of just friends
        const friends = await getLeaderboard();
        setLiveFriends(friends);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiveDashboard();
  }, [storeUser, storeFriends]);

  const monthConsistency = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate(); // 28, 29, 30, or 31 days
    const currentDay = now.getDate();
    const monthName = format(now, "MMMM");
    const streak = liveUser?.streak || 0;

    const days = Array.from({ length: totalDaysInMonth }).map((_, i) => {
      const dayNum = i + 1;
      const isPastOrToday = dayNum <= currentDay;
      const isToday = dayNum === currentDay;
      const isFuture = dayNum > currentDay;

      // Active if within the current consecutive streak ending today
      const daysFromToday = currentDay - dayNum;
      const isActive = isPastOrToday && daysFromToday < streak;

      return {
        dayNum,
        isToday,
        isFuture,
        isActive,
        dateLabel: `${monthName} ${dayNum}`,
      };
    });

    return { totalDaysInMonth, currentDay, monthName, days, streak };
  }, [liveUser?.streak]);

  const displayTasks = useMemo(() => {
    if (!liveUser?.tasks) return [];
    const todayString = new Date().toDateString();
    return liveUser.tasks.filter((task: any) => {
      const isToday = task.date_assigned 
        ? new Date(task.date_assigned).toDateString() === todayString
        : false;
      const isDone = task.status === 'completed' || task.status === 'reviewed';
      
      if (showPreviousTasks) return true;
      return isToday || !isDone;
    });
  }, [liveUser?.tasks, showPreviousTasks]);

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
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white text-lg">What are you learning today?</h3>
              <button 
                onClick={() => setShowPreviousTasks(!showPreviousTasks)}
                className="text-xs text-[var(--color-muted-foreground)] hover:text-white transition-colors focus:outline-none"
              >
                {showPreviousTasks ? "Hide Previous" : "Show Previous"}
              </button>
            </div>
            
            <div className="space-y-3">
              {displayTasks.length > 0 ? (
                displayTasks.map((task: any, i: number) => (
                  <DashboardTaskItem key={i} task={task} />
                ))
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)]">No tasks assigned for today.</p>
              )}
            </div>

            <button 
              onClick={() => window.location.href = '/learning'}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-white text-sm font-medium rounded-md transition-colors"
            >
              Log Today's Learning
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Monthly Consistency Heatmap */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Consistency
              </h3>
              <span className="text-xs text-[var(--color-muted-foreground)] font-mono">
                {monthConsistency.monthName} ({monthConsistency.totalDaysInMonth} Days)
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-hide">
              {monthConsistency.days.map((day) => {
                let boxStyle = "bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-neutral-500";

                if (day.isActive) {
                  boxStyle = "bg-[var(--color-accent)] shadow-[0_0_6px_rgba(226,109,90,0.35)] border border-[var(--color-accent)]";
                } else if (day.isToday) {
                  boxStyle = "bg-[var(--color-surface-hover)] border-2 border-white ring-1 ring-[var(--color-accent)]";
                } else if (day.isFuture) {
                  boxStyle = "bg-[var(--color-background)] border border-[var(--color-border)]/40 opacity-40";
                }

                const tooltip = day.isToday
                  ? `${day.dateLabel} (Today) - ${day.isActive ? 'Active Streak 🔥' : 'Pending'}`
                  : day.isActive
                  ? `${day.dateLabel} - Completed 🔥`
                  : day.isFuture
                  ? `${day.dateLabel} - Upcoming`
                  : `${day.dateLabel} - Inactive`;

                return (
                  <div
                    key={day.dayNum}
                    className={`flex-1 min-w-[9px] max-w-[16px] h-3.5 sm:h-4 rounded-sm transition-all cursor-pointer ${boxStyle}`}
                    title={tooltip}
                  />
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-[var(--color-muted-foreground)] font-mono px-0.5">
              <span>Day 1</span>
              <span>Day 15</span>
              <span>Day {monthConsistency.totalDaysInMonth}</span>
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
              {[...liveFriends].sort((a, b) => (b.total_xp || b.weeklyScore) - (a.total_xp || a.weeklyScore)).slice(0, 3).map((friend, i) => {
                const friendActive = friend.last_seen
                  ? (Date.now() - new Date(friend.last_seen).getTime()) < 5 * 60 * 1000
                  : false;
                return (
                  <div key={friend.id} className="flex items-center justify-between p-2 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[var(--color-muted-foreground)] w-4">{`0${i + 1}`}</span>
                      <div className="flex items-center gap-1.5">
                        {friendActive && (
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                          </span>
                        )}
                        <span className="text-sm font-medium text-white">{friend.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{friend.total_xp || friend.weeklyScore} XP</div>
                    </div>
                  </div>
                );
              })}
              
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
