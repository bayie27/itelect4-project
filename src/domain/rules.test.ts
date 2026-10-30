import { describe, expect, it } from "vitest";
import {
  canResolveIncident,
  canTransitionIncident,
  canTransitionResponseAction,
} from "./rules";
import { IncidentStatus, ResponseActionStatus } from "../types";

describe("CIRS lifecycle rules", () => {
  it("allows the next incident transition and rejects skipped stages", () => {
    expect(
      canTransitionIncident(IncidentStatus.DETECTED, IncidentStatus.TRIAGING),
    ).toBe(true);
    expect(
      canTransitionIncident(IncidentStatus.DETECTED, IncidentStatus.RESOLVED),
    ).toBe(false);
  });

  it("allows the documented incident regression and keeps resolved terminal", () => {
    expect(
      canTransitionIncident(IncidentStatus.CONTAINED, IncidentStatus.INVESTIGATING),
    ).toBe(true);
    expect(
      canTransitionIncident(IncidentStatus.RESOLVED, IncidentStatus.INVESTIGATING),
    ).toBe(false);
  });

  it("allows only valid response-action transitions", () => {
    expect(
      canTransitionResponseAction(
        ResponseActionStatus.PROPOSED,
        ResponseActionStatus.APPROVED,
      ),
    ).toBe(true);
    expect(
      canTransitionResponseAction(
        ResponseActionStatus.PROPOSED,
        ResponseActionStatus.IN_PROGRESS,
      ),
    ).toBe(false);
  });

  it("resolves only contained incidents with completed or rejected actions", () => {
    const incident = { id: "incident-gt6-001", status: IncidentStatus.CONTAINED };
    const finalActions = [
      { incidentId: incident.id, status: ResponseActionStatus.COMPLETED },
      { incidentId: incident.id, status: ResponseActionStatus.REJECTED },
    ];

    expect(canResolveIncident(incident, finalActions)).toBe(true);
    expect(
      canResolveIncident(incident, [
        ...finalActions,
        { incidentId: incident.id, status: ResponseActionStatus.IN_PROGRESS },
      ]),
    ).toBe(false);
    expect(
      canResolveIncident(
        { ...incident, status: IncidentStatus.INVESTIGATING },
        finalActions,
      ),
    ).toBe(false);
  });
});
