import type { Evidence } from "../types";

export interface EvidenceCardProps {
  evidence: Evidence;
  onReveal: (evidence: Evidence) => void;
  variant?: "default" | "compact";
}

const cardBase =
  "rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)] dark:border-slate-800 dark:bg-slate-900";

const buttonBase =
  "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60";
const buttonActive =
  "border-cyan-500/50 bg-cyan-500/10 text-cyan-700 hover:border-cyan-400 hover:bg-cyan-500/20 dark:text-cyan-300";
const buttonDisabled = "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";

export function EvidenceCard({ evidence, onReveal, variant = "default" }: EvidenceCardProps) {
  const handleReveal = () => onReveal(evidence);

  if (variant === "compact") {
    return (
      <article className={`${cardBase} flex items-center justify-between gap-3 p-3`}>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {evidence.title}
          </h3>
          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {evidence.type}
          </p>
        </div>
        <button
          className={`${buttonBase} shrink-0 ${evidence.isRevealed ? buttonDisabled : buttonActive}`}
          type="button"
          onClick={handleReveal}
          disabled={evidence.isRevealed}
        >
          {evidence.isRevealed ? "Revealed" : "Reveal"}
        </button>
      </article>
    );
  }

  return (
    <article className={`${cardBase} p-4`}>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {evidence.title}
      </h3>
      <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
        Type: {evidence.type}
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {evidence.isRevealed ? evidence.description : "This evidence is hidden."}
      </p>
      <button
        className={`${buttonBase} mt-3 ${evidence.isRevealed ? buttonDisabled : buttonActive}`}
        type="button"
        onClick={handleReveal}
        disabled={evidence.isRevealed}
      >
        {evidence.isRevealed ? "Evidence revealed" : "Reveal evidence"}
      </button>
    </article>
  );
}
