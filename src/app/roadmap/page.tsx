"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Compass, 
  ExternalLink, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Search,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { getRoadmaps, getMyRoadmapPlan, RoadmapSummary, UserRoadmapPlan } from "@/lib/api";

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);
  const [activePlan, setActivePlan] = useState<UserRoadmapPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [roadmapsData, planData] = await Promise.all([
          getRoadmaps(),
          getMyRoadmapPlan().catch(() => null),
        ]);
        setRoadmaps(roadmapsData);
        setActivePlan(planData);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load roadmaps";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    { id: "all", label: "All Roadmaps" },
    { id: "role", label: "Developer Roles" },
    { id: "skill", label: "Core Skills" },
  ];

  const filteredRoadmaps = roadmaps.filter((r) => {
    const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-surface-hover)] border border-[var(--color-border)] p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Curriculum Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Curated Learning Roadmaps
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] leading-relaxed">
            Select a verified engineering path, configure your available time, and let our AI agent build a personalized, week-by-week study plan with gamified milestones.
          </p>
        </div>

        {/* License & Attribution Notice */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted-foreground)]">
          <span>
            Topic catalogue inspired by{" "}
            <a
              href="https://roadmap.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 font-medium"
            >
              roadmap.sh <ExternalLink className="w-3 h-3" />
            </a>
            . Plans and tasks are generated exclusively for your study goals.
          </span>
          <span className="text-[11px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-400 border border-slate-700/50">
            Licensed for Personal Learning
          </span>
        </div>
      </div>

      {/* Active Plan Callout Banner */}
      {activePlan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-r from-blue-950/40 via-[var(--color-surface)] to-emerald-950/30 border border-blue-500/30 p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active Plan
                </span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {activePlan.time_horizon.toUpperCase()} Track
                </span>
              </div>
              <h2 className="text-lg font-semibold text-white">
                {activePlan.roadmap_title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-[var(--color-muted-foreground)]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {activePlan.completed_tasks} / {activePlan.total_tasks} Tasks Complete
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  {activePlan.progress_percentage}% Done
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <Link
              href="/roadmap/plan"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium shadow transition-colors"
            >
              Continue Plan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-muted-foreground)] hover:text-white border border-[var(--color-border)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search roadmaps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-white placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 animate-pulse space-y-4"
            >
              <div className="h-6 w-24 bg-slate-800 rounded" />
              <div className="h-6 w-48 bg-slate-800 rounded" />
              <div className="h-16 w-full bg-slate-800/60 rounded" />
              <div className="h-10 w-full bg-slate-800 rounded mt-6" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
          <p className="text-sm font-semibold text-red-400">Error loading roadmaps</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">{error}</p>
        </div>
      )}

      {/* Roadmaps Grid */}
      {!isLoading && !error && (
        <>
          {filteredRoadmaps.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 space-y-3">
              <Compass className="w-10 h-10 text-[var(--color-muted-foreground)] mx-auto" />
              <h3 className="text-base font-semibold text-white">No roadmaps found</h3>
              <p className="text-xs text-[var(--color-muted-foreground)] max-w-sm mx-auto">
                No roadmaps match your search query. Try searching for &quot;frontend&quot;, &quot;backend&quot;, or &quot;python&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoadmaps.map((r) => (
                <motion.div
                  key={r.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="space-y-4">
                    {/* Badge row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                        {r.category || "Role"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                        <Layers className="w-3.5 h-3.5" />
                        {r.topic_count} Topics
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className="text-lg font-bold text-white group-hover:text-[var(--color-accent)] transition-colors">
                        {r.title}
                      </h2>
                      <p className="mt-2 text-xs sm:text-sm text-[var(--color-muted-foreground)] line-clamp-3 leading-relaxed">
                        {r.description || "A comprehensive learning progression with practical milestones."}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-6 pt-4 border-t border-[var(--color-border)]/80 flex items-center justify-between gap-3">
                    {r.source_url && (
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-muted-foreground)] hover:text-white inline-flex items-center gap-1 transition-colors"
                        title="View original on roadmap.sh"
                      >
                        roadmap.sh <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Link
                      href={`/roadmap/${r.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-accent)] text-white text-xs font-semibold transition-all group-hover:bg-[var(--color-accent)]"
                    >
                      Start Roadmap
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
