import type { MouseEventHandler } from "react";
import type { Incident } from "../types";

export interface IncidentCardProps {
  incident: Incident;
  onOpen: (incident: Incident) => void;
}

export function IncidentCard({ incident, onOpen }: IncidentCardProps) {
  const handleOpen: MouseEventHandler<HTMLButtonElement> = () => {
    onOpen(incident);
  };

  return (
    <article className="card">
      <h3>{incident.title}</h3>
      <p>{incident.summary}</p>
      <p>Status: {incident.status}</p>
      <p>Severity: {incident.severity}</p>
      <button className="button" type="button" onClick={handleOpen}>
        Open incident
      </button>
    </article>
  );
}
