"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Clock, Tag } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function LearningLogPage() {
  const router = useRouter();
  const { currentUser, logDailyLearning } = useStore();
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
  const [reflection, setReflection] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [topics, setTopics] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);

  const pendingTasks = currentUser?.tasks?.filter(t => t.status === "pending") || [];

  const toggleTask = (id: number) => {
    setCompletedTaskIds(prev => 
      prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!currentUser || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setRefreshWarning(null);

    const parsedHours = Math.max(0, parseFloat(hours) || 0);
    const parsedMinutes = Math.max(0, parseFloat(minutes) || 0);
    const totalHours = parsedHours + (parsedMinutes / 60);

    if (totalHours <= 0) {
      setSubmitError("Please enter valid study hours or minutes.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await logDailyLearning(totalHours, topics, reflection, completedTaskIds);
      if (res?.success) {
        if (res.warning) {
          setRefreshWarning(res.warning);
        }
        setSuccess(true);
      } else {
        setSubmitError("Failed to submit learning log. Please try again.");
      }
    } catch (e) {
      setSubmitError((e as Error).message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12 text-center pt-20">
        <div className="w-20 h-20 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-[var(--color-success)]" />
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-white">Day {currentUser?.streak} Logged!</h1>
        <p className="text-[var(--color-muted-foreground)]">Your XP and streak have been updated.</p>
        
        {refreshWarning && (
          <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm max-w-lg mx-auto">
            {refreshWarning}
          </div>
        )}

        <button 
          onClick={() => router.push("/")}
          className="bg-white text-black text-sm font-medium px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      
      <header className="space-y-2 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-medium tracking-tight text-white">Log Today&apos;s Learning</h1>
        <p className="text-[var(--color-muted-foreground)]">
          Record your progress for Day {currentUser?.streak}. This defines your weekly score.
        </p>
      </header>

      <div className="space-y-10">
        
        {/* Time & Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              <Clock className="w-4 h-4" /> Study Time
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent border-b border-[var(--color-border)] px-2 py-2 text-2xl font-medium text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder-[var(--color-muted)]"
                />
                <span className="absolute right-2 bottom-3 text-sm text-[var(--color-muted-foreground)]">h</span>
              </div>
              <div className="relative flex-1">
                <input 
                  type="number" 
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="00"
                  className="w-full bg-transparent border-b border-[var(--color-border)] px-2 py-2 text-2xl font-medium text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder-[var(--color-muted)]"
                />
                <span className="absolute right-2 bottom-3 text-sm text-[var(--color-muted-foreground)]">m</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              <Tag className="w-4 h-4" /> Topics
            </label>
            <input 
              type="text" 
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. React hooks, SQL joins"
              className="w-full bg-transparent border-b border-[var(--color-border)] px-2 py-3 text-lg font-medium text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder-[var(--color-muted)] mt-1"
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
            Tasks Completed
          </label>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 space-y-1">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => {
                const isDone = completedTaskIds.includes(task.id);
                return (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-3 p-3 rounded-md cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors group"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--color-muted)] group-hover:text-white transition-colors shrink-0 mt-0.5" />
                    )}
                    <span className={`text-base ${isDone ? 'text-[var(--color-muted-foreground)] line-through' : 'text-white'}`}>
                      {task.title}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-sm text-[var(--color-muted-foreground)] text-center">
                No pending tasks to complete.
              </div>
            )}
          </div>
        </div>

        {/* Reflection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
            Daily Reflection
          </label>
          <textarea 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Today I finally understood... Still confused about..."
            className="w-full h-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 text-base text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder-[var(--color-muted)] resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-6 space-y-3">
          {submitError && (
            <div className="px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {submitError}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !currentUser}
            className="w-full bg-white text-black text-lg font-medium py-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Logging..." : `Complete Day ${currentUser?.streak}`}
          </button>
        </div>

      </div>
    </div>
  );
}
