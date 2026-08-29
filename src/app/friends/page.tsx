"use client";

import { useStore } from "@/store/useStore";
import { Flame, Trophy } from "lucide-react";

export default function FriendsPage() {
  const { friends } = useStore();

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      
      <header className="space-y-2 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-medium tracking-tight text-white">Friends</h1>
        <p className="text-[var(--color-muted-foreground)]">
          Compare progress, streaks, and weekly activity.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Col: Friends List */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Learning Network
            </h2>
            <button className="text-sm text-white hover:underline decoration-[var(--color-border)] underline-offset-4">
              + Invite Friend
            </button>
          </div>

          <div className="space-y-6">
            {friends.map((friend, i) => (
              <div key={friend.id} className="group">
                <div className="flex items-start justify-between py-4 border-b border-[var(--color-border)] group-last:border-0">
                  
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center text-xs font-medium text-white relative">
                        {friend.name.charAt(0)}
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--color-background)]" />
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-white">{friend.name}</h3>
                      <div className="flex items-center gap-1 text-[var(--color-accent)] font-medium text-sm">
                        <Flame className="w-3.5 h-3.5" /> {friend.streak} days
                      </div>
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)] ml-11">
                      {friend.learning_goal}
                    </p>
                  </div>

                  {/* Stats Snippet */}
                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <div className="text-sm font-medium text-white">{friend.hours_studied_this_week}h 40m</div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">This week</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{friend.weekly_score}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">Score</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--color-accent)]">#{i + 1}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">Rank</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
            Activity Feed
          </h2>
          
          <div className="space-y-4">
            {friends.length > 0 ? (
              friends.slice(0, 5).map((friend, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-px bg-[var(--color-border)] relative my-1 ml-2">
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border)]" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-[var(--color-foreground)]">
                      <span className="font-medium text-white">{friend.name}</span> completed {friend.hours_studied_this_week || 0}h this week
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{i + 1}h ago</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">No recent activity.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
