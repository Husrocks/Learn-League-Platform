"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  ExternalLink,
  Archive,
  ArrowLeft,
  Sparkles,
  Trophy,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Check
} from "lucide-react";
import { getMyRoadmapPlan, completeRoadmapTask, archiveRoadmapPlan, UserRoadmapPlan, RoadmapTask } from "@/lib/api";
import { useStore } from "@/store/useStore";

export default function ActiveRoadmapPlanPage() {
  const [plan, setPlan] = useState<UserRoadmapPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "completed">("all");
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const { currentUser, setCurrentUser } = useStore();

  useEffect(() => {
    async function loadPlan() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMyRoadmapPlan();
        setPlan(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load active plan";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlan();
  }, []);

  const handleCompleteTask = async (task: RoadmapTask) => {
    if (task.status === "completed" || completingTaskId === task.id) return;
    setCompletingTaskId(task.id);

    try {
      const updatedTask = await completeRoadmapTask(task.id);

      // Optimistically update local plan state
      if (plan) {
        const updatedTasks = plan.tasks.map((t) => (t.id === task.id ? updatedTask : t));
        const completedCount = updatedTasks.filter((t) => t.status === "completed").length;
        const progressPct = Math.round((completedCount / updatedTasks.length) * 100);

        setPlan({
          ...plan,
          completed_tasks: completedCount,
          progress_percentage: progressPct,
          tasks: updatedTasks,
        });
      }

      // Update current user XP in Zustand store
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          total_xp: (currentUser.total_xp || 0) + (task.xp_value || 15),
          streak: (currentUser.streak || 0) + 1,
        });
      }

      // Show celebratory notification
      setCelebrationMessage(`+${task.xp_value || 15} XP! "${task.title}" completed.`);
      setTimeout(() => setCelebrationMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mark task complete";
      alert(msg);
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleArchivePlan = async () => {
    if (!plan) return;
    const confirmed = window.confirm(
      "Are you sure you want to archive this plan? You can select a new roadmap at any time."
    );
    if (!confirmed) return;

    setIsArchiving(true);
    try {
      await archiveRoadmapPlan(plan.id);
      setPlan(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive plan";
      alert(msg);
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading your active study plan...</p>
      </div>
    );
  }

  // No active plan state
  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] mx-auto shadow-inner">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">No Active Roadmap Plan</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
            You don&apos;t have an active roadmap right now. Choose a path from our catalogue to generate a personalized AI schedule!
          </p>
        </div>
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-semibold shadow-lg transition-all"
        >
          <Compass className="w-4 h-4" />
          Explore Roadmaps Catalogue
        </Link>
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = plan.tasks.filter((t) => {
    if (filterMode === "pending") return t.status === "pending";
    if (filterMode === "completed") return t.status === "completed";
    return true;
  });

  // Group filtered tasks by week_number
  const tasksByWeek: Record<number, RoadmapTask[]> = {};
  filteredTasks.forEach((t) => {
    const w = t.week_number || 1;
    if (!tasksByWeek[w]) tasksByWeek[w] = [];
    tasksByWeek[w].push(t);
  });
  const weekNumbers = Object.keys(tasksByWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Celebration Notification */}
      <AnimatePresence>
        {celebrationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 text-sm font-semibold"
          >
            <Trophy className="w-5 h-5 text-amber-300" />
            <span>{celebrationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to catalogue
        </Link>

        <button
          onClick={handleArchivePlan}
          disabled={isArchiving}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
          title="Archive this plan to start another roadmap"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archive Plan</span>
        </button>
      </div>

      {/* Plan Progress Header Card */}
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Active Study Plan
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {plan.time_horizon.toUpperCase()} &bull; {plan.weekly_hours}h/week &bull; {plan.pacing}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {plan.roadmap_title}
            </h1>
          </div>

          {plan.source_url && (
            <a
              href={plan.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-muted-foreground)] hover:text-white inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] shrink-0"
            >
              Attribution: roadmap.sh <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Progress Bar & Stats */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-white">Overall Plan Completion</span>
            <span className="font-bold text-blue-400">{plan.progress_percentage}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${plan.progress_percentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]">
            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-bold">Tasks Done</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">
                {plan.completed_tasks} / {plan.total_tasks}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-bold">XP Earned</span>
              <span className="text-sm font-semibold text-amber-400 mt-0.5 block">
                +{plan.completed_tasks * 15} XP
              </span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-bold">Start Date</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">
                {plan.start_date}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-bold">Target Finish</span>
              <span className="text-sm font-semibold text-emerald-400 mt-0.5 block">
                {plan.target_end_date}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Filters */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Weekly Learning Milestones</span>
          <span className="text-xs font-normal text-[var(--color-muted-foreground)]">
            ({filteredTasks.length} tasks)
          </span>
        </h2>

        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
          {(["all", "pending", "completed"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1 rounded-md capitalize transition-colors ${
                filterMode === mode
                  ? "bg-[var(--color-surface-hover)] text-white font-semibold"
                  : "text-[var(--color-muted-foreground)] hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Task Groups */}
      <div className="space-y-6">
        {weekNumbers.length === 0 ? (
          <div className="p-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center text-xs text-[var(--color-muted-foreground)]">
            No tasks match the selected filter.
          </div>
        ) : (
          weekNumbers.map((weekNum) => {
            const weekTasks = tasksByWeek[weekNum];
            const allWeekCompleted = weekTasks.every((t) => t.status === "completed");

            return (
              <div
                key={weekNum}
                className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-sm"
              >
                {/* Week Header */}
                <div className="bg-[var(--color-surface-hover)]/40 px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                      W{weekNum}
                    </span>
                    <span className="text-sm font-bold text-white">
                      Week {weekNum} Milestones
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {weekTasks.filter((t) => t.status === "completed").length} / {weekTasks.length} done
                  </span>
                </div>

                {/* Tasks List */}
                <div className="divide-y divide-[var(--color-border)]/60">
                  {weekTasks.map((task) => {
                    const isCompleted = task.status === "completed";
                    const isProcessing = completingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                          isCompleted ? "bg-emerald-950/10 opacity-80" : "hover:bg-[var(--color-surface-hover)]/20"
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1">
                          {/* Completion Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleCompleteTask(task)}
                            disabled={isCompleted || isProcessing}
                            className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center transition-all shrink-0 ${
                              isCompleted
                                ? "bg-emerald-600 text-white cursor-default"
                                : "border border-slate-600 hover:border-blue-400 bg-slate-800/80 cursor-pointer"
                            }`}
                            title={isCompleted ? "Completed" : "Click to mark complete"}
                          >
                            {isProcessing ? (
                              <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            ) : isCompleted ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-transparent hover:text-slate-500" />
                            )}
                          </button>

                          {/* Task Content */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={`text-sm font-semibold ${
                                  isCompleted ? "line-through text-slate-400" : "text-white"
                                }`}
                              >
                                {task.title}
                              </h3>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                                {task.topic_slug}
                              </span>
                            </div>

                            {task.description && (
                              <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center gap-3 pt-1 text-[11px] text-[var(--color-muted-foreground)]">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                Target: {task.due_date}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* XP Badge */}
                        <div className="shrink-0 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            <Trophy className="w-3 h-3" />
                            +{task.xp_value} XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
