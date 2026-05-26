import { MapContainer, TileLayer } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import type { DamageLevel } from "../../types/schema";
import BuildingLayer from "./BuildingLayer";
import ObservationPin from "./ObservationPin";
import "./map.css";

// Porto Alegre Centro Histórico — default demo
const POA_CENTER: [number, number] = [-30.0290, -51.2280];
const TILE_URL =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about">OpenStreetMap</a> contributors';

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
  pins?: PinData[];
  onPinDragEnd?: (id: string, lat: number, lng: number) => void;
  className?: string;
}

export default function CrisisMap({
  center = POA_CENTER,
  zoom = 15,
  buildings,
  pins = [],
  onPinDragEnd,
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

      {buildings && <BuildingLayer data={buildings} />}

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
