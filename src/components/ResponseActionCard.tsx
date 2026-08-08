import { ResponseActionStatus, type ResponseAction } from "../types";

export interface ResponseActionCardProps {
  action: ResponseAction;
  onAdvance: (action: ResponseAction) => void;
}

const badgeBase =
  "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium";

const statusStyles: Record<ResponseActionStatus, string> = {
  [ResponseActionStatus.PROPOSED]:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  [ResponseActionStatus.APPROVED]:
    "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  [ResponseActionStatus.IN_PROGRESS]:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  [ResponseActionStatus.COMPLETED]:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  [ResponseActionStatus.REJECTED]:
    "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
};

export function ResponseActionCard({ action, onAdvance }: ResponseActionCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)] dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {action.title}
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
      <p className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
        Priority: {action.priority}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>
          Status: <span className="font-mono">{action.status}</span>
        </span>
        <span className={`${badgeBase} ${statusStyles[action.status]}`}>{action.status}</span>
      </div>
      <button
        className="mt-3 inline-flex items-center rounded-md border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-700 transition-colors hover:border-cyan-400 hover:bg-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:text-cyan-300"
        type="button"
        onClick={() => onAdvance(action)}
      >
        Review action
      </button>
    </article>
  );
}
