"use client";

import { useStore } from "@/store/useStore";
import { CheckCircle2, Circle, CheckSquare, Clock } from "lucide-react";

export default function DailyTasksPage() {
  const { currentUser, completeTask } = useStore();

  if (!currentUser) return null;

  const tasks = currentUser.tasks || [];
  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed" || t.status === "reviewed");

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      
      <header className="space-y-4 border-b border-[var(--color-border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-[var(--color-accent)]/20 flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Daily Tasks</h1>
            <p className="text-[var(--color-muted-foreground)] mt-1">
              Complete your assigned tasks to maintain your streak.
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-10">
        
        {/* Pending Tasks */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" /> Action Required
          </h2>
          
          {pendingTasks.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
              <p className="text-[var(--color-muted-foreground)]">No pending tasks for today. Great job!</p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
              {pendingTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => completeTask(task.id)}
                  className="flex items-start gap-4 p-5 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer group"
                >
                  <Circle className="w-6 h-6 text-[var(--color-muted)] group-hover:text-white transition-colors shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-white">{task.title}</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                      Assigned: {new Date(task.date_assigned).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Completed
            </h2>
            
            <div className="space-y-3 opacity-60">
              {completedTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                >
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base text-[var(--color-muted-foreground)] line-through">{task.title}</h3>
                    {task.status === "reviewed" && (
                      <span className="inline-block mt-2 text-xs font-medium bg-[var(--color-success)]/10 text-[var(--color-success)] px-2 py-1 rounded-sm">
                        Reviewed by Admin
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
      </div>
    </div>
  );
}
