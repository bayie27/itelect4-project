import {
  ResponseActionStatus,
  type CreateResponseActionInput,
  type Evidence,
  type Incident,
  type ResponseAction,
} from "../types";

export const API_URL = "http://localhost:3001";

async function readJson<T>(response: Response, errorMessage: string): Promise<T> {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export async function fetchIncidents(): Promise<Incident[]> {
  const response = await fetch(`${API_URL}/incidents`);
  return readJson<Incident[]>(response, "Could not load incidents.");
}

export async function fetchIncidentById(incidentId: string): Promise<Incident> {
  const response = await fetch(`${API_URL}/incidents/${incidentId}`);
  return readJson<Incident>(response, `No incident found for id "${incidentId}".`);
}

export async function fetchEvidence(): Promise<Evidence[]> {
  const response = await fetch(`${API_URL}/evidence`);
  return readJson<Evidence[]>(response, "Could not load evidence.");
}

export async function fetchResponseActions(): Promise<ResponseAction[]> {
  const response = await fetch(`${API_URL}/responseActions`);
  return readJson<ResponseAction[]>(response, "Could not load response actions.");
}

export async function createResponseAction(
  input: CreateResponseActionInput,
): Promise<ResponseAction> {
  const response = await fetch(`${API_URL}/responseActions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      status: ResponseActionStatus.PROPOSED,
      createdAt: new Date().toISOString(),
    }),
  });

  return readJson<ResponseAction>(response, "Could not save the response action.");
}
