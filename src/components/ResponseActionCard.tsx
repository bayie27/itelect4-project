import type { ResponseAction } from "../types";

export interface ResponseActionCardProps {
  action: ResponseAction;
  onAdvance: (action: ResponseAction) => void;
}

export function ResponseActionCard({ action, onAdvance }: ResponseActionCardProps) {
  return (
    <article className="card">
      <h3>{action.title}</h3>
      <p>{action.description}</p>
      <p>Priority: {action.priority}</p>
      <p>Status: {action.status}</p>
      <button className="button" type="button" onClick={() => onAdvance(action)}>
        Review action
      </button>
    </article>
  );
}
