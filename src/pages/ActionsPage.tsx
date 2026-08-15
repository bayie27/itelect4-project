import { useState } from "react";
import { ResponseActionCard } from "../components/ResponseActionCard";
import { useMockResource } from "../hooks/useMockResource";
import { mockActions } from "../data/mockData";
import type { ResponseAction } from "../types";

function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div
      className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      role="status"
      aria-label={`Loading ${label}`}
    >
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      <p className="mt-3 font-mono text-xs text-slate-400 dark:text-slate-500">Loading {label}…</p>
    </div>
  );
}

function ErrorPanel({ resource, onRetry }: { resource: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4" role="alert">
      <p className="font-mono text-sm font-semibold text-red-700 dark:text-red-300">
        ⚠ Failed to load {resource}
      </p>
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">Simulated error for demo purposes.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center rounded-md border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/50 dark:text-red-300"
      >
        Retry
      </button>
    </div>
  );
}

const secondaryButtonClass =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-300";

export function ActionsPage() {
  const { value: actionsList, isLoading, hasError, simulateError, clearError } =
    useMockResource(mockActions);
  const [activityMessage, setActivityMessage] = useState(
    "Review a response action to see a typed interaction.",
  );

  const handleReviewAction = (action: ResponseAction): void => {
    setActivityMessage(`Reviewing ${action.title}.`);
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Response actions
        </h2>
        <button
          type="button"
          onClick={hasError ? clearError : simulateError}
          className={secondaryButtonClass}
        >
          {hasError ? "Clear simulated error" : "Simulate error"}
        </button>
      </div>
      <p
        className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        role="status"
      >
        {activityMessage}
      </p>
      <div className="mt-4">
        {hasError ? (
          <ErrorPanel resource="response actions" onRetry={clearError} />
        ) : isLoading || !actionsList ? (
          <LoadingSkeleton label="response actions" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actionsList.map((action) => (
              <ResponseActionCard key={action.id} action={action} onAdvance={handleReviewAction} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
