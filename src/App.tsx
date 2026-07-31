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

  const [showDescription, toggleShowDescription] = useToggle(false);
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

  const visibleEvidence = evidenceList.filter((evidenceItem) =>
    evidenceItem.title.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <main className="app-shell">
      <h1>Incident command room</h1>
      <p>Typed mock incident-response components.</p>
      <p className="activity-message" role="status">{activityMessage}</p>
      {previousActivityMessage && previousActivityMessage !== activityMessage && (
        <p className="activity-message">Previously: {previousActivityMessage}</p>
      )}

      <section className="section-block">
        <h2>Incident</h2>
        {isLoading || !incident ? (
          <p className="loading-placeholder">Loading incident…</p>
        ) : (
          <>
            <IncidentCard incident={incident} onOpen={handleOpenIncident} />
            <button className="button" type="button" onClick={toggleShowDescription}>
              {showDescription ? "Hide description" : "Show description"}
            </button>
            {showDescription && <p>{incident.description}</p>}
          </>
        )}
      </section>

      <section className="section-block">
        <h2>Evidence</h2>
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Filter evidence by title…"
          value={filterText}
          onChange={handleFilterChange}
        />
        {isLoading ? (
          <p className="loading-placeholder">Loading evidence…</p>
        ) : (
          <div className="list">
            {visibleEvidence.map((evidenceItem) => (
              <EvidenceCard
                key={evidenceItem.id}
                evidence={{
                  ...evidenceItem,
                  isRevealed: evidenceItem.isRevealed || revealedEvidenceId === evidenceItem.id,
                }}
                onReveal={handleRevealEvidence}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <h2>Response actions</h2>
        {isLoading ? (
          <p className="loading-placeholder">Loading response actions…</p>
        ) : (
          <div className="list">
            {actionsList.map((action) => (
              <ResponseActionCard
                key={action.id}
                action={action}
                onAdvance={handleReviewAction}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App
