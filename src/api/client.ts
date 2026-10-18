import type {
  CreateResponseActionInput,
  Evidence,
  GenerateIncidentReportInput,
  IncidentReport,
  IncidentReportSummary,
  Incident,
  ResponseAction,
  User,
} from "../types";
import { useAuthStore } from "../store/authStore";

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegistrationInput extends LoginInput {
  name: string;
  role: User["role"];
}

function getApiOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_API_URL?.trim();
  if (!configuredOrigin) {
    throw new Error("VITE_API_URL is missing. Set the backend origin in the frontend environment.");
  }

  return configuredOrigin.replace(/\/+$/, "");
}

async function readResponseBody(response: Response): Promise<unknown> {
  const body = await response.text();
  if (!body) return undefined;

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

function getErrorMessage(body: unknown, status: number): string {
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = body.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return `The API request failed with status ${status}.`;
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const authAtRequest = authenticated ? useAuthStore.getState() : null;
  if (authAtRequest?.token) headers.set("Authorization", `Bearer ${authAtRequest.token}`);

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${getApiOrigin()}${normalizedPath}`, { ...init, headers });
  const body = await readResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(body, response.status);
    if (
      response.status === 401 &&
      authAtRequest?.token &&
      useAuthStore.getState().token === authAtRequest.token &&
      useAuthStore.getState().sessionVersion === authAtRequest.sessionVersion
    ) {
      useAuthStore.getState().expireSession(message);
    }
    throw new Error(message);
  }

  return body as T;
}

export function login(input: LoginInput): Promise<AuthSession> {
  return request<AuthSession>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify(input) },
    false,
  );
}

export function register(input: RegistrationInput): Promise<AuthSession> {
  return request<AuthSession>(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify(input) },
    false,
  );
}

export function fetchIncidents(): Promise<Incident[]> {
  return request<Incident[]>("/api/incidents");
}

export function fetchIncidentById(incidentId: string): Promise<Incident> {
  return request<Incident>(`/api/incidents/${encodeURIComponent(incidentId)}`);
}

export async function fetchResponseActions(incidentIds: readonly string[]): Promise<ResponseAction[]> {
  const actionLists = await Promise.all(
    incidentIds.map((incidentId) =>
      request<ResponseAction[]>(`/api/incidents/${encodeURIComponent(incidentId)}/actions`),
    ),
  );
  return actionLists.flat();
}

export function createResponseAction(
  incidentId: string,
  input: Pick<CreateResponseActionInput, "title" | "description" | "priority">,
): Promise<ResponseAction> {
  return request<ResponseAction>(`/api/incidents/${encodeURIComponent(incidentId)}/actions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchEvidence(incidentIds: readonly string[]): Promise<Evidence[]> {
  const evidenceLists = await Promise.all(
    incidentIds.map((incidentId) =>
      request<Evidence[]>(`/api/incidents/${encodeURIComponent(incidentId)}/evidence`),
    ),
  );
  return evidenceLists.flat();
}

export function revealEvidence(evidenceId: string): Promise<Evidence> {
  return request<Evidence>(`/api/evidence/${encodeURIComponent(evidenceId)}/reveal`, {
    method: "PATCH",
  });
}

export function generateIncidentReport(input: GenerateIncidentReportInput): Promise<IncidentReport> {
  return request<IncidentReport>("/api/ai", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchIncidentReports(incidentId: string): Promise<IncidentReportSummary[]> {
  return request<IncidentReportSummary[]>(
    `/api/incidents/${encodeURIComponent(incidentId)}/reports`,
  );
}

export function fetchIncidentReport(reportId: string): Promise<IncidentReport> {
  return request<IncidentReport>(`/api/reports/${encodeURIComponent(reportId)}`);
}
