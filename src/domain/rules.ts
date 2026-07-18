import {
  IncidentStatus,
  ResponseActionStatus,
  type Incident,
  type ResponseAction,
} from "../types/index";

export const validIncidentTransitions: Readonly<
  Record<IncidentStatus, readonly IncidentStatus[]>
> = {
  [IncidentStatus.DETECTED]: [IncidentStatus.TRIAGING],
  [IncidentStatus.TRIAGING]: [IncidentStatus.INVESTIGATING],
  [IncidentStatus.INVESTIGATING]: [IncidentStatus.CONTAINED],
  [IncidentStatus.CONTAINED]: [
    IncidentStatus.INVESTIGATING,
    IncidentStatus.RESOLVED,
  ],
  [IncidentStatus.RESOLVED]: [],
};

export const validResponseActionTransitions: Readonly<
  Record<ResponseActionStatus, readonly ResponseActionStatus[]>
> = {
  [ResponseActionStatus.PROPOSED]: [
    ResponseActionStatus.APPROVED,
    ResponseActionStatus.REJECTED,
  ],
  [ResponseActionStatus.APPROVED]: [ResponseActionStatus.IN_PROGRESS],
  [ResponseActionStatus.IN_PROGRESS]: [ResponseActionStatus.COMPLETED],
  [ResponseActionStatus.COMPLETED]: [],
  [ResponseActionStatus.REJECTED]: [],
};

export function canTransitionIncident(
  currentStatus: IncidentStatus,
  nextStatus: IncidentStatus,
): boolean {
  return validIncidentTransitions[currentStatus].includes(nextStatus);
}

export function canTransitionResponseAction(
  currentStatus: ResponseActionStatus,
  nextStatus: ResponseActionStatus,
): boolean {
  return validResponseActionTransitions[currentStatus].includes(nextStatus);
}

export function canResolveIncident(
  incident: Pick<Incident, "id" | "status">,
  actions: readonly Pick<ResponseAction, "incidentId" | "status">[],
): boolean {
  if (incident.status !== IncidentStatus.CONTAINED) {
    return false;
  }

  return actions
    .filter((action) => action.incidentId === incident.id)
    .every(
      (action) =>
        action.status === ResponseActionStatus.COMPLETED ||
        action.status === ResponseActionStatus.REJECTED,
    );
}
