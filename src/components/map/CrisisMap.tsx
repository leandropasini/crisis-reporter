import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import type { DamageLevel } from "../../types/schema";
import BuildingLayer from "./BuildingLayer";
import ObservationPin from "./ObservationPin";
import "./map.css";

function FlyToCenter({
  center,
  zoom,
  skipFlyToRef,
  userInteractedRef,
}: {
  center: [number, number];
  zoom: number;
  skipFlyToRef?: { current: boolean };
  userInteractedRef?: { current: boolean };
}) {
  const map = useMap();
  useEffect(() => {
    if (skipFlyToRef?.current) {
      skipFlyToRef.current = false;
      return;
    }
    if (userInteractedRef?.current) return;
    map.flyTo(center, zoom, { animate: true, duration: 0.6 });
  }, [center, zoom, map, skipFlyToRef, userInteractedRef]);
  return null;
}

function ZoomTracker({ onZoomChange }: { onZoomChange?: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange?.(map.getZoom()),
  });
  useEffect(() => {
    onZoomChange?.(map.getZoom());
  }, [map, onZoomChange]);
  return null;
}

// Marks the map as user-controlled once the user drags (pans) it themselves —
// programmatic flyTo/panTo calls don't trigger dragend.
function InteractionTracker({ userInteractedRef }: { userInteractedRef?: { current: boolean } }) {
  useMapEvents({
    dragend: () => {
      if (userInteractedRef) userInteractedRef.current = true;
    },
  });
  return null;
}

// Porto Alegre Centro Histórico — default demo
const POA_CENTER: [number, number] = [-30.0290, -51.2280];
const TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export interface PinData {
  id: string;
  lat: number;
  lng: number;
  damageLevel: DamageLevel;
  draggable?: boolean;
}

interface Props {
  center?: [number, number];
  zoom?: number;
  buildings?: FeatureCollection;
  selectedBuildingId?: string;
  onBuildingClick?: (id: string, name: string) => void;
  pins?: PinData[];
  onPinDragEnd?: (id: string, lat: number, lng: number) => void;
  skipFlyToRef?: { current: boolean };
  userInteractedRef?: { current: boolean };
  onZoomChange?: (zoom: number) => void;
  className?: string;
}

export default function CrisisMap({
  center = POA_CENTER,
  zoom = 15,
  buildings,
  selectedBuildingId,
  onBuildingClick,
  pins = [],
  onPinDragEnd,
  skipFlyToRef,
  userInteractedRef,
  onZoomChange,
  className = "",
}: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`h-full w-full ${className}`}
      zoomControl={true}
    >
      <TileLayer
        url={TILE_URL}
        attribution={TILE_ATTRIBUTION}
        detectRetina
        maxZoom={20}
      />
      <FlyToCenter center={center} zoom={zoom} skipFlyToRef={skipFlyToRef} userInteractedRef={userInteractedRef} />
      <ZoomTracker onZoomChange={onZoomChange} />
      <InteractionTracker userInteractedRef={userInteractedRef} />

      {buildings && (
        <BuildingLayer
          data={buildings}
          selectedId={selectedBuildingId}
          onSelect={onBuildingClick}
        />
      )}

      {pins.map((pin) => (
        <ObservationPin
          key={pin.id}
          lat={pin.lat}
          lng={pin.lng}
          damageLevel={pin.damageLevel}
          draggable={pin.draggable}
          onDragEnd={(lat, lng) => onPinDragEnd?.(pin.id, lat, lng)}
        />
      ))}
    </MapContainer>
  );
}
