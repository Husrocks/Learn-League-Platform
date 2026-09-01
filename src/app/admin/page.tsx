"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { getAdminUsers, getAdminTasks, updateUserRole, reviewTask, rejectTask } from "@/lib/api";
import { Shield, Users, CheckSquare, X, Check, Award, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const currentUser = useStore((state) => state.currentUser);
  const [activeTab, setActiveTab] = useState<"tasks" | "users">("tasks");
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (activeTab === "users") {
        const data = await getAdminUsers();
        setUsers(data);
      } else {
        const data = await getAdminTasks();
        setTasks(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchData();
    }
  }, [activeTab, currentUser]);

  if (!currentUser) return null;
  
  if (currentUser.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <Shield className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-[var(--color-muted-foreground)]">You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleReview = async (taskId: number) => {
    try {
      await reviewTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      alert(err.message || "Failed to approve task");
    }
  };

  const handleReject = async (taskId: number) => {
    try {
      await rejectTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      alert(err.message || "Failed to reject task");
    }
  };

  const handleRoleToggle = async (userId: number, currentRole: string) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      <header className="space-y-4 border-b border-[var(--color-border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-[var(--color-accent)]/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-[var(--color-muted-foreground)] mt-1">
              Manage platform users and review task submissions.
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "tasks"
              ? "border-[var(--color-accent)] text-white"
              : "border-transparent text-[var(--color-muted-foreground)] hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Task Review Queue
          </div>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-[var(--color-accent)] text-white"
              : "border-transparent text-[var(--color-muted-foreground)] hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </div>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-[var(--color-muted-foreground)] py-12">Loading...</div>
      ) : (
        <div className="mt-6">
          
          {/* TASKS TAB */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
                  <p className="text-[var(--color-muted-foreground)]">No tasks waiting for review. The queue is clear!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-[var(--color-accent)] transition-colors">
                      <div className="space-y-1">
                        <h3 className="font-medium text-white">{task.title}</h3>
                        <p className="text-sm text-[var(--color-muted-foreground)] flex items-center gap-2">
                          <span>By: <span className="text-white">{task.name}</span> (@{task.username})</span>
                          <span>&bull;</span>
                          <span>Assigned: {new Date(task.date_assigned).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleReject(task.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button 
                          onClick={() => handleReview(task.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors border border-green-500/20"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve (+10 XP)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-6 py-4 font-medium text-[var(--color-muted-foreground)]">User</th>
                      <th className="px-6 py-4 font-medium text-[var(--color-muted-foreground)]">XP / Streak</th>
                      <th className="px-6 py-4 font-medium text-[var(--color-muted-foreground)]">Role</th>
                      <th className="px-6 py-4 font-medium text-[var(--color-muted-foreground)] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-[var(--color-muted-foreground)]">@{user.username}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-[var(--color-accent)]">{user.total_xp} XP</div>
                          <div className="text-[var(--color-muted-foreground)] flex items-center gap-1">
                            {user.streak} days <Award className="w-3 h-3" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20' 
                              : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRoleToggle(user.id, user.role)}
                            disabled={user.id === currentUser.id}
                            className="text-xs font-medium text-[var(--color-muted-foreground)] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
