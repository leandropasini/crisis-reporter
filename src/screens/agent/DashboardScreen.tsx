import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconChevronRight, IconSettings } from "@tabler/icons-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { supabase, isSupabaseConfigured } from "../../services/supabase";
import ClusterLayer, { type MappedObservation } from "../../components/map/ClusterLayer";
import HeatmapLayer from "../../components/map/HeatmapLayer";
import ObservationDetail from "../../components/agent/ObservationDetail";
import ExportButton from "../../components/agent/ExportButton";
import LanguageSelector from "../../components/LanguageSelector";
import BottomNav from "../../components/BottomNav";
import { useCrisisMode } from "../../contexts/CrisisModeContext";
import "../../components/map/map.css";
import type { DamageLevel, InfrastructureType, DisasterType } from "../../types/schema";
import { DISASTER_TYPE_LABELS } from "../../constants/disasterDamage";

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
  severe:   "#F59E0B",
  complete: "#EF4444",
};

type QuickFilter = "all" | "critical" | "health" | "education";


function CrisisSettingsModal({
  onClose,
  disasterType,
  onDisasterTypeChange,
  isDemo,
  onEndCrisis,
}: {
  onClose: () => void;
  disasterType: DisasterType;
  onDisasterTypeChange: (t: DisasterType) => void;
  isDemo: boolean;
  onEndCrisis?: () => void;
}) {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [confirming, setConfirming] = useState(false);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          maxHeight: "85dvh",
          background: "var(--cr-bg)",
          borderRadius: "24px 24px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--cr-border)",
            flexShrink: 0,
          }}
        >
          <div>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--cr-label)", fontWeight: 600, margin: 0 }}>
              {t("dashboard.title")}
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--cr-text)", margin: "4px 0 0" }}>
              {t("dashboard.settings_title")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid var(--cr-border)",
              background: "var(--cr-surface)",
              color: "var(--cr-label)",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 32px" }}>
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cr-label)", fontWeight: 700, marginBottom: 6 }}>
              {t("dashboard.disaster_type")}
            </p>
            {isDemo && (
              <p style={{ fontSize: 12, color: "var(--cr-primary)", marginBottom: 12, opacity: 0.9 }}>
                {t("dashboard.locked_demo")}
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(Object.keys(DISASTER_TYPE_LABELS) as DisasterType[]).map((type) => {
                const active = disasterType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => !isDemo && onDisasterTypeChange(type)}
                    disabled={isDemo}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 24,
                      border: `1px solid ${active ? "var(--cr-primary)" : "var(--cr-border)"}`,
                      background: active ? "var(--cr-primary-dim)" : "var(--cr-surface)",
                      color: active ? "var(--cr-primary)" : isDemo ? "var(--cr-border)" : "var(--cr-label)",
                      fontSize: 14,
                      fontWeight: active ? 700 : 400,
                      cursor: isDemo ? "default" : "pointer",
                      minHeight: "var(--min-touch)",
                      transition: "all 0.15s",
                      opacity: isDemo && !active ? 0.45 : 1,
                    }}
                  >
                    {DISASTER_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* End Crisis — live mode only */}
          {!isDemo && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--cr-border)" }}>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cr-label)", fontWeight: 700, marginBottom: 12 }}>
                {t("dashboard.danger_zone")}
              </p>
              {!confirming ? (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  style={{
                    width: "100%",
                    minHeight: "var(--min-touch)",
                    borderRadius: 14,
                    border: "1px solid rgba(239,68,68,0.4)",
                    background: "rgba(239,68,68,0.08)",
                    color: "#EF4444",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("dashboard.end_crisis")}
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 14, color: "var(--cr-text)", margin: 0 }}>
                    {t("dashboard.end_crisis_confirm")}
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      style={{
                        flex: 1,
                        minHeight: "var(--min-touch)",
                        borderRadius: 14,
                        border: "1px solid var(--cr-border)",
                        background: "var(--cr-surface)",
                        color: "var(--cr-label)",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t("dashboard.cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEndCrisis?.()}
                      style={{
                        flex: 1,
                        minHeight: "var(--min-touch)",
                        borderRadius: 14,
                        border: "none",
                        background: "#EF4444",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t("dashboard.confirm")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

interface Props {
  crisisId?: string;
  center?: [number, number];
  zoom?: number;
  onGoHome?: () => void;
  onGoMap?: () => void;
  onEndCrisis?: () => void;
  isDemo?: boolean;
}

export default function DashboardScreen({
  crisisId = "",
  center = [-30.029, -51.228],
  zoom = 13,
  onGoHome,
  onGoMap,
  onEndCrisis,
  isDemo = false,
}: Props) {
  const { t } = useTranslation();
  const [observations, setObservations] = useState<MappedObservation[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { console.log('[DEBUG] Dashboard loaded with crisisId:', crisisId); }, []);
  const { mode: _mode } = useCrisisMode();
  const [selectedObs, setSelectedObs] = useState<MappedObservation | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [mapMode, setMapMode] = useState<"clusters" | "heatmap">("clusters");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [showSettings, setShowSettings] = useState(false);
  const [disasterType, setDisasterType] = useState<DisasterType>(isDemo ? "flood" : "generic");
  const [crisisTitle, setCrisisTitle] = useState(
    isDemo ? "RS Floods 2024 · Porto Alegre" : "Active Crisis"
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  useEffect(() => {
    if (isDemo || !isSupabaseConfigured) return;
    async function fetchCrisisConfig() {
      console.log('[MAP-DEBUG] fetchCrisisConfig running, crisisId:', crisisId);
      try {
        const { data, error } = await db
          .from("crises")
          .select("disaster_type, name, location_name, bbox_sw_lat, bbox_sw_lng")
          .eq("id", crisisId)
          .single() as { data: { disaster_type: string; name: string; location_name: string; bbox_sw_lat: number | null; bbox_sw_lng: number | null } | null; error: unknown };
        console.log('[MAP-DEBUG] crisis coords from DB:', (data as any)?.bbox_sw_lat, (data as any)?.bbox_sw_lng);
        console.log('[MAP-DEBUG] full row:', data, 'error:', error);
        if (data?.disaster_type) {
          setDisasterType(data.disaster_type as DisasterType);
        }
        if (data) {
          const title = [data.name, data.location_name].filter(Boolean).join(" · ");
          if (title) setCrisisTitle(title);
          const lat = data.bbox_sw_lat;
          const lng = data.bbox_sw_lng;
          const hasCoords = lat != null && lng != null && !(lat === 0 && lng === 0);
          if (hasCoords) {
            const newCenter: [number, number] = [lat!, lng!];
            console.log('[MAP-DEBUG] mapCenter set to:', newCenter);
            setMapCenter(newCenter);
            setMapZoom(13);
          } else {
            console.log('[MAP-DEBUG] no valid coords — world view');
            setMapCenter([0, 0]);
            setMapZoom(2);
          }
        } else {
          console.log('[MAP-DEBUG] data is null — no row returned');
        }
      } catch (err) {
        console.log('[MAP-DEBUG] fetchCrisisConfig threw:', err);
      }
    }
    fetchCrisisConfig();
  }, [crisisId]);

  async function handleDisasterTypeChange(newType: DisasterType) {
    setDisasterType(newType);
    if (!isSupabaseConfigured) return;
    try {
      await db.from("crises").update({ disaster_type: newType }).eq("id", crisisId);
    } catch {
      // UI updated; DB failure is non-fatal for demo purposes
    }
  }

  async function handleEndCrisis() {
    if (!isSupabaseConfigured || !crisisId) return;
    try {
      await db.from("crises").update({ status: "closed" }).eq("id", crisisId);
      onEndCrisis?.();
    } catch {
      // leave dashboard open; non-fatal
    }
  }

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

        if (!error && data) {
          const mapped = (data as any[]).map((r) => ({ ...r, lat: r.latitude, lng: r.longitude }));
          setObservations(mapped);
        } else {
          setObservations(isDemo ? DEMO_OBSERVATIONS : []);
        }
      } catch {
        setObservations(isDemo ? DEMO_OBSERVATIONS : []);
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
      case "critical":  return obs.filter(
        (o) => (o.damage_level as string) === "complete" || (o.damage_level as string) === "severe" || o.damage_level === "partial"
      );
      case "health":    return obs.filter((o) => o.infrastructure_type === "community");
      case "education": return obs.filter((o) => o.infrastructure_type === "public_recreation");
      default: return obs;
    }
  }

  const filtered = applyQuickFilter(observations);

  const totalCount    = observations.length;
  const criticalCount = observations.filter(
    (o) => (o.damage_level as string) === "complete" || (o.damage_level as string) === "severe" || o.damage_level === "partial"
  ).length;
  const since6h       = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const last6hCount   = observations.filter((o) => o.client_created_at >= since6h).length;

  const criticalList = [...observations]
    .filter((o) => (o.damage_level as string) === "complete" || (o.damage_level as string) === "severe" || o.damage_level === "partial")
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
    { id: "all",       label: t("dashboard.filter_all") },
    { id: "critical",  label: t("dashboard.filter_critical") },
    { id: "health",    label: t("dashboard.filter_health") },
    { id: "education", label: t("dashboard.filter_education") },
  ];

  const mapArea = (
    // Outer wrapper: position:relative, NO overflow:hidden — toggle can escape freely
    <div style={{ position: "relative", height: 220, flexShrink: 0 }}>
      {/* Inner wrapper: overflow:hidden for border-radius clipping. pointer-events:none on desktop prevents escaped Leaflet panes from eating main-map clicks. */}
      <div style={{ borderRadius: 16, overflow: "hidden", height: "100%", width: "100%", pointerEvents: isMobile ? "auto" : "none" }}>
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
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <SetView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
      {/* Toggle outside overflow:hidden — positioned relative to outer wrapper */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 100,
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
            {m === "clusters" ? t("dashboard.map_toggle_clusters") : t("dashboard.map_toggle_heat")}
          </button>
        ))}
      </div>
    </div>
  );

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
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
          <span style={{ fontSize: 11, color: "var(--cr-label)" }}>{t("dashboard.metric_total")}</span>
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
          <span style={{ fontSize: 11, color: "var(--cr-label)" }}>{t("dashboard.metric_severe")}</span>
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
          <span style={{ fontSize: 11, color: "var(--cr-label)" }}>{t("dashboard.metric_increasing")}</span>
        </div>
      </div>

      {/* Map */}
      {mapArea}

      {/* Quick filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
          {t("dashboard.critical_section")}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
          {criticalList.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--cr-label)", padding: "12px 0" }}>
              {t("dashboard.no_critical")}
            </p>
          ) : (
            criticalList.map((obs) => {
              const dotColor = DAMAGE_COLORS[obs.damage_level] ?? "var(--cr-label)";
              const isCrit = (obs.damage_level as string) === "complete" || (obs.damage_level as string) === "severe";
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
                  <IconChevronRight size={16} style={{ color: "var(--cr-label)", flexShrink: 0 }} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Base actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
            onClick={() => setShowSettings((v) => !v)}
            style={{
              width: "100%",
              minHeight: "var(--min-touch)",
              borderRadius: 14,
              border: "none",
              background: showSettings ? "var(--cr-surface2)" : "var(--cr-primary)",
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
            <IconSettings size={18} />
            {t("dashboard.settings_button")}
          </button>
        </div>

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
        <div style={{ flexShrink: 0, padding: "14px 20px", borderBottom: "1px solid var(--cr-border)", position: "relative", zIndex: 1001 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--cr-label)", fontWeight: 600 }}>
                {t("dashboard.title")}
              </p>
              <p style={{ fontSize: 17, fontWeight: 700, color: "var(--cr-text)" }}>{crisisTitle}</p>
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
                {t("dashboard.live_badge")}
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
        <BottomNav active="map" onHome={onGoHome} onMap={onGoMap} />
        {showSettings && (
          <CrisisSettingsModal
            onClose={() => setShowSettings(false)}
            disasterType={disasterType}
            onDisasterTypeChange={handleDisasterTypeChange}
            isDemo={isDemo}
            onEndCrisis={handleEndCrisis}
          />
        )}
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
          position: "relative",
          zIndex: 1001,
        }}
      >
        <div>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--cr-label)", fontWeight: 600 }}>
            {t("dashboard.title")}
          </p>
          <p style={{ fontSize: 17, fontWeight: 700, color: "var(--cr-text)" }}>{crisisTitle}</p>
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
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <SetView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={20}
              opacity={0.9}
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
      {showSettings && (
        <CrisisSettingsModal
          onClose={() => setShowSettings(false)}
          disasterType={disasterType}
          onDisasterTypeChange={handleDisasterTypeChange}
          isDemo={isDemo}
          onEndCrisis={handleEndCrisis}
        />
      )}
    </div>
  );
}
