import {
  EvidenceType,
  IncidentSeverity,
  IncidentStatus,
  ResponseActionStatus,
  type Evidence,
  type Incident,
  type ResponseAction,
} from "../types";

export const mockIncident: Incident = {
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

export const mockEvidence: Evidence[] = [
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

export const mockActions: ResponseAction[] = [
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
