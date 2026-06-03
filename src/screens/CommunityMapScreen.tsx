import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../services/supabase";
import { getDisplayLevel } from "../constants/disasterDamage";
import CrisisMap from "../components/map/CrisisMap";
import type { PinData } from "../components/map/CrisisMap";
import BottomNav from "../components/BottomNav";
import type { DamageLevel } from "../types/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const POA_CENTER: [number, number] = [-30.0290, -51.2280];
const POLL_INTERVAL_MS = 15_000;

interface Props {
  crisisId: string;
  isDemo: boolean;
  refreshKey?: string;
  onBack: () => void;
  onGoHome?: () => void;
  onGoReport?: () => void;
}

interface ObservationRow {
  id: string;
  latitude: number;
  longitude: number;
  damage_level: string;
}

export default function CommunityMapScreen({ crisisId, isDemo, refreshKey, onBack, onGoHome, onGoReport }: Props) {
  const { t } = useTranslation();
  const [pins, setPins] = useState<PinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [crisisTitle, setCrisisTitle] = useState<string>(
    isDemo ? "RS Floods 2024 · Porto Alegre, RS" : "Community Crisis Map"
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchPins() {
    try {
      const since48h = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await db
        .from("observations")
        .select("id, latitude, longitude, damage_level")
        .eq("crisis_id", crisisId)
        .eq("is_demo", isDemo)
        .gte("client_created_at", since48h) as { data: ObservationRow[] | null; error: unknown };

      if (!error && data) {
        setPins(
          data.map((row) => ({
            id: row.id,
            lat: row.latitude,
            lng: row.longitude,
            damageLevel: getDisplayLevel(row.damage_level),
          }))
        );
      }
    } catch {
      // network unavailable — keep existing pins
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPins();
    intervalRef.current = setInterval(fetchPins, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crisisId, isDemo, refreshKey]);

  useEffect(() => {
    if (isDemo) return;
    async function fetchCrisisTitle() {
      try {
        const { data } = await db
          .from("crises")
          .select("name, location")
          .eq("id", crisisId)
          .single() as { data: { name: string; location: string } | null };
        if (data) {
          setCrisisTitle([data.name, data.location].filter(Boolean).join(" · "));
        }
      } catch {
        // keep empty
      }
    }
    fetchCrisisTitle();
  }, [crisisId, isDemo]);

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary">

      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid var(--cr-border)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "var(--cr-label)",
            fontSize: 14,
            cursor: "pointer",
            padding: "4px 0",
            flexShrink: 0,
          }}
        >
          {t("common.back")}
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cr-label)", fontWeight: 600, margin: 0 }}>
            {t("community_map.title")}
          </p>
          {crisisTitle && (
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--cr-text)", margin: "2px 0 0" }}>
              {crisisTitle}
            </p>
          )}
        </div>
        <div style={{ width: 40, flexShrink: 0 }} />
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-sm text-text-muted">{t("dashboard.loading")}</p>
          </div>
        )}
        <CrisisMap
          center={POA_CENTER}
          zoom={13}
          pins={pins}
          className="h-full w-full"
        />
      </div>

      {/* Legend */}
      <div
        className="flex-none flex items-center justify-center gap-5 border-t border-border"
        style={{ padding: "10px 16px 12px" }}
      >
        {(["minimal", "partial", "complete"] as DamageLevel[]).map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <div
              className="rounded-full"
              style={{
                width: 10,
                height: 10,
                backgroundColor: level === "minimal" ? "var(--color-minimal)" : level === "partial" ? "var(--color-warning)" : "var(--color-critical)",
              }}
            />
            <span className="text-xs text-text-muted">{t(`enum.damage_${level}`)}</span>
          </div>
        ))}
      </div>

      <BottomNav active="map" onHome={onGoHome} onReport={onGoReport} />
    </div>
  );
}
