import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer } from "react-leaflet";
import { supabase, isSupabaseConfigured } from "../../services/supabase";
import ClusterLayer, { type MappedObservation } from "../../components/map/ClusterLayer";
import HeatmapLayer from "../../components/map/HeatmapLayer";
import ObservationDetail from "../../components/agent/ObservationDetail";
import ExportButton from "../../components/agent/ExportButton";
import LanguageSelector from "../../components/LanguageSelector";
import BottomNav from "../../components/BottomNav";
import { useCrisisMode } from "../../contexts/CrisisModeContext";
import "../../components/map/map.css";
import type { DamageLevel, InfrastructureType } from "../../types/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const DAMAGE_LEVELS: DamageLevel[] = ["minimal", "partial", "complete"];

const DEMO_OBSERVATIONS: MappedObservation[] = [
  {
    id: "demo-1",
    lat: -30.025, lng: -51.230,
    infrastructure_name: "Escola Municipal — Rua Siqueira Campos",
    infrastructure_type: "school",
    damage_level: "complete",
    source: "citizen",
    confidence: 87,
    photo_url: null,
    client_created_at: new Date(Date.now() - 7_200_000).toISOString(),
    debris_clearing_needed: true,
    infrastructure_description: "Telhado parcialmente destruído. Acesso bloqueado por detritos.",
    version_number: 2,
    location_method: "gps",
    modular_fields: { electricity_condition: "no_service", pressing_needs: ["water", "shelter"] },
    crisis_nature: "natural",
  },
  {
    id: "demo-2",
    lat: -30.031, lng: -51.225,
    infrastructure_name: "Posto de Saúde — Av. Bento Gonçalves",
    infrastructure_type: "health_center",
    damage_level: "partial",
    source: "drone",
    confidence: 72,
    photo_url: null,
    client_created_at: new Date(Date.now() - 3_600_000).toISOString(),
    debris_clearing_needed: false,
    version_number: 1,
    location_method: "gps",
    modular_fields: { health_services: "partially_functional" },
    crisis_nature: "natural",
  },
  {
    id: "demo-3",
    lat: -30.028, lng: -51.222,
    infrastructure_name: "Residência — Rua Garibaldi 340",
    infrastructure_type: "residential",
    damage_level: "minimal",
    source: "citizen",
    confidence: 45,
    photo_url: null,
    client_created_at: new Date(Date.now() - 1_800_000).toISOString(),
    debris_clearing_needed: false,
    version_number: 1,
    location_method: "manual_pin",
    crisis_nature: "natural",
  },
  {
    id: "demo-4",
    lat: -30.033, lng: -51.232,
    infrastructure_name: "Ponte — Arroio Dilúvio",
    infrastructure_type: "bridge",
    damage_level: "complete",
    source: "satellite",
    confidence: 94,
    photo_url: null,
    client_created_at: new Date(Date.now() - 10_800_000).toISOString(),
    debris_clearing_needed: true,
    infrastructure_description: "Colapso total da estrutura. Interdição imediata necessária.",
    version_number: 3,
    location_method: "gps",
    crisis_nature: "natural",
  },
  {
    id: "demo-5",
    lat: -30.027, lng: -51.235,
    infrastructure_name: "Estação de Energia — Subestação Norte",
    infrastructure_type: "power_station",
    damage_level: "partial",
    source: "sensor",
    confidence: 81,
    photo_url: null,
    client_created_at: new Date(Date.now() - 5_400_000).toISOString(),
    debris_clearing_needed: false,
    version_number: 1,
    location_method: "gps",
    modular_fields: { electricity_condition: "moderate_damage" },
    crisis_nature: "natural",
  },
];

const DAMAGE_COLORS: Record<string, string> = {
  minimal:  "#22C55E",
  partial:  "#E8823A",
  complete: "#EF4444",
};

type QuickFilter = "all" | "critical" | "health" | "education";

interface Props {
  crisisId?: string;
  center?: [number, number];
  zoom?: number;
  onGoHome?: () => void;
}

