"use client";

import { useEffect, useState } from "react";
import { useStore, User, Task } from "@/store/useStore";
import { getAdminUsers, getAdminTasks, updateUserRole, reviewTask, rejectTask } from "@/lib/api";
import { 
  Shield, 
  Users, 
  CheckSquare, 
  X, 
  Check, 
  Award, 
  AlertCircle, 
  Plus, 
  BookOpen, 
  UserMinus,
  CheckCircle2,
  Clock
} from "lucide-react";

export type AdminTask = Task & {
  name: string;
  username: string;
};

export default function AdminDashboard() {
  const currentUser = useStore((state) => state.currentUser);
  const assignTaskAction = useStore((state) => state.assignTask);
  const addFriendAction = useStore((state) => state.addFriend);
  const removeFriendAction = useStore((state) => state.removeFriend);

  const [activeTab, setActiveTab] = useState<"tasks" | "users" | "logs">("tasks");
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Assign Task form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Add User form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);

  const loadAdminData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [usersData, tasksData] = await Promise.all([
        getAdminUsers(),
        getAdminTasks(),
      ]);
      setUsers(usersData);
      setTasks(tasksData);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to fetch admin data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role !== "admin") return;
    loadAdminData();
  }, [currentUser?.role]);

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
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSuccessMessage("Task approved successfully (+10 XP awarded).");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to approve task");
    }
  };

  const handleReject = async (taskId: number) => {
    try {
      await rejectTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSuccessMessage("Task rejected.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to reject task");
    }
  };

  const handleRoleToggle = async (userId: number, currentRole: string) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as "admin" | "user" } : u));
      setSuccessMessage(`User role updated to ${newRole}.`);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update role");
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newTaskTitle.trim()) return;
    
    setIsAssigning(true);
    setError("");
    try {
      await assignTaskAction(Number(selectedUserId), newTaskTitle.trim());
      setNewTaskTitle("");
      setSelectedUserId("");
      setSuccessMessage("Task assigned successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
      // Refresh admin data
      await loadAdminData();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to assign task");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    setIsAddingUser(true);
    setError("");
    try {
      await addFriendAction(newUserEmail.trim());
      setNewUserName("");
      setNewUserEmail("");
      setSuccessMessage("User added to network successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
      await loadAdminData();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to add user");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this user from your network?")) return;
    try {
      await removeFriendAction(userId);
      setSuccessMessage("User removed from network.");
      setTimeout(() => setSuccessMessage(""), 4000);
      await loadAdminData();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to remove user");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <header className="space-y-4 border-b border-[var(--color-border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-[var(--color-accent)]/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-[var(--color-muted-foreground)] mt-1">
              Manage platform users, assign tasks, review completed submissions, and inspect daily logs.
            </p>
          </div>
        </div>
      </header>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] gap-2">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "tasks"
              ? "border-[var(--color-accent)] text-white"
              : "border-transparent text-[var(--color-muted-foreground)] hover:text-white"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Task Management
          {tasks.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-[var(--color-accent)] text-white font-semibold">
              {tasks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "users"
              ? "border-[var(--color-accent)] text-white"
              : "border-transparent text-[var(--color-muted-foreground)] hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "logs"
              ? "border-[var(--color-accent)] text-white"
              : "border-transparent text-[var(--color-muted-foreground)] hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Daily Logs Review
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-[var(--color-muted-foreground)] py-12">Loading admin data...</div>
      ) : (
        <div className="mt-6 space-y-8">
          
          {/* TASKS TAB: Assign Task + Review Queue */}
          {activeTab === "tasks" && (
            <div className="space-y-8">
              
              {/* Assign Task Section */}
              <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[var(--color-accent)]" /> Assign Task to User
                </h3>
                <form onSubmit={handleAssignTask} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Target User</label>
                    <select 
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      required
                    >
                      <option value="" disabled>Select User</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} (@{u.username}) {u.id === currentUser.id ? "(You)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Task Title / Description</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="e.g. Implement rate limiting middleware in FastAPI"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                        required
                      />
                      <button 
                        type="submit" 
                        disabled={isAssigning}
                        className="bg-white text-black font-medium px-5 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {isAssigning ? "Assigning..." : "Assign Task"}
                      </button>
                    </div>
                  </div>
                </form>
              </section>

              {/* Review Queue Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-accent)]" /> Completed Tasks Review Queue
                  </h3>
                  <span className="text-xs text-[var(--color-muted-foreground)]">{tasks.length} pending review</span>
                </div>

                {tasks.length === 0 ? (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
                    <CheckSquare className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
                    <p className="text-[var(--color-muted-foreground)]">No tasks waiting for review. The queue is clear!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-[var(--color-accent)] transition-colors">
                        <div className="space-y-1">
                          <h4 className="font-medium text-white">{task.title}</h4>
                          <p className="text-sm text-[var(--color-muted-foreground)] flex items-center gap-2 flex-wrap">
                            <span>By: <span className="text-white">{task.name}</span> (@{task.username})</span>
                            <span>&bull;</span>
                            <span>Assigned by: {task.assigned_by || "System"}</span>
                            <span>&bull;</span>
                            <span>Date: {new Date(task.date_assigned).toLocaleDateString()}</span>
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
              </section>

            </div>
          )}

          {/* USERS TAB: Add User + Platform Users Table */}
          {activeTab === "users" && (
            <div className="space-y-8">
              
              {/* Add User Section */}
              <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[var(--color-accent)]" /> Add User to Network
                </h3>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                    required
                  />
                  <input 
                    type="email" 
                    placeholder="Email address"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isAddingUser}
                    className="flex justify-center items-center gap-2 bg-[var(--color-accent)] text-white font-medium py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> {isAddingUser ? "Adding..." : "Add User"}
                  </button>
                </form>
              </section>

              {/* Users Table */}
              <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
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
                            <div className="text-xs text-[var(--color-muted-foreground)]">@{user.username} {user.email && `• ${user.email}`}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-[var(--color-accent)]">{user.total_xp} XP</div>
                            <div className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1">
                              {user.streak} days streak <Award className="w-3 h-3 text-amber-400" />
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
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRoleToggle(user.id, user.role)}
                                disabled={user.id === currentUser.id}
                                className="text-xs font-medium text-[var(--color-muted-foreground)] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded bg-[var(--color-background)] border border-[var(--color-border)] hover:border-[var(--color-accent)]"
                              >
                                {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                              </button>
                              {user.id !== currentUser.id && (
                                <button
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                  title="Remove from network"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>
          )}

          {/* LOGS TAB: Daily Logs Review across all users */}
          {activeTab === "logs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[var(--color-accent)]" /> User Daily Learning Logs
                </h3>
              </div>

              <div className="space-y-6">
                {users.map((user) => {
                  const logs = user.logs || [];
                  if (logs.length === 0) return null;

                  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  return (
                    <div key={user.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                        <div>
                          <h4 className="font-semibold text-white">{user.name}</h4>
                          <p className="text-xs text-[var(--color-muted-foreground)]">@{user.username} &bull; {logs.length} logs submitted</p>
                        </div>
                        <span className="text-xs font-medium text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded border border-[var(--color-accent)]/20">
                          {user.learning_goal || "General Learning"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedLogs.map((log) => (
                          <div key={log.id} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-4 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-[var(--color-accent)]">{new Date(log.date).toLocaleDateString()}</span>
                              <span className="text-[var(--color-muted-foreground)]">{log.hours_studied} hrs studied</span>
                            </div>

                            <div>
                              <p className="text-[10px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Topics</p>
                              <p className="text-sm text-white whitespace-pre-wrap">{log.topics}</p>
                            </div>

                            {log.reflection && (
                              <div>
                                <p className="text-[10px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Reflection</p>
                                <p className="text-xs text-[var(--color-muted)] whitespace-pre-wrap italic">&quot;{log.reflection}&quot;</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {users.every((u) => !u.logs || u.logs.length === 0) && (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
                    <BookOpen className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
                    <p className="text-[var(--color-muted-foreground)]">No daily learning logs submitted yet by platform users.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
