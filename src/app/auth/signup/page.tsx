"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In a real app we would have a username field. 
      // We will generate a username from email for now.
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      await register({ name, username, email, password, learning_goal: "General" });
      
      // Successfully registered! Redirect to login so they can log in
      router.push("/auth/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-medium tracking-tight mb-2">Create an account.</h1>
            <p className="text-[var(--color-muted-foreground)] text-sm">
              Start competing with your friends today.
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSignup}>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input 
                id="name" 
                type="text" 
                placeholder="Jimmy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1 uppercase tracking-wider">
                Password
              </label>
              <input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-medium py-2.5 rounded-md text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="text-center text-sm text-[var(--color-muted-foreground)]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-white hover:underline decoration-[var(--color-border)] underline-offset-4">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
