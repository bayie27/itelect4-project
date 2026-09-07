import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponseActionCard } from "../components/ResponseActionCard";
import { createResponseAction, fetchIncidents, fetchResponseActions } from "../api/client";
import type {
  CreateResponseActionInput,
  Incident,
  ResponseAction,
} from "../types";
import {
  responseActionSchema,
  type ResponseActionFormValues,
} from "../schemas/responseActionSchema";

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

const fieldErrorClass = "mt-1 text-sm text-red-700 dark:text-red-300";

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResponseActionFormValues>({
    resolver: zodResolver(responseActionSchema),
    mode: "onBlur",
    defaultValues: {
      incidentId: "",
      title: "",
      description: "",
      priority: 2,
    },
  });
  const [activityMessage, setActivityMessage] = useState(
    "Review a response action to see a typed interaction.",
  );

  const addAction = useMutation({
    mutationFn: createResponseAction,
    onSuccess: (createdAction) => {
      void queryClient.invalidateQueries({ queryKey: ["responseActions"] });
      reset();
      setActivityMessage(`Proposed ${createdAction.title}.`);
    },
  });

  const handleReviewAction = (action: ResponseAction): void => {
    setActivityMessage(`Reviewing ${action.title}.`);
  };

  const handleAddAction = (values: ResponseActionFormValues): void => {
    const input: CreateResponseActionInput = {
      ...values,
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
          onSubmit={handleSubmit(handleAddAction)}
          className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Propose a response action
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="incidentId" className="text-slate-700 dark:text-slate-300">
                Incident
              </Label>
              <select
                id="incidentId"
                {...register("incidentId")}
                aria-invalid={errors.incidentId ? true : undefined}
                aria-describedby={errors.incidentId ? "incidentId-error" : undefined}
                className={`${inputClass} aria-invalid:border-red-500`}
              >
                <option value="">Select an incident…</option>
                {incidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.title}
                  </option>
                ))}
              </select>
              {errors.incidentId && (
                <p id="incidentId-error" className={fieldErrorClass} role="alert">
                  {errors.incidentId.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priority" className="text-slate-700 dark:text-slate-300">
                Priority
              </Label>
              <select
                id="priority"
                {...register("priority", { valueAsNumber: true })}
                aria-invalid={errors.priority ? true : undefined}
                aria-describedby={errors.priority ? "priority-error" : undefined}
                className={`${inputClass} aria-invalid:border-red-500`}
              >
                <option value={1}>1 - highest</option>
                <option value={2}>2 - normal</option>
                <option value={3}>3 - lowest</option>
              </select>
              {errors.priority && (
                <p id="priority-error" className={fieldErrorClass} role="alert">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 grid gap-1.5">
            <Label htmlFor="action-title" className="text-slate-700 dark:text-slate-300">
              Action title
            </Label>
            <Input
              id="action-title"
              {...register("title")}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "title-error" : undefined}
              type="text"
              placeholder="Review affected accounts"
            />
            {errors.title && (
              <p id="title-error" className={fieldErrorClass} role="alert">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="mt-3 grid gap-1.5">
            <Label htmlFor="action-description" className="text-slate-700 dark:text-slate-300">
              Description
            </Label>
            <textarea
              id="action-description"
              {...register("description")}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? "description-error" : undefined}
              className={`${inputClass} aria-invalid:border-red-500`}
              placeholder="Describe the fictional response work."
              rows={3}
            />
            {errors.description && (
              <p id="description-error" className={fieldErrorClass} role="alert">
                {errors.description.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={addAction.isPending} className="mt-3">
            {addAction.isPending ? "Saving…" : "Propose action"}
          </Button>
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
