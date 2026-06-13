import type { FeatureCollection, Feature, Position } from "geojson";

export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

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

export async function fetchBuildingFootprints(bbox: BoundingBox, crisisId?: string): Promise<FeatureCollection> {
  console.log('[OVERPASS] crisisId:', crisisId);
  console.log('[OVERPASS] cache hit:', cache.has(crisisId ?? ''));
  if (crisisId && cache.has(crisisId)) return cache.get(crisisId)!;

  const query =
    `[out:json][timeout:10];\n` +
    `way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});\n` +
    `out body geom;`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let result: FeatureCollection = EMPTY;
  console.log('[OVERPASS] fetching...');
  try {
    const res = await fetch(`/api/overpass?data=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });
    if (res.ok) {
      const json = (await res.json()) as OverpassResponse;
      const features = (json.elements ?? [])
        .filter((el): el is OverpassWay => el.type === "way")
        .map(wayToFeature)
        .filter((f): f is Feature => f !== null);
      result = { type: "FeatureCollection", features };
    } else {
      console.log('[OVERPASS] response not ok:', res.status);
    }
  } catch (err) {
    console.log('[OVERPASS] fetch error:', err);
  } finally {
    clearTimeout(timer);
  }

  console.log('[OVERPASS] result features:', result.features.length);
  if (crisisId && result.features.length > 0) cache.set(crisisId, result);
  return result;
}
