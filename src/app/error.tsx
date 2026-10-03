"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Global Error Boundary for the Next.js App Router.
 *
 * This file is automatically picked up by Next.js and wraps the entire
 * app in a React Error Boundary. When any unhandled error occurs in a
 * page or layout (e.g. a failed API call, a null dereference, or a
 * backend 500), this component renders instead of a blank white screen.
 *
 * The `reset` function re-mounts the failed component tree, allowing
 * users to try again without a full page reload.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log to console so developers can see the error details.
    // Replace this with a proper error tracking service (e.g., Sentry) when ready.
    console.error("[LearnLeague] Unhandled application error:", error);
  }, [error]);

  const isNetworkError =
    error.message?.toLowerCase().includes("fetch") ||
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("failed to fetch");

  const userMessage = isNetworkError
    ? "Could not reach the server. Check your connection and try again."
    : error.message || "An unexpected error occurred.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background,#020617)] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-2xl border p-8 text-center space-y-6"
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </motion.div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-white">
              {isNetworkError ? "Connection Error" : "Something went wrong"}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(148,163,184,1)" }}>
              {userMessage}
            </p>
            {/* Digest for debugging — hidden from normal users, visible to devs */}
            {error.digest && (
              <p className="text-xs font-mono mt-1" style={{ color: "rgba(100,116,139,0.8)" }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
              style={{ background: "white", color: "#020617" }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm border transition-colors"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,1)",
                background: "transparent",
              }}
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </motion.button>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs mt-4" style={{ color: "rgba(100,116,139,0.6)" }}>
          If this keeps happening, the backend may be temporarily down.
        </p>
      </motion.div>
    </div>
  );
}
