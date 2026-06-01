import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Marker, Popup } from "react-leaflet";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import ObservationPopup, { type PopupObservation } from "./ObservationPopup";
import type { CrisisNature, DamageLevel, ModularFields } from "../../types/schema";

export interface MappedObservation extends PopupObservation {
  lat: number;
  lng: number;
  // Optional fields fetched for the detail panel
  debris_clearing_needed?: boolean;
  infrastructure_description?: string | null;
  modular_fields?: ModularFields | null;
  version_number?: number;
  location_method?: string;
  crisis_nature?: CrisisNature;
}

// Hex literals required: used inside Leaflet DivIcon SVG strings (outside CSS cascade)
const PIN_COLORS: Record<DamageLevel, string> = {
  minimal:  "#3ecf8e", // --color-minimal
  partial:  "#f59e0b", // --color-warning
  severe:   "#F59E0B", // amber
  complete: "#ef4444", // --color-critical
};

const SEVERITY: Record<DamageLevel, number> = {
  minimal: 0, partial: 1, severe: 2, complete: 3,
};

function pinIcon(damage: DamageLevel): L.DivIcon {
  const color = PIN_COLORS[damage];
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

function clusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const children = cluster.getAllChildMarkers();
  const count = children.length;

  let dominant: DamageLevel = "minimal";
  children.forEach((m) => {
    const cls = (m.options.icon as L.DivIcon | undefined)?.options.className ?? "";
    const levels: DamageLevel[] = ["complete", "partial", "minimal"];
    for (const lvl of levels) {
      if (cls.includes(`damage-${lvl}`) && SEVERITY[lvl] > SEVERITY[dominant]) {
        dominant = lvl;
      }
    }
  });

  const color = PIN_COLORS[dominant];
  const size = count < 10 ? 36 : count < 100 ? 44 : 52;

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};border:2.5px solid rgba(255,255,255,0.9);border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:${count < 10 ? 13 : 11}px;font-weight:700;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    ">${count}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface Props {
  observations: MappedObservation[];
  onSelect?: (obs: MappedObservation) => void;
}

export default function ClusterLayer({ observations, onSelect }: Props) {
  return (
    <MarkerClusterGroup
      iconCreateFunction={clusterIcon}
      chunkedLoading
      maxClusterRadius={60}
    >
      {observations.map((obs) => (
        <Marker
          key={obs.id}
          position={[obs.lat, obs.lng]}
          icon={pinIcon(obs.damage_level)}
          eventHandlers={onSelect ? { click: () => onSelect(obs) } : undefined}
        >
          {!onSelect && (
            <Popup maxWidth={240}>
              <ObservationPopup observation={obs} />
            </Popup>
          )}
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
