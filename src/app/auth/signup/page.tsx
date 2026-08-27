import Link from "next/link";
import { Trophy } from "lucide-react";

export default function SignupPage() {
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
        <form className="space-y-5" action="/onboarding">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input 
                id="name" 
                type="text" 
                placeholder="Jimmy"
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
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-white text-black font-medium py-2.5 rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            Create account
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
