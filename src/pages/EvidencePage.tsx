import { useQuery } from "@tanstack/react-query";
import { EvidenceCard } from "../components/EvidenceCard";
import { fetchEvidence } from "../api/client";
import { useUiStore } from "../store/uiStore";
import { useState } from "react";
import type { Evidence } from "../types";

function LoadingSkeleton() {
  return (
    <div
      className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      role="status"
      aria-label="Loading evidence"
    >
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      <p className="mt-3 font-mono text-xs text-slate-400 dark:text-slate-500">
        Loading evidence…
      </p>
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4" role="alert">
      <p className="font-mono text-sm font-semibold text-red-700 dark:text-red-300">
        Failed to load evidence
      </p>
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{message}</p>
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

export function EvidencePage() {
  const { data: evidenceList = [], isPending, isError, error, refetch } = useQuery<Evidence[]>({
    queryKey: ["evidence"],
    queryFn: fetchEvidence,
  });
  const searchTerm = useUiStore((state) => state.searchTerm);
  const setSearchTerm = useUiStore((state) => state.setSearchTerm);
  const [revealedEvidenceId, setRevealedEvidenceId] = useState<string | null>(null);
  const [activityMessage, setActivityMessage] = useState(
    "Reveal a piece of evidence to see a typed interaction.",
  );

  const handleRevealEvidence = (evidenceItem: Evidence): void => {
    setRevealedEvidenceId(evidenceItem.id);
    setActivityMessage(`Revealed ${evidenceItem.title}.`);
  };

  const visibleEvidence = evidenceList.filter((evidenceItem) =>
    evidenceItem.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Evidence</h2>
      <p
        className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        role="status"
      >
        {activityMessage}
      </p>
      <input
        type="text"
        placeholder="Filter evidence by title…"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="mt-4 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      <div className="mt-4">
        {isPending ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorPanel message={error.message} onRetry={() => void refetch()} />
        ) : visibleEvidence.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            No evidence matches this filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvidence.map((evidenceItem, index) => (
              <EvidenceCard
                key={evidenceItem.id}
                variant={index % 2 === 0 ? "default" : "compact"}
                evidence={{
                  ...evidenceItem,
                  isRevealed: evidenceItem.isRevealed || revealedEvidenceId === evidenceItem.id,
                }}
                onReveal={handleRevealEvidence}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
