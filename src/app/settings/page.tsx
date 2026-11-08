"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Settings, Shield, ArrowRight } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { 
    currentUser, 
    logout,
    setCurrentUser
  } = useStore();

  const [name, setName] = useState(currentUser?.name || "");
  const [learningGoal, setLearningGoal] = useState(currentUser?.learning_goal || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  if (!currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      const { updateProfile } = await import("@/lib/api");
      const updatedUser = await updateProfile({ name, learning_goal: learningGoal });
      setCurrentUser(updatedUser);
      setSaveMessage("Profile saved successfully.");
    } catch (err: unknown) {
      setSaveMessage((err as Error).message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
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

      {currentUser.role === "admin" && (
        <div className="p-4 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[var(--color-accent)] shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Administrator Privileges</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                User management, task assignment, task review, and daily logs are now consolidated in the dedicated Admin Dashboard.
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-semibold text-white transition-colors px-3.5 py-2 rounded-md bg-[var(--color-accent)] hover:opacity-90 shrink-0"
          >
            Admin Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

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
              router.push("/auth/login");
            }}
            className="text-red-500 font-medium text-sm hover:underline"
          >
            Log out
          </button>
        </div>
      </div>

    </div>
  );
}
