import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IncidentCard } from "./IncidentCard";
import {
  IncidentSeverity,
  IncidentStatus,
  type Incident,
} from "../types";

const incident: Incident = {
  id: "incident-gt6-001",
  title: "Suspicious OAuth application access",
  summary: "A fictional account approved an unfamiliar application.",
  description: "A training scenario involving a simulated OAuth consent.",
  severity: IncidentSeverity.HIGH,
  status: IncidentStatus.DETECTED,
  reportedAt: "2026-10-24T08:00:00.000Z",
  commanderId: "fictional-commander-001",
  createdById: "fictional-commander-001",
  createdAt: "2026-10-24T08:00:00.000Z",
  updatedAt: "2026-10-24T08:00:00.000Z",
};

describe("IncidentCard", () => {
  it("shows the severity supplied by its incident prop", () => {
    render(<IncidentCard incident={incident} onOpen={() => undefined} />);

    const severityLabel = screen.getByText(
      (_content, element) => element?.textContent === `Severity: ${incident.severity}`,
    );

    expect(severityLabel).toBeInTheDocument();
  });
});
