import type { DamageLevel, InfrastructureType, ObservationSource } from "../../types/schema";

export interface PopupObservation {
  id: string;
  infrastructure_name: string;
  infrastructure_type: InfrastructureType;
  damage_level: DamageLevel;
  source: ObservationSource;
  confidence: number;
  photo_url: string | null;
  client_created_at: string;
}

const DAMAGE_COLOR: Record<DamageLevel, string> = {
  minimal:  "#3ecf8e",
  partial:  "#f59e0b",
  complete: "#e84040",
};

const DAMAGE_LABEL: Record<DamageLevel, string> = {
  minimal:  "Minimal",
  partial:  "Partial",
  complete: "Complete",
};

function label(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  observation: PopupObservation;
}

export default function ObservationPopup({ observation: obs }: Props) {
  const ago = (() => {
    const ms = Date.now() - new Date(obs.client_created_at).getTime();
    const h = Math.floor(ms / 3_600_000);
    if (h < 1) return `${Math.floor(ms / 60_000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  })();

  return (
    <div style={{ width: 220, fontFamily: "system-ui, sans-serif", color: "#f5f5f4" }}>
      {/* Photo thumbnail */}
      {obs.photo_url && (
        <div style={{ margin: "-14px -20px 10px", height: 110, overflow: "hidden", borderRadius: "8px 8px 0 0" }}>
          <img
            src={obs.photo_url}
            alt="observation"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Name */}
      <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 8px", lineHeight: 1.3 }}>
        {obs.infrastructure_name}
      </p>

      {/* Badges row */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {/* Damage badge */}
        <span style={{
          padding: "2px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: `${DAMAGE_COLOR[obs.damage_level]}22`,
          color: DAMAGE_COLOR[obs.damage_level],
          border: `1px solid ${DAMAGE_COLOR[obs.damage_level]}55`,
        }}>
          {DAMAGE_LABEL[obs.damage_level]}
        </span>

        {/* Confidence badge */}
        <span style={{
          padding: "2px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 500,
          backgroundColor: "#2a2a28",
          color: "#a8a8a5",
        }}>
          {obs.confidence}% conf.
        </span>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b6b68" }}>
        <span>{label(obs.infrastructure_type)}</span>
        <span>{ago}</span>
      </div>
    </div>
  );
}
