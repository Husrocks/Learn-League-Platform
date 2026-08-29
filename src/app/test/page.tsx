"use client";

import { useState, useEffect } from "react";
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Tag, 
  Award, 
  Clock, 
  ChevronRight, 
  HelpCircle,
  Zap,
  BookOpen
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { generateInterviewQuestion, evaluateMCQAnswer, MCQQuestion, QuizResponse } from "@/lib/api";

export default function WeeklyTestPage() {
  const { currentUser } = useStore();
  const USER_ID = currentUser?.id || 1;

  const [quizState, setQuizState] = useState<"idle" | "loading" | "active" | "completed">("idle");
  const [assignedTopics, setAssignedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string | null>(null);
  
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userReasoning, setUserReasoning] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    is_correct: boolean;
    score: number;
    xp_earned: number;
    feedback: string;
    explanation: string;
  } | null>(null);

  const [answersSummary, setAnswersSummary] = useState<{
    question: MCQQuestion;
    selected: string;
    isCorrect: boolean;
    xp: number;
  }[]>([]);

  // Fetch initial assigned topics
  useEffect(() => {
    const loadAssignedTopics = async () => {
      try {
        const data = await generateInterviewQuestion(USER_ID, undefined, 1);
        if (data.assigned_topics && data.assigned_topics.length > 0) {
          setAssignedTopics(data.assigned_topics);
        }
      } catch (err) {
        // Fallback default topics
        setAssignedTopics([
          "Read Attention Is All You Need paper",
          "Implement FastAPI middleware rate limiter",
          "Review Rust concurrency patterns"
        ]);
      }
    };
    loadAssignedTopics();
  }, [USER_ID]);

  const handleStartQuiz = async (topicToTest?: string) => {
    setQuizState("loading");
    setEvaluation(null);
    setSelectedOption(null);
    setUserReasoning("");
    setCurrentIndex(0);
    setAnswersSummary([]);

    try {
      const activeTopic = topicToTest || customTopic || selectedTopicFilter || undefined;
      const data: QuizResponse = await generateInterviewQuestion(USER_ID, activeTopic, 3);
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        if (data.assigned_topics) {
          setAssignedTopics(data.assigned_topics);
        }
        setQuizState("active");
      } else {
        throw new Error("No questions returned");
      }
    } catch (error) {
      console.error("Failed to generate test:", error);
      setQuizState("idle");
      alert("Could not generate questions right now. Please verify the backend is running and try again.");
    }
  };

  const currentQ = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentQ || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateMCQAnswer(USER_ID, {
        question_id: currentQ.id,
        topic: currentQ.topic,
        question: currentQ.question,
        selected_option: selectedOption,
        correct_option: currentQ.correct_option,
        explanation: currentQ.explanation,
        user_reasoning: userReasoning,
      });

      setEvaluation(result);
      setAnswersSummary(prev => [
        ...prev,
        {
          question: currentQ,
          selected: selectedOption,
          isCorrect: result.is_correct,
          xp: result.xp_earned,
        }
      ]);
    } catch (err) {
      console.error("Evaluation error:", err);
      // Local fallback evaluation
      const isCorrect = selectedOption.toUpperCase() === currentQ.correct_option.toUpperCase();
      setEvaluation({
        is_correct: isCorrect,
        score: isCorrect ? 100 : 30,
        xp_earned: isCorrect ? 25 : 5,
        feedback: isCorrect ? "🎉 Great job! Correct option selected." : `❌ Incorrect. Correct answer: ${currentQ.correct_option}`,
        explanation: currentQ.explanation
      });
      setAnswersSummary(prev => [
        ...prev,
        {
          question: currentQ,
          selected: selectedOption,
          isCorrect,
          xp: isCorrect ? 25 : 5,
        }
      ]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setUserReasoning("");
      setEvaluation(null);
    } else {
      setQuizState("completed");
    }
  };

  const totalXpGained = answersSummary.reduce((acc, a) => acc + a.xp, 0);
  const correctCount = answersSummary.filter(a => a.isCorrect).length;

  // 1. IDLE / PRE-TEST SCREEN
  if (quizState === "idle" || quizState === "loading") {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Header Banner */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                <Brain className="w-7 h-7 text-[var(--color-accent)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Knowledge Evaluation</h1>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                  On-demand scenario challenges dynamically generated from topics assigned by your admin.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Groq 120B Model</span>
            </div>
          </div>

          {/* Admin Assigned Topics Section */}
          <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Tag className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Admin-Assigned Learning Topics</span>
              </div>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                Click any topic to focus your test
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {assignedTopics.map((topic, i) => {
                const isSelected = selectedTopicFilter === topic;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedTopicFilter(isSelected ? null : topic)}
                    className={`text-xs px-3.5 py-2 rounded-lg border transition-all flex items-center gap-2 text-left ${
                      isSelected
                        ? "bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-white font-medium shadow-sm"
                        : "bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-border-hover)] hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Topic Generator On-Demand */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">
              Or Test a Specific Concept On-Demand
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. LLM Attention Mechanisms, FastAPI Middleware, Docker Compose..."
                className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-neutral-600"
              />
              {customTopic && (
                <button
                  onClick={() => setCustomTopic("")}
                  className="px-3 py-2 text-xs text-[var(--color-muted-foreground)] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] mb-1">
                <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Format</span>
              </div>
              <span className="text-sm font-semibold text-white">3 Scenario Questions</span>
            </div>
            <div className="p-3.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Options</span>
              </div>
              <span className="text-sm font-semibold text-white">4 Choices + Rationale</span>
            </div>
            <div className="p-3.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] mb-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Rewards</span>
              </div>
              <span className="text-sm font-semibold text-white">Up to +100 XP</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => handleStartQuiz()}
              disabled={quizState === "loading"}
              className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {quizState === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Groq AI Generating Questions On-Demand...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-black fill-current" />
                  <span>
                    {selectedTopicFilter 
                      ? `Generate Test on: "${selectedTopicFilter}"`
                      : customTopic
                      ? `Generate Test on: "${customTopic}"`
                      : "Generate AI Test from Assigned Topics"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. ACTIVE QUIZ QUESTION VIEW
  if (quizState === "active" && currentQ) {
    const isAnswerSubmitted = evaluation !== null;

    return (
      <div className="max-w-3xl mx-auto py-6 space-y-6 animate-in fade-in duration-300">
        
        {/* Top Progress & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[var(--color-accent)]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <h2 className="text-sm font-medium text-white truncate max-w-md">{currentQ.topic}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-8 bg-[var(--color-accent)]"
                    : idx < currentIndex
                    ? "w-4 bg-emerald-500"
                    : "w-4 bg-[var(--color-border)]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-7 space-y-6">
          
          {/* Topic Pill */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-accent)] flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              {currentQ.topic}
            </span>
          </div>

          {/* Question Text */}
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed whitespace-pre-wrap">
            {currentQ.question}
          </p>

          {/* Options Grid */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Select the best engineering approach:
            </label>
            
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOption = isAnswerSubmitted && opt.id === currentQ.correct_option;
              const isWrongSelected = isAnswerSubmitted && isSelected && !evaluation.is_correct;

              let cardStyles = "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-border-hover)] text-[var(--color-foreground)]";
              
              if (isSelected && !isAnswerSubmitted) {
                cardStyles = "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-white shadow-sm ring-1 ring-[var(--color-accent)]";
              } else if (isCorrectOption) {
                cardStyles = "border-emerald-500 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500";
              } else if (isWrongSelected) {
                cardStyles = "border-rose-500 bg-rose-950/30 text-rose-200 ring-1 ring-rose-500";
              }

              return (
                <button
                  key={opt.id}
                  disabled={isAnswerSubmitted || isEvaluating}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${cardStyles} disabled:cursor-default`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isCorrectOption
                      ? "bg-emerald-500 text-black"
                      : isWrongSelected
                      ? "bg-rose-500 text-white"
                      : isSelected
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]"
                  }`}>
                    {opt.id}
                  </div>
                  <div className="flex-1 text-sm leading-relaxed pt-0.5">
                    {opt.text}
                  </div>
                  {isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isWrongSelected && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Optional Rationale Input (if not yet submitted) */}
          {!isAnswerSubmitted && (
            <div className="pt-3 space-y-2 border-t border-[var(--color-border)]">
              <label className="block text-xs font-medium text-[var(--color-muted-foreground)] flex items-center justify-between">
                <span>Technical Rationale (Optional — earn bonus XP)</span>
                <span className="text-[10px] text-amber-400/85">+10 XP Bonus</span>
              </label>
              <textarea
                value={userReasoning}
                onChange={(e) => setUserReasoning(e.target.value)}
                placeholder="Explain why this option is superior or mention edge cases/trade-offs..."
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none h-18"
              />
            </div>
          )}

          {/* AI Feedback & Explanation Section (after submission) */}
          {isAnswerSubmitted && evaluation && (
            <div className={`p-5 rounded-xl border space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              evaluation.is_correct 
                ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-100" 
                : "bg-rose-950/20 border-rose-800/40 text-rose-100"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {evaluation.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className="font-semibold text-sm text-white">
                    {evaluation.is_correct ? "Correct Answer!" : "Incorrect"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium bg-black/40 px-2.5 py-1 rounded-md border border-white/10 text-amber-300">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>+{evaluation.xp_earned} XP Earned</span>
                </div>
              </div>

              <div className="text-xs leading-relaxed text-neutral-300 whitespace-pre-wrap pt-1">
                {evaluation.feedback}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
            <div className="text-xs text-[var(--color-muted-foreground)]">
              {!isAnswerSubmitted ? (
                <span>Pick an option above to submit</span>
              ) : (
                <span>Question {currentIndex + 1} completed</span>
              )}
            </div>

            {!isAnswerSubmitted ? (
              <button
                disabled={!selectedOption || isEvaluating}
                onClick={handleSubmitAnswer}
                className="bg-white hover:bg-neutral-200 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Choice</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 shadow"
              >
                <span>{currentIndex + 1 < questions.length ? "Next Question" : "View Final Results"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    );
  }

  // 3. QUIZ COMPLETION SCREEN
  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-10 text-center space-y-8">
        
        {/* Trophy / Result Icon */}
        <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto shadow-inner">
          <Award className="w-10 h-10 text-amber-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Test Completed!</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
            You successfully tackled the AI challenge based on your admin-assigned curriculum.
          </p>
        </div>

        {/* Score Summary Cards */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-center">
            <span className="block text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Accuracy</span>
            <span className="text-2xl font-bold text-white">{correctCount} / {questions.length}</span>
            <span className="block text-[11px] text-emerald-400 mt-1">{Math.round((correctCount / (questions.length || 1)) * 100)}% Correct</span>
          </div>

          <div className="p-5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-center">
            <span className="block text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">XP Rewarded</span>
            <span className="text-2xl font-bold text-amber-400">+{totalXpGained} XP</span>
            <span className="block text-[11px] text-[var(--color-muted-foreground)] mt-1">Added to profile</span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-2 text-left max-w-md mx-auto">
          <h3 className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
            Questions Breakdown
          </h3>
          <div className="space-y-2">
            {answersSummary.map((ans, idx) => (
              <div
                key={idx}
                className="p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate max-w-[280px]">
                  {ans.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="text-white truncate font-medium">{ans.question.topic}</span>
                </div>
                <span className={`font-semibold ${ans.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                  +{ans.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <button
            onClick={() => handleStartQuiz()}
            className="flex-1 bg-white hover:bg-neutral-200 text-black font-semibold py-3 px-6 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Generate New Test</span>
          </button>
          
          <button
            onClick={() => setQuizState("idle")}
            className="flex-1 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-white font-medium py-3 px-6 rounded-lg text-sm border border-[var(--color-border)] transition-colors"
          >
            <span>Change Topics</span>
          </button>
        </div>

      </div>
    </div>
  );
}
