import { useState } from "react";
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

  const handleOpenIncident = (incident: Incident): void => {
    setActivityMessage(`Opened ${incident.title}.`);
  };

  const handleRevealEvidence = (evidence: Evidence): void => {
    setRevealedEvidenceId(evidence.id);
    setActivityMessage(`Revealed ${evidence.title}.`);
  };

  const handleReviewAction = (action: ResponseAction): void => {
    setActivityMessage(`Reviewing ${action.title}.`);
  };

  return (
    <main className="app-shell">
      <h1>Incident command room</h1>
      <p>Typed mock incident-response components.</p>
      <p className="activity-message" role="status">{activityMessage}</p>

      <section className="section-block">
        <h2>Incident</h2>
        <IncidentCard incident={mockIncident} onOpen={handleOpenIncident} />
      </section>

      <section className="section-block">
        <h2>Evidence</h2>
        <div className="list">
          {mockEvidence.map((evidence) => (
            <EvidenceCard
              key={evidence.id}
              evidence={{
                ...evidence,
                isRevealed: evidence.isRevealed || revealedEvidenceId === evidence.id,
              }}
              onReveal={handleRevealEvidence}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>Response actions</h2>
        <div className="list">
          {mockActions.map((action) => (
            <ResponseActionCard
              key={action.id}
              action={action}
              onAdvance={handleReviewAction}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default App
