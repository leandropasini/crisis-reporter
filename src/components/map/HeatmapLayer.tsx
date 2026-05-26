import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "../../lib/leaflet-global";
import "leaflet.heat";
import type { DamageLevel } from "../../types/schema";

const HEAT_WEIGHT: Record<DamageLevel, number> = {
  minimal:  0.3,
  partial:  0.6,
  complete: 1.0,
};

interface HeatPoint {
  lat: number;
  lng: number;
  damage_level: DamageLevel;
}

interface Props {
  points: HeatPoint[];
}

export default function HeatmapLayer({ points }: Props) {
  const map = useMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);

  useEffect(() => {
    const heatData = points.map((p) => [p.lat, p.lng, HEAT_WEIGHT[p.damage_level]] as [number, number, number]);

    if (layerRef.current) {
      layerRef.current.setLatLngs(heatData);
    } else {
      layerRef.current = (L as any).heatLayer(heatData, {
        radius: 40,
        blur: 20,
        minOpacity: 0.55,
        gradient: { 0.0: "#3ecf8e", 0.5: "#f59e0b", 1.0: "#e84040" },
      }).addTo(map);
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points]);

  return null;
}
