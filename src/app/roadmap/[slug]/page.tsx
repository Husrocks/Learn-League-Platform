"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Clock,
  Calendar,
  Layers,
  Check,
  Zap,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getRoadmapDetail, createRoadmapPlan, RoadmapDetail, TopicItem } from "@/lib/api";

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [roadmap, setRoadmap] = useState<RoadmapDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Setup Wizard State
  const [timeHorizon, setTimeHorizon] = useState<string>("3m");
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [pacing, setPacing] = useState<string>("steady");
  const [selectedFocusTopics, setSelectedFocusTopics] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function loadRoadmap() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getRoadmapDetail(slug);
        setRoadmap(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load roadmap";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadmap();
  }, [slug]);

  const toggleFocusTopic = (topicSlug: string) => {
    setSelectedFocusTopics((prev) =>
      prev.includes(topicSlug)
        ? prev.filter((s) => s !== topicSlug)
        : [...prev, topicSlug]
    );
  };

  const handleGeneratePlan = async () => {
    if (!roadmap) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      await createRoadmapPlan({
        roadmap_id: roadmap.id,
        time_horizon: timeHorizon,
        weekly_hours: weeklyHours,
        pacing: pacing,
        focus_topics: selectedFocusTopics.length > 0 ? selectedFocusTopics : undefined,
      });
      // Redirect to the newly active plan view
      router.push("/roadmap/plan");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate study plan";
      setGenerationError(msg);
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading roadmap details...</p>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Roadmap Not Found</h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">{error || "Could not retrieve roadmap details."}</p>
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Roadmaps
        </Link>
      </div>
    );
  }

  // Group topics by phase
  const phasesMap: Record<number, TopicItem[]> = {};
  roadmap.topics.forEach((t) => {
    const p = t.phase || 1;
    if (!phasesMap[p]) phasesMap[p] = [];
    phasesMap[p].push(t);
  });
  const phaseNumbers = Object.keys(phasesMap).map(Number).sort((a, b) => a - b);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Navigation Back link */}
      <div>
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to catalogue
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
            {roadmap.category || "Role"}
          </span>
          {roadmap.source_url && (
            <a
              href={roadmap.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-muted-foreground)] hover:text-white inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)]"
            >
              View on roadmap.sh <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {roadmap.title}
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] max-w-3xl leading-relaxed">
          {roadmap.description}
        </p>

        <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-[var(--color-muted-foreground)] border-t border-[var(--color-border)]/60">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            {roadmap.topics.length} Structured Topics
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            ~{roadmap.topics.reduce((acc, t) => acc + (t.estimated_hours || 4), 0)} Total Hours Content
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            Personalized AI Week-by-Week Scheduling
          </span>
        </div>
      </div>

      {/* Main Grid: Left Curriculum, Right Setup Wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Curriculum Progression */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Curriculum Progression
            </h2>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {phaseNumbers.length} Learning Phases
            </span>
          </div>

          <div className="space-y-6">
            {phaseNumbers.map((phaseNum) => (
              <div
                key={phaseNum}
                className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">
                      {phaseNum}
                    </span>
                    Phase {phaseNum}: {phaseNum === 1 ? "Foundations" : phaseNum === 2 ? "Core Technologies" : phaseNum === 3 ? "Frameworks & Ecosystem" : "Advanced & Production"}
                  </h3>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {phasesMap[phaseNum].length} topics
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {phasesMap[phaseNum].map((topic) => {
                    const isSelected = selectedFocusTopics.includes(topic.slug);
                    return (
                      <div
                        key={topic.slug}
                        onClick={() => toggleFocusTopic(topic.slug)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "bg-blue-950/40 border-blue-500/60 shadow-sm"
                            : "bg-[var(--color-surface-hover)]/60 border-[var(--color-border)] hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${isSelected ? "text-blue-300" : "text-white"}`}>
                            {topic.title}
                          </span>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-blue-600 border-blue-500 text-white"
                                : "border-slate-600 bg-slate-800/80"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[var(--color-muted-foreground)]">
                          <span>~{topic.estimated_hours}h</span>
                          {topic.prerequisites && topic.prerequisites.length > 0 && (
                            <span className="truncate max-w-[120px]" title={topic.prerequisites.join(", ")}>
                              Requires: {topic.prerequisites[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Plan Setup Wizard */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-2xl bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-hover)] border border-[var(--color-border)] p-6 space-y-6 shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                <Sparkles className="w-4 h-4" />
                Step 2: Plan Generation Wizard
              </div>
              <h2 className="text-lg font-bold text-white">
                Customize Your Study Plan
              </h2>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Our AI agent schedules realistic weekly milestones aligned with your goals.
              </p>
            </div>

            {/* Time Horizon Option */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Target Time Horizon
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "3m", label: "3 Months", sub: "12 Weeks" },
                  { id: "6m", label: "6 Months", sub: "24 Weeks" },
                  { id: "12m", label: "12 Months", sub: "48 Weeks" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeHorizon(item.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      timeHorizon === item.id
                        ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-md"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Hours Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Weekly Commitment
                </label>
                <span className="text-xs font-bold text-blue-400">
                  {weeklyHours} hrs / week
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={35}
                step={1}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--color-muted-foreground)]">
                <span>Light (4h)</span>
                <span>Recommended (10h)</span>
                <span>Intensive (35h)</span>
              </div>
            </div>

            {/* Pacing Preference */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Pacing Strategy
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: "steady", label: "Steady", desc: "Even pace" },
                  { id: "front-loaded", label: "Front-loaded", desc: "Fast start" },
                  { id: "back-loaded", label: "Back-loaded", desc: "Gradual" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPacing(p.id)}
                    className={`py-2 px-2 rounded-lg border text-center transition-all ${
                      pacing === p.id
                        ? "bg-blue-600/20 border-blue-500 text-blue-300"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold text-xs">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Focus Topics Indicator */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Priority Focus Topics:</span>
                <span className="text-blue-400 font-semibold">
                  {selectedFocusTopics.length} selected
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">
                Click any topic card in the curriculum to mark it as high-priority.
              </p>
            </div>

            {/* Error display */}
            {generationError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Plan with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Study Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
