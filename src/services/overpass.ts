import type { FeatureCollection, Feature, Position } from "geojson";

export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const FETCH_TIMEOUT_MS = 15_000;

interface OverpassGeometryPoint {
  lat: number;
  lon: number;
}

interface OverpassWay {
  type: "way";
  id: number;
  geometry?: OverpassGeometryPoint[];
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassWay[];
}

const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };

function wayToFeature(way: OverpassWay): Feature | null {
  if (!way.geometry || way.geometry.length < 3) return null;

  const ring: Position[] = way.geometry.map((p) => [p.lon, p.lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);

  return {
    type: "Feature",
    id: `way/${way.id}`,
    properties: { name: way.tags?.name ?? "" },
    geometry: { type: "Polygon", coordinates: [ring] },
  };
}

export async function fetchBuildingFootprints(bbox: BoundingBox): Promise<FeatureCollection> {
  const query =
    `[out:json][timeout:10];\n` +
    `way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});\n` +
    `out body geom;`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      body: query,
      signal: controller.signal,
    });
    if (!res.ok) return EMPTY;

    const json = (await res.json()) as OverpassResponse;
    const features = (json.elements ?? [])
      .filter((el): el is OverpassWay => el.type === "way")
      .map(wayToFeature)
      .filter((f): f is Feature => f !== null);

    return { type: "FeatureCollection", features };
  } catch {
    return EMPTY;
  } finally {
    clearTimeout(timer);
  }
}
