"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [hours, setHours] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)] p-6">
      <div className="w-full max-w-md space-y-12">
        
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
            />
          ))}
        </div>

        <form onSubmit={handleNext}>
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-2xl font-medium tracking-tight mb-2">What are you learning?</h1>
                <p className="text-[var(--color-muted-foreground)]">Select your primary focus for the next 30 days.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {['Frontend Development', 'Backend Development', 'Python', 'AI/ML', 'Data Science', 'Blockchain'].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setGoal(topic)}
                    className={`p-4 text-left border rounded-md transition-colors ${
                      goal === topic 
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-white' 
                        : 'border-[var(--color-border)] hover:border-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-medium">{topic}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-2xl font-medium tracking-tight mb-2">Set your commitment.</h1>
                <p className="text-[var(--color-muted-foreground)]">How many hours per day can you dedicate?</p>
              </div>
              
              <div className="space-y-3">
                {['1 hour', '2 hours', '3 hours', '4+ hours'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`w-full p-4 flex justify-between items-center border rounded-md transition-colors ${
                      hours === h 
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-white' 
                        : 'border-[var(--color-border)] hover:border-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-white'
                    }`}
                  >
                    <span className="font-medium">{h}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center mb-2">
                  <Trophy className="w-8 h-8 text-[var(--color-accent)]" />
                </div>
                <h1 className="text-3xl font-medium tracking-tight">You're ready.</h1>
                <p className="text-[var(--color-muted-foreground)] max-w-sm">
                  Your goal is set. Commit to {hours} of {goal} every day. The leaderboard is waiting.
                </p>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-end">
            <button 
              type="submit"
              disabled={step === 1 && !goal || step === 2 && !hours}
              className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 3 ? 'Go to Dashboard' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
