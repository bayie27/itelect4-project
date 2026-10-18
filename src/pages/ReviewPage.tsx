import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  fetchIncidentReport,
  fetchIncidentReports,
  fetchIncidents,
  generateIncidentReport,
} from "../api/client";
import { incidentReportContentSchema, reviewFormSchema } from "../schemas/incidentReportSchema";
import type { ReviewFormValues } from "../schemas/incidentReportSchema";
import { useAuthStore } from "../store/authStore";
import { IncidentStatus, UserRole } from "../types";
import type { Incident, IncidentReportContent, IncidentReportSummary } from "../types";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
const fieldErrorClass = "mt-1 text-sm text-red-700 dark:text-red-300";

function LoadingPanel() {
  return (
    <div
      className="mt-4 animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      role="status"
      aria-label="Loading incident reports"
    >
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      <p className="mt-3 font-mono text-xs text-slate-400 dark:text-slate-500">
        Loading incident reports…
      </p>
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4" role="alert">
      <p className="font-mono text-sm font-semibold text-red-700 dark:text-red-300">
        Failed to load incident reports
      </p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/50 dark:text-red-300"
      >
        Retry
      </button>
    </div>
  );
}

function parseReportContent(content: string): IncidentReportContent | null {
  let json: unknown;
  try {
    json = JSON.parse(content) as unknown;
  } catch {
    return null;
  }

  const parsed = incidentReportContentSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

function ReportContent({ content }: { content: IncidentReportContent }) {
  const coverageText = {
    sufficient: "Sufficient source data",
    partial: "Partial source data",
    insufficient: "Insufficient source data",
  } satisfies Record<IncidentReportContent["dataCoverage"], string>;

  return (
    <article className="mt-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          AI generated draft
        </h3>
        <p className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
          Data coverage: {coverageText[content.dataCoverage]}
        </p>
      </div>
      <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Review this draft before using it in the training exercise. Its coverage label describes the
        supplied report data; it does not change incident status or make a response decision.
      </p>

      <section className="mt-5">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">Executive summary</h4>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{content.executiveSummary}</p>
      </section>
      <section className="mt-4">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">Incident overview</h4>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{content.incidentOverview}</p>
      </section>
      <ReportList title="Evidence reviewed" items={content.evidenceReviewed} />
      <ReportList title="Response timeline" items={content.responseTimeline} />
      <section className="mt-4">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
          Containment and resolution
        </h4>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          {content.containmentAndResolution}
        </p>
      </section>
      <ReportList title="Lessons learned" items={content.lessonsLearned} />
      <ReportList title="Preventive recommendations" items={content.recommendations} />
    </article>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-4">
      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ReviewWorkbench({ incidents }: { incidents: Incident[] }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canGenerate = user?.role === UserRole.INCIDENT_COMMANDER;
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      incidentId: incidents[0]?.id ?? "",
      prompt: "",
    },
  });
  const selectedIncidentId = useWatch({ control, name: "incidentId" }) ?? "";
  const [selectedReportId, setSelectedReportId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const reportsQuery = useQuery<IncidentReportSummary[]>({
    queryKey: ["incidents", selectedIncidentId, "reports"],
    queryFn: () => fetchIncidentReports(selectedIncidentId),
    enabled: selectedIncidentId.length > 0,
  });
  const reportIdFromList = reportsQuery.data?.some((report) => report.id === selectedReportId)
    ? selectedReportId
    : (reportsQuery.data?.[0]?.id ?? "");
  const reportQuery = useQuery({
    queryKey: ["reports", reportIdFromList],
    queryFn: () => fetchIncidentReport(reportIdFromList),
    enabled: reportIdFromList.length > 0,
  });

  const reportMutation = useMutation({
    mutationFn: generateIncidentReport,
    onSuccess: (report) => {
      setSelectedReportId(report.id);
      setSuccessMessage(`Saved report version ${report.version}.`);
      void queryClient.invalidateQueries({
        queryKey: ["incidents", report.incidentId, "reports"],
      });
    },
  });

  const onSubmit = (values: ReviewFormValues): void => {
    setSuccessMessage("");
    reportMutation.mutate(values);
  };

  const selectedIncident = incidents.find((incident) => incident.id === selectedIncidentId);
  const reportContent = reportQuery.data ? parseReportContent(reportQuery.data.content) : null;

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
      <div>
        {canGenerate ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Generate a post-incident report
            </h3>
            <div className="mt-3 grid gap-1.5">
              <Label htmlFor="incidentId" className="text-slate-700 dark:text-slate-300">
                Resolved incident
              </Label>
              <select
                id="incidentId"
                {...register("incidentId")}
                aria-invalid={errors.incidentId ? true : undefined}
                aria-describedby={errors.incidentId ? "incidentId-error" : undefined}
                className={`${inputClass} aria-invalid:border-red-500`}
              >
                {incidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.title} · {incident.severity}
                  </option>
                ))}
              </select>
              {errors.incidentId && (
                <p id="incidentId-error" className={fieldErrorClass} role="alert">
                  {errors.incidentId.message}
                </p>
              )}
            </div>
            <div className="mt-3 grid gap-1.5">
              <Label htmlFor="prompt" className="text-slate-700 dark:text-slate-300">
                Supplemental incident note
              </Label>
              <textarea
                id="prompt"
                rows={4}
                {...register("prompt")}
                aria-invalid={errors.prompt ? true : undefined}
                aria-describedby={errors.prompt ? "prompt-error" : "prompt-help"}
                className={`${inputClass} aria-invalid:border-red-500`}
                placeholder="Add fictional context that is missing from the persisted incident record."
              />
              <p id="prompt-help" className="text-xs text-slate-500 dark:text-slate-400">
                20–2,000 characters. Keep this fictional; the report labels this note as supplemental.
              </p>
              {errors.prompt && (
                <p id="prompt-error" className={fieldErrorClass} role="alert">
                  {errors.prompt.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={reportMutation.isPending} className="mt-3">
              {reportMutation.isPending ? "Generating…" : "Generate report"}
            </Button>
            {reportMutation.isError && (
              <p className="mt-2 text-sm text-red-700 dark:text-red-300" role="alert">
                {reportMutation.error.message}
              </p>
            )}
            {successMessage && (
              <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300" role="status">
                {successMessage}
              </p>
            )}
          </form>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Only an incident commander can generate a report. Saved reports remain read-only.
          </p>
        )}

        <section className="mt-4" aria-labelledby="report-history-heading">
          <h3 id="report-history-heading" className="font-semibold text-slate-900 dark:text-slate-100">
            Saved versions{selectedIncident ? ` for ${selectedIncident.title}` : ""}
          </h3>
          {reportsQuery.isPending ? (
            <LoadingPanel />
          ) : reportsQuery.isError ? (
            <ErrorPanel
              message={reportsQuery.error.message}
              onRetry={() => void reportsQuery.refetch()}
            />
          ) : reportsQuery.data.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
              No report versions have been saved for this incident.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {reportsQuery.data.map((report) => (
                <li key={report.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedReportId(report.id)}
                    aria-pressed={reportIdFromList === report.id}
                    className="w-full rounded-md border border-slate-300 bg-white p-3 text-left text-sm hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 aria-pressed:border-cyan-600 aria-pressed:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:aria-pressed:bg-cyan-950/40"
                  >
                    <span className="font-semibold">Version {report.version}</span>
                    <span className="ml-2 text-slate-600 dark:text-slate-400">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(report.generatedAt))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-label="Selected report version">
        {reportQuery.isPending && reportIdFromList ? (
          <LoadingPanel />
        ) : reportQuery.isError ? (
          <ErrorPanel message={reportQuery.error.message} onRetry={() => void reportQuery.refetch()} />
        ) : reportQuery.data && reportContent ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Version {reportQuery.data.version} · generated {reportQuery.data.generatedAt}
            </p>
            <ReportContent content={reportContent} />
          </>
        ) : reportQuery.data ? (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300" role="alert">
            This saved report does not match the incident report schema and cannot be displayed.
          </p>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            Select a saved version to review its report.
          </p>
        )}
      </section>
    </div>
  );
}

export function ReviewPage() {
  const incidentsQuery = useQuery<Incident[]>({
    queryKey: ["incidents"],
    queryFn: fetchIncidents,
  });

  if (incidentsQuery.isPending) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Incident Review</h2>
        <LoadingPanel />
      </section>
    );
  }

  if (incidentsQuery.isError) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Incident Review</h2>
        <ErrorPanel
          message={incidentsQuery.error.message}
          onRetry={() => void incidentsQuery.refetch()}
        />
      </section>
    );
  }

  const resolvedIncidents = incidentsQuery.data.filter(
    (incident) => incident.status === IncidentStatus.RESOLVED,
  );

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Incident Review</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
        Generate a structured draft from a resolved fictional incident. Gemini output is for human
        review and does not change the incident or perform response actions.
      </p>
      {resolvedIncidents.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          No resolved incidents are available. Resolve an owned incident before generating a report.
        </p>
      ) : (
        <ReviewWorkbench incidents={resolvedIncidents} />
      )}
    </section>
  );
}
