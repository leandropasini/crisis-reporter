import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconLock } from "@tabler/icons-react";
import CrisisMap from "../../components/map/CrisisMap";
import LanguageSelector from "../../components/LanguageSelector";
import BottomNav from "../../components/BottomNav";
import type { FeatureCollection } from "geojson";
import buildingsData from "../../data/buildings-poa-sample.geojson";
import { supabase } from "../../services/supabase";
import { fetchBuildingFootprints } from "../../services/overpass";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type LocationMethod = "gps" | "manual_pin" | "address";
type GpsStatus = "loading" | "ok" | "failed";

export interface LocationResult {
  lat: number;
  lng: number;
  locationMethod: LocationMethod;
  address?: string;
  placeName?: string;
  buildingId?: string;
  buildingName?: string;
}

interface Props {
  crisisId?: string;
  crisisCenter?: [number, number];
  onConfirm: (result: LocationResult) => void;
  onBack: () => void;
  modeLabel?: string;
  totalSteps?: number;
  demoMode?: boolean;
  onGoHome?: () => void;
  onGoMap?: () => void;
}

function trunc(n: number) {
  return Math.round(n * 1000000) / 1000000;
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 3, background: "var(--cr-surface2)", borderRadius: 2, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "var(--cr-primary)",
          borderRadius: 2,
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

const POA_CENTER: [number, number] = [-30.029, -51.228];
const PIN_ID = "location-pin";

export default function LocationScreen({
  crisisId,
  crisisCenter = POA_CENTER,
  onConfirm,
  onBack,
  modeLabel,
  totalSteps = 3,
  demoMode = false,
  onGoHome,
  onGoMap,
}: Props) {
  const { t } = useTranslation();
  const [footprints, setFootprints] = useState<FeatureCollection | null>(null);
  const [footprintsLoading, setFootprintsLoading] = useState(false);
  const [liveZoom, setLiveZoom] = useState<number>(16);
  const [crisisBboxCenter, setCrisisBboxCenter] = useState<[number, number] | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>(demoMode ? "ok" : "loading");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
    demoMode ? { lat: trunc(POA_CENTER[0]), lng: trunc(POA_CENTER[1]) } : null
  );
  const [method, setMethod] = useState<LocationMethod>("gps");
  const [address, setAddress] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<{ id: string; name: string } | null>(null);
  const [placeName, setPlaceName] = useState<string>(
    demoMode ? "Porto Alegre, Rio Grande do Sul" : ""
  );
  const [showNoFootprintsMsg, setShowNoFootprintsMsg] = useState(false);
  const methodRef = useRef<LocationMethod>("gps");
  const skipFlyToRef = useRef(false);
  const userInteractedRef = useRef(false);

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
        { headers: { "Accept-Language": "en" } }
      );
      const json = await res.json();
      const addr = json.address ?? {};
      const name = [
        addr.suburb ?? addr.neighbourhood ?? addr.town,
        addr.city ?? addr.municipality ?? addr.county,
      ]
        .filter(Boolean)
        .join(", ");
      if (name) setPlaceName(name);
    } catch {
      // fallback: coords only
    }
  }

  useEffect(() => {
    if (demoMode) return;

    if (!navigator.geolocation) {
      setGpsStatus("failed");
      setMethod("manual_pin");
      methodRef.current = "manual_pin";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = trunc(pos.coords.latitude);
        const lng = trunc(pos.coords.longitude);
        setPin({ lat, lng });
        setGpsStatus("ok");
        setMethod("gps");
        methodRef.current = "gps";
        reverseGeocode(lat, lng);
      },
      () => {
        setGpsStatus("failed");
        setMethod("manual_pin");
        methodRef.current = "manual_pin";
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  // Fallback pin when GPS is unavailable: use the crisis bbox center
  // (once known) instead of the hardcoded POA default.
  useEffect(() => {
    if (demoMode || pin !== null || gpsStatus !== "failed") return;
    const center = crisisBboxCenter ?? crisisCenter;
    setPin({ lat: trunc(center[0]), lng: trunc(center[1]) });
  }, [demoMode, gpsStatus, pin, crisisBboxCenter, crisisCenter]);

  // Crisis bbox center — used as a fallback pin location when GPS is unavailable.
  useEffect(() => {
    if (demoMode || !crisisId) return;
    let cancelled = false;
    async function loadCrisisBbox() {
      try {
        const { data } = await db
          .from("crises")
          .select("bbox_sw_lat, bbox_sw_lng")
          .eq("id", crisisId)
          .single() as { data: { bbox_sw_lat: number | null; bbox_sw_lng: number | null } | null };

        const lat = data?.bbox_sw_lat;
        const lng = data?.bbox_sw_lng;
        const hasCoords = lat != null && lng != null && !(lat === 0 && lng === 0);

        if (hasCoords && !cancelled) setCrisisBboxCenter([lat!, lng!]);
      } catch {
        // keep default
      }
    }
    loadCrisisBbox();
    return () => { cancelled = true; };
  }, [demoMode, crisisId]);

  // Building footprints — centered on the user's current pin position.
  useEffect(() => {
    if (demoMode || !crisisId || !pin) return;

    let cancelled = false;

    async function loadFootprints() {
      setFootprintsLoading(true);
      setShowNoFootprintsMsg(false);
      try {
        const fc = await fetchBuildingFootprints({
          south: pin!.lat - 0.007,
          north: pin!.lat + 0.007,
          west:  pin!.lng - 0.007,
          east:  pin!.lng + 0.007,
        });

        if (!cancelled) {
          setFootprints(fc);
          if (fc.features.length === 0) {
            setShowNoFootprintsMsg(true);
          }
        }
      } catch {
        if (!cancelled) {
          setShowNoFootprintsMsg(true);
        }
      } finally {
        if (!cancelled) setFootprintsLoading(false);
      }
    }

    loadFootprints();
    return () => { cancelled = true; };
  }, [demoMode, crisisId, pin?.lat, pin?.lng]);

  function handlePinDrag(_id: string, lat: number, lng: number) {
    skipFlyToRef.current = true;
    userInteractedRef.current = true;
    setPin({ lat: trunc(lat), lng: trunc(lng) });
    setMethod("manual_pin");
    methodRef.current = "manual_pin";
  }

  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress(e.target.value);
    if (methodRef.current !== "manual_pin") {
      setMethod("address");
      methodRef.current = "address";
    }
  }

  const canConfirm = pin !== null && (method !== "address" || address.trim().length > 0);

  function handleConfirm() {
    if (!pin) return;
    onConfirm({
      lat: pin.lat,
      lng: pin.lng,
      locationMethod: method,
      address: method === "address" ? address.trim() : undefined,
      placeName: demoMode ? "Porto Alegre, Rio Grande do Sul" : placeName || undefined,
      buildingId: selectedBuilding?.id,
      buildingName: selectedBuilding?.name,
    });
  }

  const mapCenter = useMemo<[number, number]>(
    () => (pin ? [pin.lat, pin.lng] : (crisisBboxCenter ?? crisisCenter)),
    [pin?.lat, pin?.lng, crisisBboxCenter, crisisCenter]
  );

  const pins = pin
    ? [{ id: PIN_ID, lat: pin.lat, lng: pin.lng, damageLevel: "minimal" as const, draggable: true }]
    : [];

  const stepNum = 2;
  const pct = (stepNum / totalSteps) * 100;
  const headerLabel = modeLabel
    ? `${modeLabel} — ${t("common.step_of", { step: stepNum, total: totalSteps })}`
    : t("location.step");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--cr-bg)",
        color: "var(--cr-text)",
        paddingBottom: "max(calc(env(safe-area-inset-bottom) + 64px), 90px)",
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "16px 20px 12px", paddingTop: "calc(16px + var(--demo-disclaimer-h, 0px))", position: "relative", zIndex: 1001 }}>
        <ProgressBar pct={pct} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--cr-label)",
              fontWeight: 600,
            }}
          >
            {headerLabel}
          </span>
          <LanguageSelector variant="inline" />
        </div>
      </div>

      {/* Map */}
      <div style={{ flexShrink: 0, height: 220, padding: "0 20px", position: "relative" }}>
        {footprintsLoading && (
          <div style={{ position: "absolute", top: 8, right: 28, zIndex: 1000, background: "var(--cr-surface)", borderRadius: 8, padding: "4px 10px" }}>
            <span style={{ fontSize: 12, color: "var(--cr-label)" }}>{t("location.loading_map_data")}</span>
          </div>
        )}
        <div style={{ height: "100%", borderRadius: 20, overflow: "hidden" }}>
          <CrisisMap
            center={mapCenter}
            zoom={16}
            buildings={liveZoom >= 15 ? (demoMode ? (buildingsData as FeatureCollection) : (footprints ?? undefined)) : undefined}
            selectedBuildingId={selectedBuilding?.id}
            onBuildingClick={(id, name) => setSelectedBuilding({ id, name })}
            pins={pins}
            onPinDragEnd={handlePinDrag}
            skipFlyToRef={skipFlyToRef}
            userInteractedRef={userInteractedRef}
            onZoomChange={setLiveZoom}
            className="rounded-none"
          />
        </div>

        {/* Fallback message for empty footprints */}
        {showNoFootprintsMsg && !demoMode && (
          <div style={{ 
            position: "absolute", 
            bottom: 12, 
            left: 32, 
            right: 32, 
            zIndex: 1000, 
            background: "rgba(0,0,0,0.85)", 
            backdropFilter: "blur(4px)",
            borderRadius: 12, 
            padding: "10px 14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
          }}>
            <p style={{ fontSize: 12, color: "#fff", lineHeight: 1.4, margin: 0 }}>
              {t("location.no_footprints")}
            </p>
          </div>
        )}
      </div>

      {/* Building banner */}
      {selectedBuilding && (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
            background: "var(--cr-surface)",
            borderBottom: "1px solid var(--cr-border)",
          }}
        >
          <span style={{ fontSize: 14, color: "var(--cr-label)" }}>
            Building:{" "}
            <span style={{ fontWeight: 600, color: "var(--cr-text)" }}>{selectedBuilding.name}</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedBuilding(null)}
            style={{ background: "none", border: "none", color: "var(--cr-label)", fontSize: 18, cursor: "pointer", padding: "0 4px" }}
            aria-label={t("location.remove_selection")}
          >
            ×
          </button>
        </div>
      )}

      {/* Bottom panel */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* GPS status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                gpsStatus === "ok"
                  ? "#22C55E"
                  : gpsStatus === "loading"
                  ? "var(--cr-primary)"
                  : "var(--cr-severe)",
              animation: gpsStatus === "loading" ? "pulse-dot 1.2s ease-in-out infinite" : "none",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--cr-text)" }}>
            {gpsStatus === "ok"
              ? t("location.gps_ok")
              : gpsStatus === "loading"
              ? t("location.gps_loading")
              : t("location.gps_failed")}
          </span>
        </div>

        {/* Address field when GPS failed */}
        {gpsStatus === "failed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--cr-label)",
              }}
            >
              {t("location.address_label")}
            </label>
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder={t("location.address_placeholder")}
              style={{
                width: "100%",
                background: "var(--cr-surface)",
                border: "1px solid var(--cr-border)",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 15,
                color: "var(--cr-text)",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Location card */}
        {pin && (
          <div
            style={{
              background: "var(--cr-surface)",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--cr-label)",
              }}
            >
              {demoMode ? "DEMO LOCATION" : gpsStatus === "ok" ? "GPS" : "Manual"}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--cr-text)" }}>
              {demoMode
                ? "Porto Alegre, Rio Grande do Sul"
                : placeName || `${pin.lat.toFixed(5)}°, ${pin.lng.toFixed(5)}°`}
            </span>
            <span style={{ fontSize: 13, color: "var(--cr-label)" }}>
              {pin.lat.toFixed(5)}°, {pin.lng.toFixed(5)}°
            </span>
          </div>
        )}

        {/* Privacy note */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <IconLock size={14} style={{ color: "rgba(255,255,255,0.3)", marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>
            {t("location.privacy_note")}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 8 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: 1,
              minHeight: "var(--min-touch)",
              borderRadius: 16,
              border: "1px solid var(--cr-border)",
              background: "var(--cr-surface)",
              color: "var(--cr-label)",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              padding: 18,
            }}
          >
            {t("common.back")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              flex: 2,
              minHeight: "var(--min-touch)",
              borderRadius: 16,
              border: "none",
              background: canConfirm ? "var(--cr-primary)" : "var(--cr-surface2)",
              color: canConfirm ? "#fff" : "var(--cr-label)",
              fontSize: 15,
              fontWeight: 700,
              cursor: canConfirm ? "pointer" : "not-allowed",
              padding: 18,
              transition: "background 0.15s",
            }}
          >
            {t("location.confirm")}
          </button>
        </div>
      </div>

      <BottomNav active="report" onHome={onGoHome} onMap={onGoMap} />
    </div>
  );
}
