import { useState } from "react";
import { Link, useParams } from "react-router";
import { IncidentCard } from "../components/IncidentCard";
import { useMockResource } from "../hooks/useMockResource";
import { useToggle } from "../hooks/useToggle";
import { usePrevious } from "../hooks/usePrevious";
import { mockIncident } from "../data/mockData";
import type { Incident } from "../types";

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

const secondaryButtonClass =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-300";

export function IncidentPage() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const { value: incident, isLoading } = useMockResource(mockIncident);

  const [activityMessage, setActivityMessage] = useState(
    "Open the incident to see a typed interaction.",
  );
  const [showDescription, toggleShowDescription] = useToggle(false);
  const previousActivityMessage = usePrevious(activityMessage);

  const handleOpenIncident = (openedIncident: Incident): void => {
    setActivityMessage(`Opened ${openedIncident.title}.`);
  };

  if (isLoading || !incident) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Incident</h2>
        <div className="mt-4">
          <LoadingSkeleton label="incident" />
        </div>
      </section>
    );
  }

  if (incidentId !== incident.id) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Incident</h2>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          No incident found for id <span className="font-mono">{incidentId}</span>.
        </p>
        <Link to="/" className={`${secondaryButtonClass} mt-3`}>
          Back to dashboard
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Incident</h2>
      <p
        className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        role="status"
      >
        {activityMessage}
      </p>
      {previousActivityMessage && previousActivityMessage !== activityMessage && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          Previously: {previousActivityMessage}
        </p>
      )}
      <div className="mt-4">
        <IncidentCard incident={incident} onOpen={handleOpenIncident} />
        <button
          type="button"
          onClick={toggleShowDescription}
          className={`${secondaryButtonClass} mt-3`}
        >
          {showDescription ? "Hide description" : "Show description"}
        </button>
        {showDescription && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{incident.description}</p>
        )}
      </div>
    </section>
  );
}
