import type { Evidence } from "../types";

export interface EvidenceCardProps {
  evidence: Evidence;
  onReveal: (evidence: Evidence) => void;
  canReveal: boolean;
  isRevealing?: boolean;
  variant?: "default" | "compact";
}

const cardBase =
  "rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)] dark:border-slate-800 dark:bg-slate-900";

const buttonBase =
  "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60";
const buttonActive =
  "border-cyan-500/50 bg-cyan-500/10 text-cyan-700 hover:border-cyan-400 hover:bg-cyan-500/20 dark:text-cyan-300";
const buttonDisabled = "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";

export function EvidenceCard({
  evidence,
  onReveal,
  canReveal,
  isRevealing = false,
  variant = "default",
}: EvidenceCardProps) {
  const handleReveal = () => onReveal(evidence);
  const isDisabled = evidence.isRevealed || isRevealing;

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
        {canReveal ? (
          <button
            className={`${buttonBase} shrink-0 ${isDisabled ? buttonDisabled : buttonActive}`}
            type="button"
            onClick={handleReveal}
            disabled={isDisabled}
          >
            {isRevealing ? "Revealing…" : evidence.isRevealed ? "Revealed" : "Reveal"}
          </button>
        ) : evidence.isRevealed ? (
          <span className="shrink-0 text-xs font-medium text-emerald-700 dark:text-emerald-300">Revealed</span>
        ) : null}
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
      {canReveal ? (
        <button
          className={`${buttonBase} mt-3 ${isDisabled ? buttonDisabled : buttonActive}`}
          type="button"
          onClick={handleReveal}
          disabled={isDisabled}
        >
          {isRevealing ? "Revealing…" : evidence.isRevealed ? "Evidence revealed" : "Reveal evidence"}
        </button>
      ) : evidence.isRevealed ? (
        <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">Evidence revealed by an incident commander.</p>
      ) : null}
    </article>
  );
}
