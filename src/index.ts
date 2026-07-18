import {
  EvidenceType,
  IncidentSeverity,
  IncidentStatus,
  ResponseActionStatus,
  UserRole,
  type ApiResponse,
  type CreateIncidentInput,
  type Evidence,
  type EntityById,
  type Incident,
  type IncidentSummary,
  type ResponseAction,
  type RoleCount,
  type User,
} from "./types/index";
import {
  canResolveIncident,
  canTransitionIncident,
  canTransitionResponseAction,
} from "./domain/rules";

const createdAt = "2026-07-18T08:00:00.000Z";

const commander: User = {
  id: "user-commander-1",
  name: "Daniel Sahagun",
  email: "daniel@example.test",
  role: UserRole.INCIDENT_COMMANDER,
  isActive: true,
  createdAt,
};

const responder: User = {
  id: "user-responder-1",
  name: "Meloi Magpantay",
  email: "meloi@example.test",
  role: UserRole.RESPONDER,
  isActive: true,
  createdAt,
};

const incidentInput: CreateIncidentInput = {
  title: "Suspicious OAuth Application Access",
  summary: "Fictional accounts authorized an unknown application.",
  description: "Investigate the simulated consent activity and contain access.",
  severity: IncidentSeverity.HIGH,
  commanderId: commander.id,
  createdById: commander.id,
};

const incident: Incident = {
  id: "incident-1",
  ...incidentInput,
  status: IncidentStatus.CONTAINED,
  reportedAt: createdAt,
  createdAt,
  updatedAt: createdAt,
  containedAt: createdAt,
};

const action: ResponseAction = {
  id: "action-1",
  incidentId: incident.id,
  title: "Revoke suspicious sessions",
  description: "Revoke the sessions associated with the fictional accounts.",
  status: ResponseActionStatus.COMPLETED,
  priority: 1,
  proposedById: responder.id,
  assignedToId: responder.id,
  approvedById: commander.id,
  createdAt,
  startedAt: createdAt,
  completedAt: createdAt,
};

const evidence: Evidence = {
  id: "evidence-1",
  incidentId: incident.id,
  title: "OAuth consent alert",
  description: "A fictional alert showing unusual application consent activity.",
  type: EvidenceType.ALERT,
  isRevealed: true,
  createdAt,
  revealedAt: createdAt,
  revealedById: commander.id,
};

function getById<T extends { id: string }>(
  items: readonly T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id);
}

const incidentSummary: IncidentSummary = incident;
const incidentResponse: ApiResponse<Incident> = {
  success: true,
  data: incident,
};
const usersById: EntityById<User> = {
  [commander.id]: commander,
  [responder.id]: responder,
};
const roleCount: RoleCount = {
  [UserRole.RESPONDER]: 1,
  [UserRole.INCIDENT_COMMANDER]: 1,
};

console.log(incidentSummary);
console.log(incidentResponse.data.title);
console.log(getById([evidence], evidence.id)?.title);
console.log(usersById[responder.id]?.name);
console.log(roleCount);
console.log(
  canTransitionIncident(IncidentStatus.DETECTED, IncidentStatus.TRIAGING),
);
console.log(
  canTransitionResponseAction(
    ResponseActionStatus.PROPOSED,
    ResponseActionStatus.APPROVED,
  ),
);
console.log(canResolveIncident(incident, [action]));
