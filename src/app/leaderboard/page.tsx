"use client";

import { useStore, User } from "@/store/useStore";
import { Flame } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getLeaderboard } from "@/lib/api";
import { motion } from "framer-motion";
import { startOfWeek, addDays, isSameDay, isSameMonth, isSameYear } from "date-fns";

function parseLogDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  const cleanStr = dateStr.split("T")[0];
  const parts = cleanStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
  return new Date(dateStr);
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function LeaderboardPage() {
  const { currentUser, friends } = useStore();
  const [filter, setFilter] = useState<"Today" | "Week" | "Month">("Week");
  const [now] = useState(() => Date.now());
  
  // Initialize with cached friends if available to prevent loading flashes
  const [leaderboardUsers, setLeaderboardUsers] = useState<User[]>(friends || []);
  const [isLoading, setIsLoading] = useState(friends && friends.length > 0 ? false : true);

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

  // Dynamic score calculation based on active timeframe filter
  const getUserTimeframeScore = useMemo(() => {
    return (user: User): number => {
      const logs = user.logs || [];
      const nowDate = new Date();

      if (filter === "Today") {
        const todayLogs = logs.filter(l => l.date && isSameDay(parseLogDate(l.date), nowDate));
        return todayLogs.reduce((acc, l) => acc + (l.xp_earned ?? Math.round((l.hours_studied || 0) * 50)), 0);
      }

      if (filter === "Week") {
        const weekStart = startOfWeek(nowDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        const weekLogs = logs.filter(l => {
          if (!l.date) return false;
          const d = parseLogDate(l.date);
          return isSameDay(d, weekStart) || isSameDay(d, weekEnd) || (d >= weekStart && d <= weekEnd);
        });
        const weekXp = weekLogs.reduce((acc, l) => acc + (l.xp_earned ?? Math.round((l.hours_studied || 0) * 50)), 0);
        if (weekXp > 0) return weekXp;
        return user.weekly_score ?? (user.hours_studied_this_week ? user.hours_studied_this_week * 50 : 0);
      }

      // Month Filter
      const monthLogs = logs.filter(l => {
        if (!l.date) return false;
        const d = parseLogDate(l.date);
        return isSameMonth(d, nowDate) && isSameYear(d, nowDate);
      });
      const monthXp = monthLogs.reduce((acc, l) => acc + (l.xp_earned ?? Math.round((l.hours_studied || 0) * 50)), 0);
      if (monthXp > 0) return monthXp;
      return user.total_xp ?? user.totalXp ?? 0;
    };
  }, [filter]);

  const allUsers = useMemo(() => {
    return [...leaderboardUsers].sort((a, b) => getUserTimeframeScore(b) - getUserTimeframeScore(a));
  }, [leaderboardUsers, getUserTimeframeScore]);

  if (!currentUser || isLoading) return null;

  const userRankIndex = allUsers.findIndex(u => u.id === currentUser.id);

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      
      <header className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white mb-1">Leaderboard</h1>
            <p className="text-[var(--color-muted-foreground)] text-sm">
              Ranking learners by authentic consistency & XP performance ({filter}).
            </p>
          </div>
          
          <div className="flex bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)] shrink-0 self-start sm:self-auto">
            {(["Today", "Week", "Month"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  filter === f 
                    ? "bg-[var(--color-accent)] text-white shadow-sm" 
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
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {allUsers.map((user, i) => {
            const isMe = user.id === currentUser.id;
            const active = isMe
              ? true
              : user.last_seen
              ? (now - new Date(user.last_seen).getTime()) < 5 * 60 * 1000
              : false;
              
            const score = getUserTimeframeScore(user);

            const rankStyle = i === 0 
              ? "bg-[var(--color-surface)] border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
              : i === 1
              ? "bg-[var(--color-surface)] border-slate-300/50 shadow-[0_0_15px_rgba(203,213,225,0.1)]"
              : i === 2
              ? "bg-[var(--color-surface)] border-amber-700/50 shadow-[0_0_15px_rgba(180,83,9,0.1)]"
              : isMe
              ? "bg-[var(--color-surface-hover)] border-[var(--color-border)] shadow-sm"
              : "bg-transparent border-transparent hover:border-[var(--color-border)]";

            const rankTextColor = i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : isMe ? "text-[var(--color-accent)]" : "text-[var(--color-muted-foreground)]";

            return (
              <motion.div 
                variants={item}
                key={user.id}
                className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${rankStyle}`}
              >
                <div className="w-10 sm:w-12 text-center shrink-0">
                  <span className={`text-xl sm:text-2xl font-bold ${rankTextColor}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <div className="flex-1 flex items-center gap-2 sm:gap-6 ml-2 sm:ml-4 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {/* Green active dot */}
                      {active && (
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                      )}
                      <span className="text-base sm:text-lg font-medium text-white truncate">{isMe ? "You" : user.name}</span>
                      {active && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 leading-none shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--color-muted-foreground)] truncate block">{user.learning_goal || "General"}</span>
                  </div>
                  
                  <div className="w-20 sm:w-28 text-right shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-white block">{score} XP</span>
                    <span className="text-[10px] sm:text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">{filter} Score</span>
                  </div>

                  <div className="w-20 text-right hidden md:block">
                    <span className="flex items-center justify-end gap-1 text-sm font-medium text-white">
                      {user.streak} <Flame className="w-4 h-4 text-orange-500" />
                    </span>
                    <span className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">Streak</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Actionable insight */}
        {userRankIndex > 0 && allUsers[userRankIndex - 1] && (
          <div className="pt-6 border-t border-[var(--color-border)] text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              You&apos;re <span className="text-white font-medium">
                {(getUserTimeframeScore(allUsers[userRankIndex - 1]) - getUserTimeframeScore(currentUser)).toFixed(0)} XP
              </span> away from #{userRankIndex}.
            </p>
          </div>
        )}
      </section>

    </div>
  );
}
