import type { FeatureCollection, Feature, Position } from "geojson";

export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

// The public overpass-api.de load balancer frequently returns 406/429/504
// under normal load — lz4 is the same project's mirror, tried as fallback.
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];
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

const cache = new Map<string, FeatureCollection>();

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

async function queryEndpoint(url: string, query: string): Promise<FeatureCollection | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${url}?data=${encodeURIComponent(query)}`, {
      method: "GET",
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const json = (await res.json()) as OverpassResponse;
    const features = (json.elements ?? [])
      .filter((el): el is OverpassWay => el.type === "way")
      .map(wayToFeature)
      .filter((f): f is Feature => f !== null);

    return { type: "FeatureCollection", features };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchBuildingFootprints(bbox: BoundingBox, crisisId?: string): Promise<FeatureCollection> {
  if (crisisId && cache.has(crisisId)) return cache.get(crisisId)!;

  const query =
    `[out:json][timeout:10];\n` +
    `way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});\n` +
    `out body geom;`;

  let result: FeatureCollection = EMPTY;
  for (const url of OVERPASS_URLS) {
    const r = await queryEndpoint(url, query);
    if (r) { result = r; break; }
  }

  if (crisisId && result.features.length > 0) cache.set(crisisId, result);
  return result;
}