export default function DashboardScreen({
  crisisId = import.meta.env.VITE_DEMO_CRISIS_ID ?? "00000000-0000-0000-0000-000000000001",
  center = [-30.029, -51.228],
  zoom = 13,
  onGoHome,
}: Props) {
  const { t } = useTranslation();
  const [observations, setObservations] = useState<MappedObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { mode: _mode } = useCrisisMode();
  const [selectedObs, setSelectedObs] = useState<MappedObservation | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [mapMode, setMapMode] = useState<"clusters" | "heatmap">("clusters");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    async function fetchObservations() {
      if (!isSupabaseConfigured) {
        setObservations(DEMO_OBSERVATIONS);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await db
          .from("observations")
          .select(
            "id, latitude, longitude, infrastructure_name, infrastructure_type, infrastructure_description, damage_level, debris_clearing_needed, source, confidence, photo_url, client_created_at, version_number, location_method, modular_fields"
          )
          .eq("crisis_id", crisisId)
          .eq("status", "active") as { data: MappedObservation[] | null; error: unknown };

        if (!error && data && data.length > 0) {
          const mapped = (data as any[]).map((r) => ({ ...r, lat: r.latitude, lng: r.longitude }));
          setObservations(mapped);
        } else {
          setObservations(DEMO_OBSERVATIONS);
        }
      } catch {
        setObservations(DEMO_OBSERVATIONS);
      } finally {
        setLoading(false);
      }
    }
    fetchObservations();
  }, [crisisId]);

  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function applyQuickFilter(obs: MappedObservation[]): MappedObservation[] {
    switch (quickFilter) {
      case "critical":  return obs.filter((o) => o.damage_level === "complete" || o.damage_level === "partial");
      case "health":    return obs.filter((o) => o.infrastructure_type === "community");
      case "education": return obs.filter((o) => o.infrastructure_type === "public_recreation");
      default: return obs;
    }
  }

  const filtered = applyQuickFilter(observations);

  const totalCount    = observations.length;
  const criticalCount = observations.filter((o) => o.damage_level === "complete" || o.damage_level === "partial").length;
  const since6h       = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const last6hCount   = observations.filter((o) => o.client_created_at >= since6h).length;

  const criticalList = [...observations]
    .filter((o) => o.damage_level === "complete" || o.damage_level === "partial")
    .sort((a, b) => {
      const priority = (o: MappedObservation) => {
        let score = o.damage_level === "complete" ? 10 : 5;
        if (o.infrastructure_type === "community") score += 3;
        if (o.infrastructure_type === "public_recreation") score += 2;
        return score;
      };
      return priority(b) - priority(a);
    })
    .slice(0, 5);

  const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
    { id: "all",       label: "All levels" },
    { id: "critical",  label: "Critical" },
    { id: "health",    label: "Health" },
    { id: "education", label: "Education" },
  ];

  const mapArea = (
    <div
      style={{
        height: 220,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "var(--cr-surface)",
            border: "1px solid var(--cr-border)",
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 12,
            color: "var(--cr-label)",
          }}
        >
          {t("dashboard.loading")}
        </div>
      )}
      {/* Heat/Cluster toggle */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 1001,
          display: "flex",
          gap: 4,
        }}
      >
        {(["clusters", "heatmap"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMapMode(m)}
            style={{
              padding: "5px 10px",
              borderRadius: 8,
              border: `1px solid ${mapMode === m ? "var(--cr-primary)" : "var(--cr-border)"}`,
              background: mapMode === m ? "var(--cr-primary-dim)" : "rgba(0,0,0,0.6)",
              color: mapMode === m ? "var(--cr-primary)" : "var(--cr-label)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {m === "clusters" ? "Clusters" : "Heat"}
          </button>
        ))}
      </div>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          maxZoom={20}
        />
        {!loading && mapMode === "clusters" && (
          <ClusterLayer observations={filtered} onSelect={setSelectedObs} />
        )}
        {!loading && mapMode === "heatmap" && (
          <HeatmapLayer points={filtered} />
        )}
      </MapContainer>
    </div>
  );

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        padding: "16px 20px",
        gap: 16,
      }}
    >
      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {/* Total */}
        <div
          style={{
            background: "var(--cr-surface)",
            borderRadius: 14,
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "var(--cr-text)", lineHeight: 1 }}>
            {loading ? "—" : totalCount}
          </span>
          <span style={{ fontSize: 11, color: "var(--cr-label)" }}>Total</span>
        </div>

        {/* Critical */}
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 14,
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "#EF4444", lineHeight: 1 }}>
            {loading ? "—" : criticalCount}
          </span>
          <span style={{ fontSize: 11, color: "var(--cr-label)" }}>severe+complete</span>
        </div>

        {/* Last 6h */}
        <div
          style={{
            background: "rgba(232,130,58,0.08)",
            border: "1px solid rgba(232,130,58,0.25)",
            borderRadius: 14,
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "var(--cr-primary)", lineHeight: 1 }}>
            {loading ? "—" : last6hCount}
          </span>
          <span style={{ fontSize: 11, color: "var(--cr-label)" }}>↑ increasing</span>
        </div>
      </div>

      {/* Map */}
      {mapArea}

      {/* Quick filters */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {QUICK_FILTERS.map((f) => {
          const active = quickFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setQuickFilter(f.id)}
              style={{
                flexShrink: 0,
                padding: "8px 16px",
                borderRadius: 20,
                border: `1px solid ${active ? "var(--cr-primary)" : "var(--cr-border)"}`,
                background: active ? "var(--cr-primary-dim)" : "var(--cr-surface)",
                color: active ? "var(--cr-primary)" : "var(--cr-label)",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Critical list */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--cr-label)",
            marginBottom: 10,
          }}
        >
          Most Critical — Act Now
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {criticalList.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--cr-label)", padding: "12px 0" }}>
              No critical reports in current filter
            </p>
          ) : (
            criticalList.map((obs) => {
              const dotColor = DAMAGE_COLORS[obs.damage_level] ?? "var(--cr-label)";
              const isCrit = obs.damage_level === "complete";
              return (
                <button
                  key={obs.id}
                  type="button"
                  onClick={() => setSelectedObs(obs)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "1px solid var(--cr-border)",
                    background: `${dotColor}0a`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "opacity 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: dotColor,
                      flexShrink: 0,
                      animation: isCrit ? "pulse-dot 1.2s ease-in-out infinite" : "none",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--cr-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {obs.infrastructure_name ?? "Unknown"}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--cr-label)", marginTop: 2 }}>
                      {obs.infrastructure_type} · {obs.damage_level}
                    </p>
                  </div>
                  <i className="ti ti-chevron-right" style={{ fontSize: 16, color: "var(--cr-label)", flexShrink: 0 }} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Base actions */}
      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <ExportButton
          crisisId={crisisId}
          filters={{
            damageLevels: new Set<DamageLevel>(DAMAGE_LEVELS),
            infraType: "all" as InfrastructureType | "all",
          }}
          rows={filtered}
        />
        <button
          type="button"
          onClick={() => {/* crisis settings TODO */}}
          style={{
            flex: 1,
            minHeight: "var(--min-touch)",
            borderRadius: 14,
            border: "none",
            background: "var(--cr-primary)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <i className="ti ti-settings" style={{ fontSize: 18 }} />
          Crisis settings
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "var(--cr-bg)",
          color: "var(--cr-text)",
        }}
      >
        {/* Mobile header */}
        <div style={{ flexShrink: 0, padding: "14px 20px", borderBottom: "1px solid var(--cr-border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--cr-label)", fontWeight: 600 }}>
                Agent Dashboard
              </p>
              <p style={{ fontSize: 17, fontWeight: 700, color: "var(--cr-text)" }}>Porto Alegre · RS Floods</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#EF4444",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", animation: "pulse-dot 1s ease-in-out infinite" }} />
                Live
              </span>
              <LanguageSelector variant="inline" />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {content}
        </div>
        {selectedObs && (
          <ObservationDetail observation={selectedObs} onClose={() => setSelectedObs(null)} />
        )}
        <BottomNav active="map" onHome={onGoHome} onMap={undefined} />
      </div>
    );
  }

  // Desktop layout
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--cr-bg)",
        color: "var(--cr-text)",
      }}
    >
      {/* Desktop header */}
      <div
        style={{
          flexShrink: 0,
          padding: "14px 24px",
          borderBottom: "1px solid var(--cr-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--cr-label)", fontWeight: 600 }}>
            Agent Dashboard
          </p>
          <p style={{ fontSize: 17, fontWeight: 700, color: "var(--cr-text)" }}>Porto Alegre · RS Floods</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 20,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              fontSize: 12,
              fontWeight: 600,
              color: "#EF4444",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", animation: "pulse-dot 1s ease-in-out infinite" }} />
            Live
          </span>
          <LanguageSelector variant="inline" />
        </div>
      </div>

      {/* Desktop: sidebar + full map */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 360, flexShrink: 0, overflowY: "auto", borderRight: "1px solid var(--cr-border)" }}>
          {content}
        </div>

        {/* Full map */}
        <main style={{ flex: 1, position: "relative" }}>
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
              maxZoom={20}
            />
            {!loading && mapMode === "clusters" && (
              <ClusterLayer observations={filtered} onSelect={setSelectedObs} />
            )}
            {!loading && mapMode === "heatmap" && (
              <HeatmapLayer points={filtered} />
            )}
          </MapContainer>
          {selectedObs && (
            <ObservationDetail observation={selectedObs} onClose={() => setSelectedObs(null)} />
          )}
        </main>
      </div>
    </div>
  );
}
