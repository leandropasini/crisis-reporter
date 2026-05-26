import type { DamageLevel, InfrastructureType, ObservationSource } from "../../types/schema";

const DAMAGE_LEVELS: DamageLevel[] = ["minimal", "partial", "complete"];
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

const INFRA_OPTIONS: Array<{ value: InfrastructureType | "all"; label: string }> = [
  { value: "all",              label: "All types" },
  { value: "residential",      label: "Residential" },
  { value: "commercial",       label: "Commercial" },
  { value: "government",       label: "Government" },
  { value: "utility",          label: "Utility" },
  { value: "transport_comm",   label: "Transport / Comm" },
  { value: "community",        label: "Community" },
  { value: "public_recreation",label: "Public Recreation" },
  { value: "school",           label: "School" },
  { value: "health_center",    label: "Health Center" },
  { value: "bridge",           label: "Bridge" },
  { value: "power_station",    label: "Power Station" },
  { value: "other",            label: "Other" },
];

const SOURCE_OPTIONS: Array<{ value: ObservationSource | "all"; label: string }> = [
  { value: "all",       label: "All sources" },
  { value: "citizen",   label: "Citizen" },
  { value: "drone",     label: "Drone" },
  { value: "satellite", label: "Satellite" },
  { value: "sensor",    label: "Sensor" },
];

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
  border: "1px solid #2a2a28",
  background: "#1e1e1c",
  color: "#f5f5f4",
  fontSize: 12,
  appearance: "none",
  cursor: "pointer",
  outline: "none",
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  color: "#6b6b68",
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
  return (
    <aside style={{
      width: 224,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid #2a2a28",
      padding: "20px 16px",
      gap: 22,
      overflowY: "auto",
    }}>
      {/* Title */}
      <div>
        <p style={{ fontSize: 10, color: "#6b6b68", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
          Crisis Reporter
        </p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#f5f5f4" }}>Agent Dashboard</p>
      </div>

      {/* Total */}
      <div style={{ background: "#1e1e1c", borderRadius: 10, padding: "12px 14px", border: "1px solid #2a2a28" }}>
        <p style={{ ...SECTION_LABEL, marginBottom: 6 }}>Total reports</p>
        <p style={{ fontSize: 26, fontWeight: 700, color: "#f5f5f4", lineHeight: 1 }}>
          {loading ? "—" : totalCount}
        </p>
      </div>

      {/* Map mode toggle */}
      <div>
        <p style={SECTION_LABEL}>Map view</p>
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
                  border: `1px solid ${active ? "#e86c2c88" : "#2a2a28"}`,
                  background: active ? "#e86c2c22" : "transparent",
                  color: active ? "#e86c2c" : "#6b6b68",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Damage level chips */}
      <div>
        <p style={SECTION_LABEL}>Damage level</p>
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
                  border: `1px solid ${active ? color + "55" : "#2a2a28"}`,
                  background: active ? color + "18" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? color : "#2a2a28", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: active ? "#f5f5f4" : "#6b6b68", fontWeight: 500 }}>
                    {DAMAGE_LABEL[lvl]}
                  </span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? color : "#6b6b68" }}>
                  {loading ? "—" : damageCounts[lvl]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Infrastructure type dropdown */}
      <div>
        <p style={SECTION_LABEL}>Infrastructure type</p>
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
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b6b68", fontSize: 10 }}>▾</span>
        </div>
      </div>

      {/* Source dropdown */}
      <div>
        <p style={SECTION_LABEL}>Source</p>
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
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b6b68", fontSize: 10 }}>▾</span>
        </div>
      </div>

      {/* Export + footer */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {exportSlot}
        <p style={{ fontSize: 11, color: "#6b6b68" }}>
          Showing {filteredCount} of {totalCount} reports
        </p>
      </div>
    </aside>
  );
}
