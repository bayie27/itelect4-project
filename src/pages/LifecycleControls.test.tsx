import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchIncidentById,
  fetchIncidents,
  fetchResponseActions,
  rejectResponseAction,
  transitionIncidentStatus,
} from "../api/client";
import { IncidentPage } from "./IncidentPage";
import { ActionsPage } from "./ActionsPage";
import { useAuthStore } from "../store/authStore";
import {
  IncidentSeverity,
  IncidentStatus,
  ResponseActionStatus,
  UserRole,
  type Incident,
  type ResponseAction,
} from "../types";

vi.mock("../api/client", () => ({
  fetchIncidentById: vi.fn(),
  fetchIncidents: vi.fn(),
  fetchResponseActions: vi.fn(),
  rejectResponseAction: vi.fn(),
  transitionIncidentStatus: vi.fn(),
}));

const demoIncident: Incident = {
  id: "incident-demo-001",
  title: "Fictional mail gateway alert",
  summary: "A training mailbox alert awaits triage.",
  description: "This is a fictional training incident.",
  severity: IncidentSeverity.HIGH,
  status: IncidentStatus.DETECTED,
  reportedAt: "2026-10-10T08:30:00.000Z",
  commanderId: "commander-demo-001",
  createdById: "commander-demo-001",
  createdAt: "2026-10-10T08:30:00.000Z",
  updatedAt: "2026-10-10T08:30:00.000Z",
};

const proposedAction: ResponseAction = {
  id: "action-demo-001",
  incidentId: demoIncident.id,
  title: "Review training account consent activity",
  description: "Check fictional accounts for unusual OAuth consent activity.",
  status: ResponseActionStatus.PROPOSED,
  priority: 2,
  proposedById: "commander-demo-001",
  createdAt: "2026-10-10T08:35:00.000Z",
};

function renderWithQuery(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function signInAsCommander(): void {
  useAuthStore.getState().login("fictional-demo-token", {
    id: "commander-demo-001",
    name: "Professor X",
    email: "professor.x.cirs.demo@example.test",
    role: UserRole.INCIDENT_COMMANDER,
    isActive: true,
    createdAt: "2026-10-10T08:00:00.000Z",
  });
}

afterEach(() => {
  useAuthStore.getState().logout();
  vi.restoreAllMocks();
});

describe("incident lifecycle controls", () => {
  it("offers only the next valid incident transition", async () => {
    signInAsCommander();
    vi.mocked(fetchIncidentById).mockResolvedValue(demoIncident);
    vi.mocked(fetchResponseActions).mockResolvedValue([proposedAction]);
    vi.mocked(transitionIncidentStatus).mockResolvedValue({
      ...demoIncident,
      status: IncidentStatus.TRIAGING,
    });
    const user = userEvent.setup();

    renderWithQuery(
      <MemoryRouter initialEntries={[`/incidents/${demoIncident.id}`]}>
        <Routes>
          <Route path="/incidents/:incidentId" element={<IncidentPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("button", { name: "Move to triaging" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Move to resolved" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Move to triaging" }));
    expect(transitionIncidentStatus).toHaveBeenCalledWith(demoIncident.id, IncidentStatus.TRIAGING);
  });

  it("keeps resolution disabled while a response action is open", async () => {
    signInAsCommander();
    vi.mocked(fetchIncidentById).mockResolvedValue({
      ...demoIncident,
      status: IncidentStatus.CONTAINED,
    });
    vi.mocked(fetchResponseActions).mockResolvedValue([proposedAction]);

    renderWithQuery(
      <MemoryRouter initialEntries={[`/incidents/${demoIncident.id}`]}>
        <Routes>
          <Route path="/incidents/:incidentId" element={<IncidentPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("button", { name: "Move to resolved" })).toBeDisabled();
    expect(screen.getByText(/reject or complete all response actions/i)).toBeInTheDocument();
  });
});

describe("response-action rejection", () => {
  it("updates the displayed action status after a successful rejection", async () => {
    signInAsCommander();
    const rejectedAction = { ...proposedAction, status: ResponseActionStatus.REJECTED };
    vi.mocked(fetchIncidents).mockResolvedValue([demoIncident]);
    vi.mocked(fetchResponseActions)
      .mockResolvedValueOnce([proposedAction])
      .mockResolvedValue([rejectedAction]);
    vi.mocked(rejectResponseAction).mockResolvedValue(rejectedAction);
    const user = userEvent.setup();

    renderWithQuery(<ActionsPage />);
    await user.click(await screen.findByRole("button", { name: "Reject proposal" }));

    expect(await screen.findByText((_content, element) => element?.textContent === "Status: rejected"))
      .toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject proposal" })).not.toBeInTheDocument();
  });

  it("lets a commander reject a proposed action and displays API errors", async () => {
    signInAsCommander();
    vi.mocked(fetchIncidents).mockResolvedValue([demoIncident]);
    vi.mocked(fetchResponseActions).mockResolvedValue([proposedAction]);
    vi.mocked(rejectResponseAction).mockRejectedValue(new Error("Action could not be rejected."));
    const user = userEvent.setup();

    renderWithQuery(<ActionsPage />);

    await user.click(await screen.findByRole("button", { name: "Reject proposal" }));

    expect(rejectResponseAction).toHaveBeenCalledWith(proposedAction.id, expect.anything());
    expect(await screen.findByRole("alert")).toHaveTextContent("Action could not be rejected.");
  });
});
