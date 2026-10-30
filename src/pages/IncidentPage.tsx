import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { fetchIncidentById, fetchResponseActions, transitionIncidentStatus } from "../api/client";
import { IncidentCard } from "../components/IncidentCard";
import { canResolveIncident, validIncidentTransitions } from "../domain/rules";
import { usePrevious } from "../hooks/usePrevious";
import { useToggle } from "../hooks/useToggle";
import { IncidentStatus, UserRole, type Incident, type ResponseAction } from "../types";
import { useAuthStore } from "../store/authStore";

function LoadingSkeleton() {
  return (
    <div
      className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      role="status"
      aria-label="Loading incident"
    >
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      <p className="mt-3 font-mono text-xs text-slate-400 dark:text-slate-500">
        Loading incident…
      </p>
    </div>
  );
}

const secondaryButtonClass =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-300";

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4" role="alert">
      <p className="font-mono text-sm font-semibold text-red-700 dark:text-red-300">
        Failed to load incident
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

export function IncidentPage() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [activityMessage, setActivityMessage] = useState(
    "Open the incident to see a typed interaction.",
  );
  const { data: incident, isPending, isError, error, refetch } = useQuery<Incident>({
    queryKey: ["incidents", incidentId],
    queryFn: () => {
      if (incidentId === undefined) {
        throw new Error("An incident id is required.");
      }

      return fetchIncidentById(incidentId);
    },
    enabled: incidentId !== undefined,
  });
  const actionsQuery = useQuery<ResponseAction[]>({
    queryKey: ["responseActions", incidentId ? [incidentId] : []],
    queryFn: () => (incidentId ? fetchResponseActions([incidentId]) : Promise.resolve([])),
    enabled: incidentId !== undefined,
  });
  const transitionMutation = useMutation({
    mutationFn: ({ targetStatus }: { targetStatus: IncidentStatus }) => {
      if (!incidentId) throw new Error("An incident id is required.");
      return transitionIncidentStatus(incidentId, targetStatus);
    },
    onSuccess: (updatedIncident) => {
      setActivityMessage(`Incident moved to ${updatedIncident.status}.`);
      void queryClient.invalidateQueries({ queryKey: ["incidents"] });
      void queryClient.invalidateQueries({ queryKey: ["incidents", updatedIncident.id] });
    },
  });
  const [showDescription, toggleShowDescription] = useToggle(false);
  const previousActivityMessage = usePrevious(activityMessage);

  const handleOpenIncident = (openedIncident: Incident): void => {
    setActivityMessage(`Opened ${openedIncident.title}.`);
  };

  const handleTransition = (targetStatus: IncidentStatus): void => {
    transitionMutation.mutate({ targetStatus });
  };

  if (incidentId === undefined) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Incident</h2>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          No incident id was provided.
        </p>
        <Link to="/" className={`${secondaryButtonClass} mt-3`}>
          Back to dashboard
        </Link>
      </section>
    );
  }

  if (isPending) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Incident</h2>
        <div className="mt-4">
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  if (isError || incident === undefined) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Incident</h2>
        <div className="mt-4">
          <ErrorPanel
            message={error?.message ?? `No incident found for id "${incidentId}".`}
            onRetry={() => void refetch()}
          />
        </div>
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
      {user?.role === UserRole.INCIDENT_COMMANDER && incident.status !== IncidentStatus.RESOLVED && (
        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Incident lifecycle</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Current status: <span className="font-mono">{incident.status}</span>
          </p>
          {incident.status === IncidentStatus.CONTAINED && actionsQuery.isPending && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400" role="status">
              Checking response actions before resolution…
            </p>
          )}
          {incident.status === IncidentStatus.CONTAINED && actionsQuery.isError && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300" role="alert">
              Could not check response actions. Retry the incident page before resolving.
            </p>
          )}
          {incident.status === IncidentStatus.CONTAINED && actionsQuery.isSuccess &&
            !canResolveIncident(incident, actionsQuery.data) && (
              <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                Reject or complete all response actions before resolving this incident.
              </p>
            )}
          <div className="mt-3 flex flex-wrap gap-2">
            {validIncidentTransitions[incident.status].map((targetStatus) => {
              const isResolve = targetStatus === IncidentStatus.RESOLVED;
              const resolutionReady =
                actionsQuery.isSuccess && canResolveIncident(incident, actionsQuery.data);
              const disabled =
                transitionMutation.isPending ||
                (isResolve && (!resolutionReady || actionsQuery.isError || actionsQuery.isPending));

              return (
                <button
                  key={targetStatus}
                  className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTransition(targetStatus)}
                >
                  {isResolve ? "Move to resolved" : `Move to ${targetStatus}`}
                </button>
              );
            })}
          </div>
          {transitionMutation.isError && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300" role="alert">
              {transitionMutation.error.message}
            </p>
          )}
        </section>
      )}
    </section>
  );
}
