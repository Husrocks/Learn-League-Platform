"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, User } from "@/store/useStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 3) {
      setError("Password must be at least 3 characters");
      return;
    }

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)] p-6">
      <div className="w-full max-w-sm space-y-10">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-12 h-12 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-medium tracking-tight mb-2">Welcome back.</h1>
            <p className="text-[var(--color-muted-foreground)] text-sm">
              Continue your learning journey.
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com (admin@learnleague.com for Admin)"
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                  Password
                </label>
                <Link href="#" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
                  Forgot?
                </Link>
              </div>
              <input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-white text-black font-medium py-2.5 rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            Sign in
          </button>
        </form>

        <div className="text-center text-sm text-[var(--color-muted-foreground)]">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-white hover:underline decoration-[var(--color-border)] underline-offset-4">
            Create one
          </Link>
        </div>

      </div>
    </div>
  );
}
