import { GeoJSON } from "react-leaflet";
import type { FeatureCollection } from "geojson";

interface Props {
  data: FeatureCollection;
}

const STYLE = {
  color: "#e86c2c",
  weight: 1.5,
  opacity: 0.9,
  fillColor: "#e86c2c",
  fillOpacity: 0.12,
};

export default function BuildingLayer({ data }: Props) {
  return <GeoJSON key={JSON.stringify(data)} data={data} style={STYLE} />;
}
