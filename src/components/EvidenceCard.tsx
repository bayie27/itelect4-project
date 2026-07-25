import type { Evidence } from "../types";

export interface EvidenceCardProps {
  evidence: Evidence;
  onReveal: (evidence: Evidence) => void;
}

export function EvidenceCard({ evidence, onReveal }: EvidenceCardProps) {
  return (
    <article className="card">
      <h3>{evidence.title}</h3>
      <p>Type: {evidence.type}</p>
      <p>
        {evidence.isRevealed ? evidence.description : "This evidence is hidden."}
      </p>
      <button
        className="button"
        type="button"
        onClick={() => onReveal(evidence)}
        disabled={evidence.isRevealed}
      >
        {evidence.isRevealed ? "Evidence revealed" : "Reveal evidence"}
      </button>
    </article>
  );
}
