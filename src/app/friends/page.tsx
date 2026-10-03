"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Flame, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FriendsPage() {
  const { friends, addFriend } = useStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsSubmitting(true);
    setInviteStatus(null);
    try {
      await addFriend(inviteEmail);
      setInviteStatus("Invitation sent successfully!");
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteEmail("");
        setInviteStatus(null);
      }, 1500);
    } catch (err: unknown) {
      setInviteStatus(err instanceof Error ? err.message : "Could not send invite.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <button 
              onClick={() => setShowInviteModal(true)}
              className="text-sm text-white flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Invite Friend</span>
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
          >
            {friends.map((friend) => (
              <motion.div 
                key={friend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group glass-panel rounded-xl overflow-hidden hover:border-[var(--color-accent)] transition-all duration-300"
              >
                <div className="flex items-start justify-between p-5">
                  
                  {/* Info */}
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center text-sm font-bold text-white relative shadow-sm">
                        {friend.name.charAt(0)}
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--color-surface)] shadow-sm" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white truncate">{friend.name}</h3>
                      <div className="flex items-center gap-1 text-orange-500 font-medium text-xs sm:text-sm shrink-0 ml-1 sm:ml-2 bg-orange-500/10 px-2 py-0.5 rounded-full">
                        <Flame className="w-3.5 h-3.5" /> {friend.streak} days
                      </div>
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)] ml-14 truncate block">
                      {friend.learning_goal || "General"}
                    </p>
                  </div>

                  {/* Stats Snippet */}
                  <div className="flex items-center gap-8 text-right">
                    <div className="hidden sm:block">
                      <div className="text-lg font-bold text-white">{friend.hours_studied_this_week}h 40m</div>
                      <div className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">This week</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[var(--color-accent)]">{friend.weekly_score}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">Score</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
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

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[var(--color-accent)]" />
                  Invite a Friend
                </h3>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 text-[var(--color-muted-foreground)] hover:text-white rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {inviteStatus && (
                <div className={`p-3 rounded-md text-xs border ${inviteStatus.includes("success") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                  {inviteStatus}
                </div>
              )}

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">
                    Friend&apos;s Email Address
                  </label>
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-muted-foreground)] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
