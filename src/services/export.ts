import Papa from "papaparse";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { DamageLevel, InfrastructureType, ModularFields } from "../types/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ExportRow {
  id: string;
  crisis_id?: string | null;
  infrastructure_name: string;
  infrastructure_type: string;
  infrastructure_type_other?: string | null;
  damage_level: DamageLevel;
  debris_clearing_needed?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;   // alias used by MappedObservation
  lng?: number | null;
  source: string;
  confidence: number;
  version_number?: number | null;
  is_proxy?: boolean | null;
  language?: string | null;
  client_created_at: string;
  modular_fields?: ModularFields | null;
  electricity_status?: string | null;
  health_status?: string | null;
  pressing_needs?: string[] | null;
  photo_url?: string | null;
}

export interface ExportFilters {
  damageLevels: Set<DamageLevel>;
  infraType: InfrastructureType | "all";
}

// ── Fetch ──────────────────────────────────────────────────────────────────────

export async function fetchForExport(
  crisisId: string,
  filters: ExportFilters,
): Promise<ExportRow[]> {
  let query = db
    .from("observations")
    .select(
      "id, crisis_id, infrastructure_name, infrastructure_type, infrastructure_type_other, " +
      "damage_level, debris_clearing_needed, latitude, longitude, source, confidence, " +
      "version_number, is_proxy, language, client_created_at, modular_fields, " +
      "electricity_status, health_status, pressing_needs, photo_url"
    )
    .eq("crisis_id", crisisId)
    .eq("status", "active")
    .order("client_created_at", { ascending: false });

  if (filters.infraType !== "all") {
    query = query.eq("infrastructure_type", filters.infraType);
  }

  const { data, error } = await query;
  if (error) throw new Error(String(error));

  const rows: ExportRow[] = (data ?? []) as ExportRow[];

  // Apply damage level filter client-side (Supabase doesn't support IN easily with our as-any cast)
  return rows.filter((r) => filters.damageLevels.has(r.damage_level));
}

// ── Builders ───────────────────────────────────────────────────────────────────

function normLat(r: ExportRow): number | null {
  return r.latitude ?? r.lat ?? null;
}
function normLng(r: ExportRow): number | null {
  return r.longitude ?? r.lng ?? null;
}

export function buildGeoJSON(rows: ExportRow[]): string {
  const features = rows.map((r) => {
    const lat = normLat(r);
    const lng = normLng(r);
    return {
      type: "Feature",
      geometry: lat !== null && lng !== null
        ? { type: "Point", coordinates: [lng, lat] }
        : null,
      properties: {
        id:                   r.id,
        crisis_id:            r.crisis_id ?? null,
        infrastructure_name:  r.infrastructure_name,
        infrastructure_type:  r.infrastructure_type,
        damage_level:         r.damage_level,
        debris_clearing:      r.debris_clearing_needed ?? null,
        source:               r.source,
        confidence:           r.confidence,
        version_number:       r.version_number ?? 1,
        created_at:           r.client_created_at,
        photo_url:            r.photo_url ?? null,
        language:             r.language ?? null,
        modular_fields:       r.modular_fields ?? null,
        electricity_status:   r.electricity_status ?? null,
        health_status:        r.health_status ?? null,
        pressing_needs:       r.pressing_needs ?? null,
      },
    };
  });

  return JSON.stringify(
    { type: "FeatureCollection", features },
    null,
    2,
  );
}

export function buildCSV(rows: ExportRow[]): string {
  const csvRows = rows.map((r) => ({
    id:                         r.id,
    crisis_id:                  r.crisis_id ?? "",
    infrastructure_name:        r.infrastructure_name,
    infrastructure_type:        r.infrastructure_type,
    infrastructure_type_other:  r.infrastructure_type_other ?? "",
    damage_level:               r.damage_level,
    debris_clearing_needed:     r.debris_clearing_needed ?? "",
    latitude:                   normLat(r) ?? "",
    longitude:                  normLng(r) ?? "",
    source:                     r.source,
    confidence:                 r.confidence,
    version_number:             r.version_number ?? 1,
    is_proxy:                   r.is_proxy ?? false,
    language:                   r.language ?? "",
    client_created_at:          r.client_created_at,
    electricity_condition:      r.modular_fields?.electricity_condition ?? "",
    health_services:            r.modular_fields?.health_services ?? "",
    pressing_needs_legacy:      (r.modular_fields?.pressing_needs ?? []).join("|"),
    electricity_status:         r.electricity_status ?? "",
    health_status:              r.health_status ?? "",
    pressing_needs:             (r.pressing_needs ?? []).join("|"),
    photo_url:                  r.photo_url ?? "",
  }));

  // Empty export still produces a valid header-only CSV
  if (csvRows.length === 0) {
    const headers = [
      "id","crisis_id","infrastructure_name","infrastructure_type",
      "infrastructure_type_other","damage_level","debris_clearing_needed",
      "latitude","longitude","source","confidence","version_number",
      "is_proxy","language","client_created_at","electricity_condition",
      "health_services","pressing_needs_legacy","electricity_status",
      "health_status","pressing_needs","photo_url",
    ];
    return Papa.unparse({ fields: headers, data: [] });
  }

  return Papa.unparse(csvRows);
}

// ── Download ───────────────────────────────────────────────────────────────────

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function exportGeoJSON(
  crisisId: string,
  filters: ExportFilters,
  fallback: ExportRow[],
): Promise<void> {
  const rows = isSupabaseConfigured
    ? await fetchForExport(crisisId, filters)
    : fallback;

  const content = buildGeoJSON(rows);
  triggerDownload(content, `crisis-reporter-${dateStamp()}.geojson`, "application/geo+json");
}

export async function exportCSV(
  crisisId: string,
  filters: ExportFilters,
  fallback: ExportRow[],
): Promise<void> {
  const rows = isSupabaseConfigured
    ? await fetchForExport(crisisId, filters)
    : fallback;

  const content = buildCSV(rows);
  triggerDownload(content, `crisis-reporter-${dateStamp()}.csv`, "text/csv;charset=utf-8;");
}
