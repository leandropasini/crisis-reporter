import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature } from "geojson";
import type { PathOptions, Layer } from "leaflet";

interface Props {
  data: FeatureCollection;
  selectedId?: string;
  onSelect?: (id: string, name: string) => void;
}

const BASE: PathOptions = {
  color: "#e86c2c",
  weight: 1.5,
  opacity: 0.9,
  fillColor: "#e86c2c",
  fillOpacity: 0.12,
};

const SELECTED: PathOptions = { ...BASE, fillOpacity: 0.5, weight: 2.5 };

export default function BuildingLayer({ data, selectedId, onSelect }: Props) {
  function style(feature?: Feature): PathOptions {
    return feature?.id === selectedId ? SELECTED : BASE;
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const name = (feature.properties as Record<string, string>)?.name ?? "";
    if (name) (layer as { bindTooltip: (s: string, o: object) => void }).bindTooltip(name, { sticky: true });
    layer.on("click", () => {
      const id = String(feature.id ?? "");
      if (id) onSelect?.(id, name);
    });
  }

  return (
    <GeoJSON
      key={`buildings-${selectedId}`}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
