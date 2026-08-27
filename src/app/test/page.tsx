"use client";

import { useState, useEffect } from "react";
import { Brain, CornerDownLeft, Circle, CheckCircle2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { generateInterviewQuestion, evaluateAnswer } from "@/lib/api";

export default function WeeklyTestPage() {
  const { currentUser } = useStore();
  const [started, setStarted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([]);

  // We assume user ID 1 for demonstration if the backend is empty, 
  // but let's just pass 1 for the prototype to avoid complex DB setup in UI.
  const USER_ID = 1;

  useEffect(() => {
    if (started && messages.length === 0) {
      const fetchQuestion = async () => {
        setIsLoading(true);
        try {
          const data = await generateInterviewQuestion(USER_ID);
          setCurrentQuestion(data.question);
          setMessages([
            {
              id: Date.now(),
              role: "ai",
              text: `Hello ${currentUser?.name}. Based on your recent study of ${data.topics_covered}, here is your question:\n\n${data.question}`
            }
          ]);
        } catch (e) {
          setMessages([
            { id: Date.now(), role: "ai", text: "Mock Question (Backend unreachable): Explain how React's Virtual DOM works." }
          ]);
          setCurrentQuestion("Explain how React's Virtual DOM works.");
        }
        setIsLoading(false);
      };
      fetchQuestion();
    }
  }, [started, messages.length, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const answer = inputText;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: answer }]);
    setInputText("");
    setIsLoading(true);

    try {
      const evaluation = await evaluateAnswer(USER_ID, currentQuestion, answer);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        text: `${evaluation.feedback}\n\nScore: ${evaluation.score}/100\n\nFollow-up: ${evaluation.follow_up}`
      }]);
      setCurrentQuestion(evaluation.follow_up);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        text: "Mock Feedback: Good answer, but you missed some detail.\n\nScore: 80/100\n\nFollow-up: Can you elaborate on state updates?"
      }]);
      setCurrentQuestion("Can you elaborate on state updates?");
    }
    
    setIsLoading(false);
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center space-y-8">
          
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-[var(--color-accent)]" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-white">Weekly Knowledge Check</h1>
            <p className="text-[var(--color-muted-foreground)] max-w-sm mx-auto">
              An AI interviewer has prepared questions based on the 16 hours of material you studied this week.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
            <div className="p-4 border border-[var(--color-border)] rounded-md">
              <span className="block text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Estimated Time</span>
              <span className="font-medium text-white">25 minutes</span>
            </div>
            <div className="p-4 border border-[var(--color-border)] rounded-md">
              <span className="block text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Difficulty</span>
              <span className="font-medium text-white">Adaptive</span>
            </div>
          </div>
          
          <div className="pt-4">
            <button 
              onClick={() => setStarted(true)}
              className="bg-white text-black font-medium px-8 py-3 rounded-md hover:bg-gray-200 transition-colors"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
      
      <header className="flex justify-between items-center pb-4 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-[var(--color-accent)]" />
          <h1 className="font-medium text-white">Knowledge Interview</h1>
        </div>
        <div className="flex gap-1">
          <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
          <Circle className="w-4 h-4 text-[var(--color-accent)] fill-current" />
          <Circle className="w-4 h-4 text-[var(--color-border)]" />
          <Circle className="w-4 h-4 text-[var(--color-border)]" />
          <Circle className="w-4 h-4 text-[var(--color-border)]" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto py-8 space-y-8 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-5 ${
              msg.role === 'user' 
                ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-white' 
                : 'bg-transparent text-[var(--color-foreground)]'
            }`}>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                  <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">AI Interviewer</span>
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-transparent text-[var(--color-muted-foreground)] p-5 animate-pulse">
              AI is thinking...
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your explanation..."
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 pr-12 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none h-24"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute bottom-4 right-4 p-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-xs text-[var(--color-muted-foreground)]">Press Enter to submit, Shift+Enter for new line</span>
        </div>
      </div>

    </div>
  );
}
