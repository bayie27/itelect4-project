import type { MouseEventHandler } from "react";
import { IncidentSeverity, IncidentStatus, type Incident } from "../types";

export interface IncidentCardProps {
  incident: Incident;
  onOpen: (incident: Incident) => void;
}

const badgeBase =
  "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium";

const severityStyles: Record<IncidentSeverity, string> = {
  [IncidentSeverity.LOW]:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  [IncidentSeverity.MEDIUM]:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  [IncidentSeverity.HIGH]:
    "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  [IncidentSeverity.CRITICAL]:
    "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
};

const statusStyles: Record<IncidentStatus, string> = {
  [IncidentStatus.DETECTED]:
    "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  [IncidentStatus.TRIAGING]:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  [IncidentStatus.INVESTIGATING]:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  [IncidentStatus.CONTAINED]:
    "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  [IncidentStatus.RESOLVED]:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function IncidentCard({ incident, onOpen }: IncidentCardProps) {
  const handleOpen: MouseEventHandler<HTMLButtonElement> = () => {
    onOpen(incident);
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)] dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {incident.title}
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{incident.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>
          Status: <span className="font-mono">{incident.status}</span>
        </span>
        <span className={`${badgeBase} ${statusStyles[incident.status]}`}>{incident.status}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>
          Severity: <span className="font-mono">{incident.severity}</span>
        </span>
        <span className={`${badgeBase} ${severityStyles[incident.severity]}`}>
          {incident.severity}
        </span>
      </div>
      <button
        className="mt-3 inline-flex items-center rounded-md border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-700 transition-colors hover:border-cyan-400 hover:bg-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:text-cyan-300"
        type="button"
        onClick={handleOpen}
      >
        Open incident
      </button>
    </article>
  );
}
