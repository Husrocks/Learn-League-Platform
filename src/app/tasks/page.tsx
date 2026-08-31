"use client";

import { useState } from "react";
import { useStore, type Task } from "@/store/useStore";
import { CheckCircle2, Circle, CheckSquare, Clock, ChevronDown, ChevronUp } from "lucide-react";

function TaskItem({ task, onComplete }: { task: Task; onComplete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex items-start gap-4 p-5 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors group">
      <button 
        onClick={() => onComplete(task.id)}
        className="mt-0.5 shrink-0 focus:outline-none"
        title="Complete task"
      >
        <Circle className="w-6 h-6 text-[var(--color-muted)] hover:text-[var(--color-success)] transition-colors" />
      </button>
      
      <div 
        className="flex-1 cursor-pointer min-w-0"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start gap-4">
          <h3 className={`text-lg font-medium text-white whitespace-pre-wrap ${expanded ? '' : 'line-clamp-1'}`}>
            {task.title}
          </h3>
          <button className="text-[var(--color-muted)] hover:text-white shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
          Assigned: {new Date(task.date_assigned).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function CompletedTaskItem({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors" onClick={() => setExpanded(!expanded)}>
      <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <h3 className={`text-base text-[var(--color-muted-foreground)] line-through whitespace-pre-wrap ${expanded ? '' : 'line-clamp-1'}`}>
            {task.title}
          </h3>
          <button className="text-[var(--color-muted)] hover:text-white shrink-0 mt-1 opacity-50">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        {task.status === "reviewed" && (
          <span className="inline-block mt-2 text-xs font-medium bg-[var(--color-success)]/10 text-[var(--color-success)] px-2 py-1 rounded-sm">
            Reviewed by Admin
          </span>
        )}
      </div>
    </div>
  );
}

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
                <TaskItem key={task.id} task={task} onComplete={completeTask} />
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
                <CompletedTaskItem key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}
        
      </div>
    </div>
  );
}
