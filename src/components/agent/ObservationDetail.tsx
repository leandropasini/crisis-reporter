import { useTranslation } from "react-i18next";
import type { MappedObservation } from "../map/ClusterLayer";

const DAMAGE_COLOR: Record<string, string> = {
  minimal:  "var(--color-minimal)",
  partial:  "var(--color-warning)",
  severe:   "var(--color-critical)",
  complete: "var(--color-critical)",
};

function formatTs(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleString(locale, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      padding: "2px 9px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      background: `color-mix(in srgb, ${color} 13%, transparent)`,
      color,
      border: `1px solid color-mix(in srgb, ${color} 33%, transparent)`,
      whiteSpace: "nowrap",
    }}>
      {text}
    </span>
  );
}

function Row({ label: lbl, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "9px 0", borderBottom: "1px solid var(--color-border)" }}>
      <span style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0 }}>{lbl}</span>
      <span style={{ fontSize: 12, color: "var(--color-text-primary)", textAlign: "right" }}>{children}</span>
    </div>
  );
}

function TagRow({ label: lbl, tags }: { label: string; tags: string[] }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "9px 0", borderBottom: "1px solid var(--color-border)" }}>
      <span style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0 }}>{lbl}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "flex-end" }}>
        {tags.map((tag, i) => (
          <span key={i} style={{
            padding: "2px 9px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 500,
            background: "var(--color-surface-2)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            whiteSpace: "nowrap",
          }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  observation: MappedObservation;
  onClose: () => void;
}

export default function ObservationDetail({ observation: obs, onClose }: Props) {
  const { t, i18n } = useTranslation();

  const hasModular = obs.modular_fields && Object.values(obs.modular_fields).some((v) =>
    v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  const hasCommunityImpact =
    !!obs.electricity_status || !!obs.health_status || !!(obs.pressing_needs && obs.pressing_needs.length > 0);

  function needLabel(value: string): string {
    if (value.startsWith("other:")) return value.slice("other:".length).trim();
    return t(`community_impact.need_${value}`);
  }

  return (
    <div style={{
      position: "absolute",
      top: 0,
      right: 0,
      width: 300,
      height: "100%",
      background: "var(--color-surface)",
      borderLeft: "1px solid var(--color-border)",
      display: "flex",
      flexDirection: "column",
      zIndex: 1000,
      overflowY: "auto",
      isolation: "isolate",
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0, height: 56, background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px" }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: 18, cursor: "pointer" }}
        >✕</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 0, background: "var(--color-surface)" }}>

        {/* Photo */}
        {obs.photo_url && (
          <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", background: "var(--color-surface-2)", marginBottom: 12 }}>
            <img
              src={obs.photo_url}
              alt={t("observation.photo_alt")}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        {/* Title + damage badge */}
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 10px", lineHeight: 1.4 }}>
          {obs.infrastructure_name}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <Badge text={t(`enum.damage_${obs.damage_level}`)} color={DAMAGE_COLOR[obs.damage_level]} />
        </div>

        {/* Fields */}
        <div style={{ borderTop: "1px solid var(--color-border)" }}>
          <Row label={t("observation.label_type")}>{t(`enum.infra_${obs.infrastructure_type}`)}</Row>
          {obs.debris_clearing_needed !== undefined && (
            <Row label={t("observation.label_debris")}>{obs.debris_clearing_needed ? t("observation.debris_needed") : t("observation.debris_not_needed")}</Row>
          )}
          {obs.crisis_nature && (
            <Row label={t("observation.label_crisis")}>{t(`enum.nature_${obs.crisis_nature}`)}</Row>
          )}
        </div>

        {/* Description */}
        {obs.infrastructure_description && (
          <div style={{ margin: "12px 0 0", padding: "10px 12px", background: "var(--color-surface-2)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{t("observation.notes")}</p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>{obs.infrastructure_description}</p>
          </div>
        )}

        {/* Community impact (citizen-reported) */}
        {hasCommunityImpact && (
          <div style={{ margin: "12px 0 0" }}>
            <p style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{t("community_impact.title")}</p>
            <div style={{ borderTop: "1px solid var(--color-border)" }}>
              {obs.electricity_status && (
                <Row label={t("community_impact.electricity_section")}>{t(`community_impact.electricity_${obs.electricity_status}`)}</Row>
              )}
              {obs.health_status && (
                <Row label={t("community_impact.health_section")}>{t(`community_impact.health_${obs.health_status}`)}</Row>
              )}
              {obs.pressing_needs && obs.pressing_needs.length > 0 && (
                <TagRow label={t("community_impact.needs_section")} tags={obs.pressing_needs.map(needLabel)} />
              )}
            </div>
          </div>
        )}

        {/* Modular field data (legacy contextual-mode fields) */}
        {hasModular && (
          <div style={{ margin: "12px 0 0" }}>
            <p style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{t("observation.field_data")}</p>
            <div style={{ borderTop: "1px solid var(--color-border)" }}>
              {obs.modular_fields!.electricity_condition && (
                <Row label={t("observation.label_electricity")}>{t(`enum.elec_${obs.modular_fields!.electricity_condition}`)}</Row>
              )}
              {obs.modular_fields!.health_services && (
                <Row label={t("observation.label_health")}>{t(`enum.health_${obs.modular_fields!.health_services}`)}</Row>
              )}
              {obs.modular_fields!.pressing_needs && obs.modular_fields!.pressing_needs!.length > 0 && (
                <Row label={t("observation.label_needs")}>{obs.modular_fields!.pressing_needs!.map((n) => t(`enum.need_${n}`)).join(", ")}</Row>
              )}
            </div>
          </div>
        )}

        {/* Location + reported */}
        <div style={{ margin: "12px 0 0", borderTop: "1px solid var(--color-border)" }}>
          {obs.location_method && (
            <Row label={t("observation.label_location")}>{t(`enum.method_${obs.location_method}`)}</Row>
          )}
          <Row label={t("observation.label_coords")}>{obs.lat.toFixed(5)}, {obs.lng.toFixed(5)}</Row>
          <Row label={t("observation.label_reported")}>{formatTs(obs.client_created_at, i18n.language)}</Row>
        </div>
      </div>
    </div>
  );
}
