import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CrisisMap from "../../components/map/CrisisMap";
import LanguageSelector from "../../components/LanguageSelector";
import BottomNav from "../../components/BottomNav";
import type { FeatureCollection } from "geojson";
import buildingsData from "../../data/buildings-poa-sample.geojson";

type LocationMethod = "gps" | "manual_pin" | "address";
type GpsStatus = "loading" | "ok" | "failed";

export interface LocationResult {
  lat: number;
  lng: number;
  locationMethod: LocationMethod;
  address?: string;
  buildingId?: string;
  buildingName?: string;
}

interface Props {
  crisisCenter?: [number, number];
  onConfirm: (result: LocationResult) => void;
  onBack: () => void;
  modeLabel?: string;
  totalSteps?: number;
  onGoHome?: () => void;
  onGoMap?: () => void;
}

function trunc(n: number) {
  return Math.round(n * 1000) / 1000;
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
  crisisCenter = POA_CENTER,
  onConfirm,
  onBack,
  modeLabel,
  totalSteps = 3,
  onGoHome,
  onGoMap,
}: Props) {
  const { t } = useTranslation();
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("loading");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [method, setMethod] = useState<LocationMethod>("gps");
  const [address, setAddress] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<{ id: string; name: string } | null>(null);
  const methodRef = useRef<LocationMethod>("gps");

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("failed");
      setMethod("manual_pin");
      methodRef.current = "manual_pin";
      setPin({ lat: trunc(crisisCenter[0]), lng: trunc(crisisCenter[1]) });
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
      },
      () => {
        setGpsStatus("failed");
        setMethod("manual_pin");
        methodRef.current = "manual_pin";
        setPin({ lat: trunc(crisisCenter[0]), lng: trunc(crisisCenter[1]) });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePinDrag(_id: string, lat: number, lng: number) {
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
      buildingId: selectedBuilding?.id,
      buildingName: selectedBuilding?.name,
    });
  }

  const mapCenter: [number, number] = pin ? [pin.lat, pin.lng] : crisisCenter;

  const pins = pin
    ? [{ id: PIN_ID, lat: pin.lat, lng: pin.lng, damageLevel: "minimal" as const, draggable: true }]
    : [];

  const stepNum = 2;
  const pct = (stepNum / totalSteps) * 100;
  const headerLabel = modeLabel
    ? `${modeLabel} — STEP ${stepNum} OF ${totalSteps}`
    : t("location.step");

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
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "16px 20px 12px" }}>
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
      <div style={{ flexShrink: 0, height: 300, padding: "0 20px" }}>
        <div style={{ height: "100%", borderRadius: 20, overflow: "hidden" }}>
          <CrisisMap
            center={mapCenter}
            zoom={15}
            buildings={buildingsData as FeatureCollection}
            selectedBuildingId={selectedBuilding?.id}
            onBuildingClick={(id, name) => setSelectedBuilding({ id, name })}
            pins={pins}
            onPinDragEnd={handlePinDrag}
            className="rounded-none"
          />
        </div>
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
              {gpsStatus === "ok" ? "GPS" : "Manual"}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--cr-text)" }}>
              {pin.lat.toFixed(5)}°, {pin.lng.toFixed(5)}°
            </span>
          </div>
        )}

        {/* Privacy note */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <i className="ti ti-lock" style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 1, flexShrink: 0 }} />
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
            Confirm location →
          </button>
        </div>
      </div>

      <BottomNav active="report" onHome={onGoHome} onMap={onGoMap} />
    </div>
  );
}
