import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { supabase, isSupabaseConfigured } from "../../services/supabase";
import ClusterLayer, { type MappedObservation } from "../../components/map/ClusterLayer";
import HeatmapLayer from "../../components/map/HeatmapLayer";
import FilterPanel, { type FilterState, type MapMode } from "../../components/agent/FilterPanel";
import ObservationDetail from "../../components/agent/ObservationDetail";
import ExportButton from "../../components/agent/ExportButton";
import "../../components/map/map.css";
import type { DamageLevel, InfrastructureType, ObservationSource } from "../../types/schema";

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

interface Props {
  crisisId?: string;
  center?: [number, number];
  zoom?: number;
}

export default function DashboardScreen({
  crisisId = import.meta.env.VITE_DEMO_CRISIS_ID ?? "00000000-0000-0000-0000-000000000001",
  center = [-30.029, -51.228],
  zoom = 13,
}: Props) {
  const [observations, setObservations] = useState<MappedObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObs, setSelectedObs] = useState<MappedObservation | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    damageLevels: new Set<DamageLevel>(DAMAGE_LEVELS),
    infraType: "all",
    source: "all",
    mapMode: "clusters",
  });

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
          // DB uses latitude/longitude; MappedObservation uses lat/lng
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

  function toggleDamage(level: DamageLevel) {
    setFilters((prev) => {
      const next = new Set(prev.damageLevels);
      if (next.has(level)) {
        if (next.size === 1) return prev;
        next.delete(level);
      } else {
        next.add(level);
      }
      return { ...prev, damageLevels: next };
    });
  }

  const filtered = observations.filter((o) => {
    if (!filters.damageLevels.has(o.damage_level)) return false;
    if (filters.infraType !== "all" && o.infrastructure_type !== filters.infraType) return false;
    if (filters.source !== "all" && o.source !== filters.source) return false;
    return true;
  });

  const damageCounts = DAMAGE_LEVELS.reduce<Record<DamageLevel, number>>((acc, lvl) => {
    acc[lvl] = observations.filter((o) => o.damage_level === lvl).length;
    return acc;
  }, { minimal: 0, partial: 0, complete: 0 });

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a09", color: "#f5f5f4" }}>
      <FilterPanel
        filters={filters}
        totalCount={observations.length}
        filteredCount={filtered.length}
        loading={loading}
        damageCounts={damageCounts}
        onToggleDamage={toggleDamage}
        onInfraChange={(v) => setFilters((f) => ({ ...f, infraType: v as InfrastructureType | "all" }))}
        onSourceChange={(v) => setFilters((f) => ({ ...f, source: v as ObservationSource | "all" }))}
        onMapModeChange={(v: MapMode) => setFilters((f) => ({ ...f, mapMode: v }))}
        exportSlot={
          <ExportButton
            crisisId={crisisId}
            filters={{ damageLevels: filters.damageLevels, infraType: filters.infraType }}
            rows={filtered}
          />
        }
      />

      <main style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "#1e1e1c",
            border: "1px solid #2a2a28",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 12,
            color: "#a8a8a5",
          }}>
            Loading observations…
          </div>
        )}
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
          {!loading && filters.mapMode === "clusters" && (
            <ClusterLayer observations={filtered} onSelect={setSelectedObs} />
          )}
          {!loading && filters.mapMode === "heatmap" && (
            <HeatmapLayer points={filtered} />
          )}
        </MapContainer>

        {selectedObs && (
          <ObservationDetail
            observation={selectedObs}
            onClose={() => setSelectedObs(null)}
          />
        )}
      </main>
    </div>
  );
}
