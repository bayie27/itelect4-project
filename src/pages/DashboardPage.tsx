import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { IncidentCard } from "../components/IncidentCard";
import { fetchIncidents } from "../api/client";
import type { Incident } from "../types";

function LoadingSkeleton() {
  return (
    <div
      className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      role="status"
      aria-label="Loading incidents"
    >
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      <p className="mt-3 font-mono text-xs text-slate-400 dark:text-slate-500">
        Loading incidents…
      </p>
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4" role="alert">
      <p className="font-mono text-sm font-semibold text-red-700 dark:text-red-300">
        Failed to load incidents
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

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: incidents = [], isPending, isError, error, refetch } = useQuery<Incident[]>({
    queryKey: ["incidents"],
    queryFn: fetchIncidents,
  });

  const handleOpenIncident = (incident: Incident): void => {
    navigate(`/incidents/${incident.id}`);
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Open incidents
      </h2>
      <div className="mt-4">
        {isPending ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorPanel message={error.message} onRetry={() => void refetch()} />
        ) : incidents.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            No incidents are available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} onOpen={handleOpenIncident} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
