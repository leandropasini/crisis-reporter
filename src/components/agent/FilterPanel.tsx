import { useTranslation } from "react-i18next";
import type { DamageLevel, InfrastructureType, ObservationSource } from "../../types/schema";

const DAMAGE_LEVELS: DamageLevel[] = ["minimal", "partial", "complete"];
const DAMAGE_COLOR: Record<DamageLevel, string> = {
  minimal:  "var(--color-minimal)",
  partial:  "var(--color-warning)",
  complete: "var(--color-critical)",
};

export type MapMode = "clusters" | "heatmap";

export interface FilterState {
  damageLevels: Set<DamageLevel>;
  infraType: InfrastructureType | "all";
  source: ObservationSource | "all";
  mapMode: MapMode;
}

interface Props {
  filters: FilterState;
  totalCount: number;
  filteredCount: number;
  loading: boolean;
  damageCounts: Record<DamageLevel, number>;
  onToggleDamage: (level: DamageLevel) => void;
  onInfraChange: (v: InfrastructureType | "all") => void;
  onSourceChange: (v: ObservationSource | "all") => void;
  onMapModeChange: (v: MapMode) => void;
  exportSlot?: React.ReactNode;
}

const SELECT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-2)",
  color: "var(--color-text-primary)",
  fontSize: 12,
  appearance: "none",
  cursor: "pointer",
  outline: "none",
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  color: "var(--color-text-muted)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  marginBottom: 8,
};

export default function FilterPanel({
  filters,
  totalCount,
  filteredCount,
  loading,
  damageCounts,
  onToggleDamage,
  onInfraChange,
  onSourceChange,
  onMapModeChange,
  exportSlot,
}: Props) {
  const { t } = useTranslation();

  const DAMAGE_LABEL: Record<DamageLevel, string> = {
    minimal:  t("dashboard.damage_minimal"),
    partial:  t("dashboard.damage_partial"),
    complete: t("dashboard.damage_complete"),
  };

  const INFRA_OPTIONS: Array<{ value: InfrastructureType | "all"; label: string }> = [
    { value: "all",               label: t("dashboard.infra_all")           },
    { value: "residential",       label: t("dashboard.infra_residential")   },
    { value: "commercial",        label: t("dashboard.infra_commercial")    },
    { value: "government",        label: t("dashboard.infra_government")    },
    { value: "utility",           label: t("dashboard.infra_utility")       },
    { value: "transport_comm",    label: t("dashboard.infra_transport_comm") },
    { value: "community",         label: t("dashboard.infra_community")     },
    { value: "public_recreation", label: t("dashboard.infra_recreation")    },
    { value: "school",            label: t("dashboard.infra_school")        },
    { value: "health_center",     label: t("dashboard.infra_health_center") },
    { value: "bridge",            label: t("dashboard.infra_bridge")        },
    { value: "power_station",     label: t("dashboard.infra_power_station") },
    { value: "other",             label: t("dashboard.infra_other")         },
  ];

  const SOURCE_OPTIONS: Array<{ value: ObservationSource | "all"; label: string }> = [
    { value: "all",       label: t("dashboard.source_all")       },
    { value: "citizen",   label: t("dashboard.source_citizen")   },
    { value: "drone",     label: t("dashboard.source_drone")     },
    { value: "satellite", label: t("dashboard.source_satellite") },
    { value: "sensor",    label: t("dashboard.source_sensor")    },
  ];

  return (
    <aside style={{
      width: 224,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid var(--color-border)",
      padding: "20px 16px",
      gap: 22,
      overflowY: "auto",
    }}>
      {/* Title */}
      <div>
        <p style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
          {t("dashboard.app_name")}
        </p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>{t("dashboard.title")}</p>
      </div>

      {/* Total */}
      <div style={{ background: "var(--color-surface-2)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
        <p style={{ ...SECTION_LABEL, marginBottom: 6 }}>{t("dashboard.total_reports")}</p>
        <p style={{ fontSize: 26, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1 }}>
          {loading ? "—" : totalCount}
        </p>
      </div>

      {/* Map mode toggle */}
      <div>
        <p style={SECTION_LABEL}>{t("dashboard.map_view")}</p>
        <div style={{ display: "flex", gap: 6 }}>
          {(["clusters", "heatmap"] as MapMode[]).map((mode) => {
            const active = filters.mapMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onMapModeChange(mode)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 8,
                  border: `1px solid ${active ? "color-mix(in srgb, var(--color-accent) 53%, transparent)" : "var(--color-border)"}`,
                  background: active ? "color-mix(in srgb, var(--color-accent) 13%, transparent)" : "transparent",
                  color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {mode === "clusters" ? t("dashboard.map_clusters") : t("dashboard.map_heatmap")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Damage level chips */}
      <div>
        <p style={SECTION_LABEL}>{t("dashboard.damage_section")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {DAMAGE_LEVELS.map((lvl) => {
            const active = filters.damageLevels.has(lvl);
            const color = DAMAGE_COLOR[lvl];
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onToggleDamage(lvl)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: `1px solid ${active ? `color-mix(in srgb, ${color} 33%, transparent)` : "var(--color-border)"}`,
                  background: active ? `color-mix(in srgb, ${color} 9%, transparent)` : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? color : "var(--color-border)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: active ? "var(--color-text-primary)" : "var(--color-text-muted)", fontWeight: 500 }}>
                    {DAMAGE_LABEL[lvl]}
                  </span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? color : "var(--color-text-muted)" }}>
                  {loading ? "—" : damageCounts[lvl]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Infrastructure type dropdown */}
      <div>
        <p style={SECTION_LABEL}>{t("dashboard.infra_section")}</p>
        <div style={{ position: "relative" }}>
          <select
            value={filters.infraType}
            onChange={(e) => onInfraChange(e.target.value as InfrastructureType | "all")}
            style={SELECT_STYLE}
          >
            {INFRA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-text-muted)", fontSize: 10 }}>▾</span>
        </div>
      </div>

      {/* Source dropdown */}
      <div>
        <p style={SECTION_LABEL}>{t("dashboard.source_section")}</p>
        <div style={{ position: "relative" }}>
          <select
            value={filters.source}
            onChange={(e) => onSourceChange(e.target.value as ObservationSource | "all")}
            style={SELECT_STYLE}
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-text-muted)", fontSize: 10 }}>▾</span>
        </div>
      </div>

      {/* Export + footer */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {exportSlot}
        <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          {t("dashboard.showing", { filtered: filteredCount, total: totalCount })}
        </p>
      </div>
    </aside>
  );
}
