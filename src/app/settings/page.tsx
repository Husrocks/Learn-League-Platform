"use client";

import { useState } from "react";
import { useStore, User, Friend, Task } from "@/store/useStore";
import { Settings, Shield, Plus, UserMinus, CheckCircle2, Clock, CheckSquare, ChevronDown, ChevronUp, XCircle } from "lucide-react";

function ReviewTaskItem({ task, userId }: { task: Task, userId: number }) {
  const [expanded, setExpanded] = useState(false);
  const { reviewTask, rejectTask } = useStore();

  return (
    <div className="flex flex-col gap-3 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md">
      <div 
        className="flex-1 cursor-pointer min-w-0 flex justify-between items-start gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <p className={`text-sm text-white whitespace-pre-wrap ${expanded ? '' : 'line-clamp-1'}`}>{task.title}</p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Assigned by {task.assigned_by || 'System'}</p>
        </div>
        <button className="text-[var(--color-muted)] hover:text-white shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="flex items-center gap-2 justify-end mt-1 pt-2 border-t border-[var(--color-border)]">
        <button 
          onClick={(e) => { e.stopPropagation(); rejectTask(userId, task.id); }}
          className="flex justify-center items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium rounded-sm transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" /> Reject
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); reviewTask(userId, task.id); }}
          className="flex justify-center items-center gap-1 px-3 py-1.5 bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 text-xs font-medium rounded-sm transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { 
    currentUser, 
    friends, 
    addFriend, 
    removeFriend, 
    assignTask, 
    reviewTask,
    rejectTask,
    logout,
    setCurrentUser
  } = useStore();

  const [activeTab, setActiveTab] = useState<"profile" | "admin">("profile");
  
  // Profile form states
  const [name, setName] = useState(currentUser?.name || "");
  const [learningGoal, setLearningGoal] = useState(currentUser?.learning_goal || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Admin form states
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  if (!currentUser) return null;

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendEmail.trim()) return;
    
    try {
      await addFriend(newFriendEmail);
      setNewFriendName("");
      setNewFriendEmail("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newTaskTitle.trim()) return;
    
    try {
      await assignTask(Number(selectedUserId), newTaskTitle);
      setNewTaskTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      const { updateProfile } = await import("@/lib/api");
      const updatedUser = await updateProfile({ name, learning_goal: learningGoal });
      setCurrentUser(updatedUser);
      setSaveMessage("Profile saved successfully.");
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const allUsers = [currentUser, ...friends];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      
      <header className="space-y-4 border-b border-[var(--color-border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-[var(--color-accent)]/20 flex items-center justify-center">
            <Settings className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Settings</h1>
            <p className="text-[var(--color-muted-foreground)] mt-1">
              Manage your preferences and account settings.
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[var(--color-border)]">
        <button 
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "profile" 
              ? "border-[var(--color-accent)] text-white" 
              : "border-transparent text-[var(--color-muted-foreground)] hover:text-white"
          }`}
        >
          Profile
        </button>
        {currentUser.role === "admin" && (
          <button 
            onClick={() => setActiveTab("admin")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "admin" 
                ? "border-[var(--color-accent)] text-white" 
                : "border-transparent text-[var(--color-muted-foreground)] hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" /> Admin Panel
          </button>
        )}
      </div>

      <div className="pt-4">
        
        {/* Profile Settings */}
        {activeTab === "profile" && (
          <div className="space-y-8 max-w-xl">
            {saveMessage && (
              <div className={`p-3 rounded-md text-sm border ${saveMessage.includes("success") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                {saveMessage}
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" 
                  defaultValue={currentUser.email || ""}
                  disabled
                  className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-muted-foreground)] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">Learning Goal</label>
                <input 
                  type="text" 
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] text-white"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={isSaving}
                className="bg-white text-black font-medium px-6 py-2.5 rounded-md text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
            
            <div className="pt-10 border-t border-[var(--color-border)]">
              <button 
                onClick={() => {
                  logout();
                  window.location.href = "/auth/login";
                }}
                className="text-red-500 font-medium text-sm hover:underline"
              >
                Log out
              </button>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {activeTab === "admin" && currentUser.role === "admin" && (
          <div className="space-y-12">
            
            {/* Manage Friends */}
            <section className="space-y-6">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--color-accent)]" /> 
                User Management
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Friend Form */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
                  <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4">Add User</h3>
                  <form onSubmit={handleAddFriend} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Name"
                      value={newFriendName}
                      onChange={(e) => setNewFriendName(e.target.value)}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-white"
                      required
                    />
                    <input 
                      type="email" 
                      placeholder="Email"
                      value={newFriendEmail}
                      onChange={(e) => setNewFriendEmail(e.target.value)}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-white"
                      required
                    />
                    <button type="submit" className="w-full flex justify-center items-center gap-2 bg-[var(--color-accent)] text-white font-medium py-2 rounded-md text-sm hover:opacity-90">
                      <Plus className="w-4 h-4" /> Add User
                    </button>
                  </form>
                </div>
                
                {/* List Friends */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 overflow-y-auto max-h-[250px]">
                  <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4">Current Network</h3>
                  <div className="space-y-3">
                    {friends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md">
                        <div>
                          <p className="text-sm font-medium text-white">{friend.name}</p>
                          <p className="text-xs text-[var(--color-muted-foreground)]">{friend.email}</p>
                        </div>
                        <button 
                          onClick={() => removeFriend(friend.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Remove user"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Task Management */}
            <section className="space-y-6 pt-6 border-t border-[var(--color-border)]">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[var(--color-accent)]" /> 
                Task Management
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Assign Task Form */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
                  <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4">Assign Task</h3>
                  <form onSubmit={handleAssignTask} className="space-y-4">
                    <select 
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-white"
                      required
                    >
                      <option value="" disabled>Select User</option>
                      {allUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name} {u.id === currentUser.id ? "(You)" : ""}</option>
                      ))}
                    </select>
                    <textarea 
                      placeholder="Task description..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-white resize-none"
                      rows={3}
                      required
                    />
                    <button type="submit" className="w-full bg-white text-black font-medium py-2 rounded-md text-sm hover:bg-gray-200">
                      Assign Task
                    </button>
                  </form>
                </div>

                {/* Review Tasks */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 overflow-y-auto max-h-[400px]">
                  <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4">Review Completed Tasks</h3>
                  <div className="space-y-4">
                    {allUsers.map(user => {
                      const completedTasks = user.tasks?.filter(t => t.status === "completed") || [];
                      if (completedTasks.length === 0) return null;
                      
                      return (
                        <div key={user.id} className="space-y-2">
                          <h4 className="text-xs font-semibold text-white">{user.name}'s Pending Reviews</h4>
                          {completedTasks.map(task => (
                            <ReviewTaskItem key={task.id} task={task} userId={user.id} />
                          ))}
                        </div>
                      );
                    })}
                    
                    {allUsers.every(u => !u.tasks?.some(t => t.status === "completed")) && (
                      <div className="text-center py-6">
                        <Clock className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
                        <p className="text-sm text-[var(--color-muted-foreground)]">No tasks waiting for review.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}
      </div>

    </div>
  );
}
