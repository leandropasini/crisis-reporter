import { Marker } from "react-leaflet";
import L from "leaflet";
import type { DamageLevel } from "../../types/schema";

// Hex literals are required here: these are injected into a Leaflet DivIcon SVG string
// outside the CSS cascade, so CSS variables cannot be resolved.
const PIN_COLORS: Record<DamageLevel, string> = {
  minimal:  "#3ecf8e", // --color-minimal
  partial:  "#f59e0b", // --color-warning
  severe:   "#F59E0B", // amber
  complete: "#ef4444", // --color-critical
};

function makeIcon(color: string, damage: DamageLevel): L.DivIcon {
  const pulseRing = damage === "complete" || damage === "severe"
    ? `<div class="damage-complete-ring"></div>`
    : "";
  return L.divIcon({
    html: `<div style="position:relative;display:inline-block">${pulseRing}<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5" fill="white" fill-opacity="0.9"/>
    </svg></div>`,
    className: `damage-${damage}`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

interface Props {
  lat: number;
  lng: number;
  damageLevel: DamageLevel;
  draggable?: boolean;
  onDragEnd?: (lat: number, lng: number) => void;
}

export default function ObservationPin({ lat, lng, damageLevel, draggable = false, onDragEnd }: Props) {
  const icon = makeIcon(PIN_COLORS[damageLevel], damageLevel);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      draggable={draggable}
      eventHandlers={{
        dragend(e) {
          const { lat: newLat, lng: newLng } = (e.target as L.Marker).getLatLng();
          onDragEnd?.(newLat, newLng);
        },
      }}
    />
  );
}
