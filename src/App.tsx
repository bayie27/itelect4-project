import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  EvidenceType,
  IncidentSeverity,
  IncidentStatus,
  ResponseActionStatus,
  type Evidence,
  type Incident,
  type ResponseAction,
} from "./types";
import { EvidenceCard } from "./components/EvidenceCard";
import { IncidentCard } from "./components/IncidentCard";
import { ResponseActionCard } from "./components/ResponseActionCard";
import { useToggle } from "./hooks/useToggle";
import { usePrevious } from "./hooks/usePrevious";

const mockIncident: Incident = {
  id: "incident-1",
  title: "Suspicious OAuth Application Access",
  summary: "Fictional accounts authorized an unknown application.",
  description: "Investigate the simulated consent activity and contain access.",
  severity: IncidentSeverity.HIGH,
  status: IncidentStatus.CONTAINED,
  reportedAt: "2026-07-18T08:00:00.000Z",
  commanderId: "user-commander-1",
  createdById: "user-commander-1",
  createdAt: "2026-07-18T08:00:00.000Z",
  updatedAt: "2026-07-18T10:30:00.000Z",
  containedAt: "2026-07-18T10:30:00.000Z",
};

const mockEvidence: Evidence[] = [
  {
    id: "evidence-1",
    incidentId: mockIncident.id,
    title: "OAuth consent alert",
    description: "A fictional alert shows unusual application consent activity.",
    type: EvidenceType.ALERT,
    isRevealed: true,
    createdAt: "2026-07-18T08:15:00.000Z",
    revealedAt: "2026-07-18T08:30:00.000Z",
    revealedById: "user-commander-1",
  },
  {
    id: "evidence-2",
    incidentId: mockIncident.id,
    title: "Simulated user report",
    description: "A fictional user reported unexpected access prompts.",
    type: EvidenceType.USER_REPORT,
    isRevealed: false,
    createdAt: "2026-07-18T08:20:00.000Z",
  },
];

const mockActions: ResponseAction[] = [
  {
    id: "action-1",
    incidentId: mockIncident.id,
    title: "Revoke suspicious sessions",
    description: "Revoke the sessions associated with the fictional accounts.",
    status: ResponseActionStatus.COMPLETED,
    priority: 1,
    proposedById: "user-responder-1",
    assignedToId: "user-responder-1",
    approvedById: "user-commander-1",
    createdAt: "2026-07-18T08:45:00.000Z",
    startedAt: "2026-07-18T09:00:00.000Z",
    completedAt: "2026-07-18T09:45:00.000Z",
  },
  {
    id: "action-2",
    incidentId: mockIncident.id,
    title: "Document lessons learned",
    description: "Record the fictional investigation findings for the report.",
    status: ResponseActionStatus.APPROVED,
    priority: 2,
    proposedById: "user-commander-1",
    assignedToId: "user-commander-1",
    approvedById: "user-commander-1",
    createdAt: "2026-07-18T10:00:00.000Z",
  },
];

const secondaryButtonClass =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-300";

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

function ErrorPanel({ resource, onRetry }: { resource: string; onRetry: () => void }) {
  return (
    <div
      className="rounded-lg border border-red-500/40 bg-red-500/10 p-4"
      role="alert"
    >
      <p className="font-mono text-sm font-semibold text-red-700 dark:text-red-300">
        ⚠ Failed to load {resource}
      </p>
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
        Simulated error for demo purposes.
      </p>
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

function App() {
  const [activityMessage, setActivityMessage] = useState(
    "Choose an incident resource to see a typed interaction.",
  );
  const [revealedEvidenceId, setRevealedEvidenceId] = useState<string | null>(null);

  const [incident, setIncident] = useState<Incident | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [actionsList, setActionsList] = useState<ResponseAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [hasError, setHasError] = useState(false);

  const [showDescription, toggleShowDescription] = useToggle(false);
  const [isDarkMode, toggleDarkMode] = useToggle(false);
  const previousActivityMessage = usePrevious(activityMessage);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIncident(mockIncident);
      setEvidenceList(mockEvidence);
      setActionsList(mockActions);
      setIsLoading(false);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      searchInputRef.current?.focus();
    }
  }, [isLoading]);

  const handleOpenIncident = (openedIncident: Incident): void => {
    setActivityMessage(`Opened ${openedIncident.title}.`);
  };

  const handleRevealEvidence = (evidenceItem: Evidence): void => {
    setRevealedEvidenceId(evidenceItem.id);
    setActivityMessage(`Revealed ${evidenceItem.title}.`);
  };

  const handleReviewAction = (action: ResponseAction): void => {
    setActivityMessage(`Reviewing ${action.title}.`);
  };

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFilterText(event.target.value);
  };

  const handleSimulateError = (): void => {
    setHasError(true);
    setActivityMessage("Simulated a data-loading error.");
  };

  const handleClearError = (): void => {
    setHasError(false);
    setActivityMessage("Recovered from the simulated error.");
  };

  const visibleEvidence = evidenceList.filter((evidenceItem) =>
    evidenceItem.title.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-cyan-300">
                Incident command room
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Typed mock incident-response components.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={toggleDarkMode} className={secondaryButtonClass}>
                {isDarkMode ? "Light mode" : "Dark mode"}
              </button>
              <button
                type="button"
                onClick={hasError ? handleClearError : handleSimulateError}
                className={secondaryButtonClass}
              >
                {hasError ? "Clear simulated error" : "Simulate error"}
              </button>
            </div>
          </div>

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

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Incident</h2>
            <div className="mt-4">
              {hasError ? (
                <ErrorPanel resource="the incident" onRetry={handleClearError} />
              ) : isLoading || !incident ? (
                <LoadingSkeleton label="incident" />
              ) : (
                <>
                  <IncidentCard incident={incident} onOpen={handleOpenIncident} />
                  <button
                    type="button"
                    onClick={toggleShowDescription}
                    className={`${secondaryButtonClass} mt-3`}
                  >
                    {showDescription ? "Hide description" : "Show description"}
                  </button>
                  {showDescription && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {incident.description}
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Evidence</h2>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Filter evidence by title…"
              value={filterText}
              onChange={handleFilterChange}
              className="mt-4 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <div className="mt-4">
              {hasError ? (
                <ErrorPanel resource="evidence" onRetry={handleClearError} />
              ) : isLoading ? (
                <LoadingSkeleton label="evidence" />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleEvidence.map((evidenceItem, index) => (
                    <EvidenceCard
                      key={evidenceItem.id}
                      variant={index % 2 === 0 ? "default" : "compact"}
                      evidence={{
                        ...evidenceItem,
                        isRevealed:
                          evidenceItem.isRevealed || revealedEvidenceId === evidenceItem.id,
                      }}
                      onReveal={handleRevealEvidence}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Response actions
            </h2>
            <div className="mt-4">
              {hasError ? (
                <ErrorPanel resource="response actions" onRetry={handleClearError} />
              ) : isLoading ? (
                <LoadingSkeleton label="response actions" />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {actionsList.map((action) => (
                    <ResponseActionCard
                      key={action.id}
                      action={action}
                      onAdvance={handleReviewAction}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App
