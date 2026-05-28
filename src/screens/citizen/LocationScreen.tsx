import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CrisisMap from "../../components/map/CrisisMap";
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
  crisisCenter?: [number, number]; // defaults to POA demo
  onConfirm: (result: LocationResult) => void;
  onBack: () => void;
  modeLabel?: string;
  totalSteps?: number;
}

// Truncate to 3 decimal places → ~50 m precision (privacy)
function trunc(n: number) {
  return Math.round(n * 1000) / 1000;
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-400 rounded-full transition-all duration-300"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  );
}

function GpsStatusBadge({ status, t }: { status: GpsStatus; t: (key: string) => string }) {
  if (status === "loading") {
    return (
      <span className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        {t("location.gps_loading")}
      </span>
    );
  }
  if (status === "ok") {
    return (
      <span className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="w-2 h-2 rounded-full bg-low" />
        {t("location.gps_ok")}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-sm text-amber-400">
      <span className="w-2 h-2 rounded-full bg-amber-400" />
      {t("location.gps_failed")}
    </span>
  );
}

const POA_CENTER: [number, number] = [-30.029, -51.228];
const PIN_ID = "location-pin";

export default function LocationScreen({ crisisCenter = POA_CENTER, onConfirm, onBack, modeLabel, totalSteps = 5 }: Props) {
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

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3 flex-none">
        <ProgressBar step={2} total={totalSteps} />
        <p className="text-xs text-text-muted text-center tracking-widest uppercase">
          {modeLabel ? `${modeLabel} — STEP 2 OF ${totalSteps}` : t("location.step")}
        </p>
      </div>

      {/* Map — 60% viewport height */}
      <div className="flex-none" style={{ height: "60vh" }}>
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

      {/* Building selected banner */}
      {selectedBuilding && (
        <div className="flex-none flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-border">
          <span className="text-sm text-text-secondary">
            Edifício selecionado:{" "}
            <span className="font-semibold text-text-primary">{selectedBuilding.name}</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedBuilding(null)}
            className="text-text-muted text-lg leading-none active:opacity-60"
            aria-label={t("location.remove_selection")}
          >
            ×
          </button>
        </div>
      )}

      {/* Bottom panel */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

        {/* GPS status */}
        <GpsStatusBadge status={gpsStatus} t={t} />

        {/* Address field — always visible when GPS failed */}
        {gpsStatus === "failed" && (
          <div className="space-y-1">
            <label className="text-xs text-text-muted uppercase tracking-wide">
              {t("location.address_label")}
            </label>
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder={t("location.address_placeholder")}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        )}

        {/* Coordinates display */}
        {pin && (
          <div className="flex gap-4 text-xs text-text-muted font-mono">
            <span>{t("location.lat")} {pin.lat.toFixed(3)}</span>
            <span>{t("location.lng")} {pin.lng.toFixed(3)}</span>
            <span className="ml-auto uppercase tracking-wide">{t(`enum.method_${method}`)}</span>
          </div>
        )}

        {/* Privacy note */}
        <p className="text-xs text-text-muted leading-relaxed">
          {t("location.privacy_note")}
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 rounded-xl border border-border text-text-secondary text-sm font-medium active:opacity-70"
          >
            {t("common.back")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-semibold disabled:opacity-40 active:opacity-80 transition-opacity"
          >
            {t("location.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
