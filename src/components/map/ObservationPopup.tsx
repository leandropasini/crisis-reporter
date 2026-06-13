import { useTranslation } from "react-i18next";
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

const DAMAGE_COLOR: Record<string, string> = {
  minimal:  "var(--color-minimal)",
  partial:  "var(--color-warning)",
  severe:   "var(--color-critical)",
  complete: "var(--color-critical)",
};

interface Props {
  observation: PopupObservation;
}

export default function ObservationPopup({ observation: obs }: Props) {
  const { t } = useTranslation();

  const ago = (() => {
    const ms = Date.now() - new Date(obs.client_created_at).getTime();
    const h = Math.floor(ms / 3_600_000);
    if (h < 1) return t("observation.time_minutes", { n: Math.floor(ms / 60_000) });
    if (h < 24) return t("observation.time_hours", { n: h });
    return t("observation.time_days", { n: Math.floor(h / 24) });
  })();

  return (
    <div style={{ width: 220, fontFamily: "system-ui, sans-serif", color: "var(--color-text-primary)" }}>
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
          backgroundColor: `color-mix(in srgb, ${DAMAGE_COLOR[obs.damage_level]} 13%, transparent)`,
          color: DAMAGE_COLOR[obs.damage_level],
          border: `1px solid color-mix(in srgb, ${DAMAGE_COLOR[obs.damage_level]} 33%, transparent)`,
        }}>
          {t(`observation.damage_${obs.damage_level}`)}
        </span>

        {/* Confidence badge */}
        <span style={{
          padding: "2px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 500,
          backgroundColor: "var(--color-border)",
          color: "var(--color-text-secondary)",
        }}>
          {t("observation.conf", { confidence: obs.confidence })}
        </span>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-muted)" }}>
        <span>{t(`enum.infra_${obs.infrastructure_type}`)}</span>
        <span>{ago}</span>
      </div>
    </div>
  );
}
