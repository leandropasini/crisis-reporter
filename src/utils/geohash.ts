// Standard geohash encoding — mirrors PostgreSQL ST_GeoHash output
const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function encodeGeohash(lat: number, lng: number, precision = 6): string {
  let idx = 0, bit = 0;
  let isLng = true;
  let result = "";
  let minLat = -90, maxLat = 90;
  let minLng = -180, maxLng = 180;

  while (result.length < precision) {
    if (isLng) {
      const mid = (minLng + maxLng) / 2;
      if (lng >= mid) { idx = (idx << 1) | 1; minLng = mid; }
      else             { idx = idx << 1;        maxLng = mid; }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) { idx = (idx << 1) | 1; minLat = mid; }
      else             { idx = idx << 1;        maxLat = mid; }
    }
    isLng = !isLng;

    if (++bit === 5) {
      result += BASE32[idx];
      idx = 0;
      bit = 0;
    }
  }

  return result;
}
