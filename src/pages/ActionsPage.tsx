import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ResponseActionCard } from "../components/ResponseActionCard";
import { createResponseAction, fetchIncidents, fetchResponseActions } from "../api/client";
import type {
  ActionPriority,
  CreateResponseActionInput,
  Incident,
  ResponseAction,
} from "../types";

function LoadingSkeleton() {
  return (
    <div
      className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      role="status"
      aria-label="Loading response actions"
    >
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      <p className="mt-3 font-mono text-xs text-slate-400 dark:text-slate-500">
        Loading response actions…
      </p>
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4" role="alert">
      <p className="font-mono text-sm font-semibold text-red-700 dark:text-red-300">
        Failed to load response-action data
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

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

function isActionPriority(value: number): value is ActionPriority {
  return value === 1 || value === 2 || value === 3;
}

export function ActionsPage() {
  const queryClient = useQueryClient();
  const incidentsQuery = useQuery<Incident[]>({
    queryKey: ["incidents"],
    queryFn: fetchIncidents,
  });
  const actionsQuery = useQuery<ResponseAction[]>({
    queryKey: ["responseActions"],
    queryFn: fetchResponseActions,
  });
  const [incidentId, setIncidentId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ActionPriority>(2);
  const [activityMessage, setActivityMessage] = useState(
    "Review a response action to see a typed interaction.",
  );

  const addAction = useMutation({
    mutationFn: createResponseAction,
    onSuccess: (createdAction) => {
      void queryClient.invalidateQueries({ queryKey: ["responseActions"] });
      setIncidentId("");
      setTitle("");
      setDescription("");
      setPriority(2);
      setActivityMessage(`Proposed ${createdAction.title}.`);
    },
  });

  const handleReviewAction = (action: ResponseAction): void => {
    setActivityMessage(`Reviewing ${action.title}.`);
  };

  const handlePriorityChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const nextPriority = Number(event.target.value);
    if (isActionPriority(nextPriority)) {
      setPriority(nextPriority);
    }
  };

  const handleAddAction = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const input: CreateResponseActionInput = {
      incidentId,
      title: title.trim(),
      description: description.trim(),
      priority,
      proposedById: "user-responder-1",
    };

    addAction.mutate(input);
  };

  const isLoading = incidentsQuery.isPending || actionsQuery.isPending;
  const queryError = incidentsQuery.error ?? actionsQuery.error;

  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Response actions
        </h2>
        <div className="mt-4">
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  if (queryError !== null) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Response actions
        </h2>
        <div className="mt-4">
          <ErrorPanel
            message={queryError.message}
            onRetry={() => {
              void incidentsQuery.refetch();
              void actionsQuery.refetch();
            }}
          />
        </div>
      </section>
    );
  }

  const incidents = incidentsQuery.data ?? [];
  const actions = actionsQuery.data ?? [];

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Response actions
      </h2>
      <p
        className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        role="status"
      >
        {activityMessage}
      </p>

      {incidents.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          Create an incident before proposing a response action.
        </p>
      ) : (
        <form
          onSubmit={handleAddAction}
          className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Propose a response action
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">
              Incident
              <select
                value={incidentId}
                onChange={(event) => setIncidentId(event.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select an incident…</option>
                {incidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-300">
              Priority
              <select
                value={priority}
                onChange={handlePriorityChange}
                className={inputClass}
              >
                <option value={1}>1 - highest</option>
                <option value={2}>2 - normal</option>
                <option value={3}>3 - lowest</option>
              </select>
            </label>
          </div>
          <label className="mt-3 block text-sm text-slate-700 dark:text-slate-300">
            Action title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
              placeholder="Review affected accounts"
              required
            />
          </label>
          <label className="mt-3 block text-sm text-slate-700 dark:text-slate-300">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
              placeholder="Describe the fictional response work."
              rows={3}
              required
            />
          </label>
          <button
            type="submit"
            disabled={
              addAction.isPending ||
              incidentId === "" ||
              title.trim() === "" ||
              description.trim() === ""
            }
            className="mt-3 inline-flex items-center rounded-md border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-700 transition-colors hover:border-cyan-400 hover:bg-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-cyan-300"
          >
            {addAction.isPending ? "Saving…" : "Propose action"}
          </button>
          {addAction.isError && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300" role="alert">
              {addAction.error.message}
            </p>
          )}
        </form>
      )}

      <div className="mt-4">
        {actions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            No response actions have been proposed yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
              <ResponseActionCard key={action.id} action={action} onAdvance={handleReviewAction} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
