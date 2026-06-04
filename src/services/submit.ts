import { supabase } from "./supabase";
import { queue } from "./queue";
import i18n from "../i18n";
import type { ObservationInput } from "../types/observation";
import type { ObservationInsert } from "../types/database";
import type { UnLanguage } from "../types/schema";

// Handwritten Database types don't fully satisfy Supabase's GenericSchema check.
// TODO: replace with `supabase gen types typescript` output after migrations run.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const SESSION_KEY = "crisisrep_session_id";

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function uploadPhoto(file: File, crisisId: string, sessionId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crisisId}/${sessionId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("observation-photos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from("observation-photos")
    .getPublicUrl(path);

  return data.publicUrl;
}

export interface SubmitResult {
  success: boolean;
  queued: boolean;
  id: string; // real UUID on success, local UUID when queued
  error?: string;
}

// Map disaster-specific rapid-mode values → valid DB enum values.
// RapidClassificationScreen uses keys like flood_partial, eq_hairline, etc.
// ClassificationScreen always sends minimal/partial/severe/complete directly.
const DAMAGE_LEVEL_MAP: Record<string, string> = {
  // Flood
  flood_partial:    "partial",
  flood_full:       "complete",
  flood_structural: "severe",
  flood_erosion:    "severe",
  flood_complete:   "complete",
  // Earthquake
  eq_hairline:     "minimal",
  eq_structural:   "partial",
  eq_partial:      "severe",
  eq_complete:     "complete",
  eq_liquefaction: "severe",
  // Hurricane
  hur_roof_partial: "partial",
  hur_roof_full:    "severe",
  hur_facade:       "partial",
  hur_structural:   "severe",
  hur_complete:     "complete",
  // Landslide
  ls_partial:    "partial",
  ls_foundation: "severe",
  ls_access:     "minimal",
  ls_complete:   "complete",
  // Fire
  fire_smoke:    "minimal",
  fire_partial:  "partial",
  fire_major:    "severe",
  fire_complete: "complete",
  // Drought
  dr_cracking: "partial",
  dr_water:    "partial",
  dr_health:   "severe",
  dr_access:   "minimal",
  // Generic / already valid
  minimal:  "minimal",
  partial:  "partial",
  severe:   "severe",
  complete: "complete",
};

export async function submitObservation(input: ObservationInput): Promise<SubmitResult> {
  const localId = crypto.randomUUID();

  const mappedDamageLevel = DAMAGE_LEVEL_MAP[input.damageLevel] ?? "partial";
  if (!(input.damageLevel in DAMAGE_LEVEL_MAP)) {
    console.warn("[crisis-reporter] unknown damage_level key — not in map, defaulting to partial:", input.damageLevel);
  }

  // Log 1: entry point — raw value from form + mapped value going to DB
  console.log("[crisis-reporter] LOG1 submitObservation called", {
    mode: input.isDemo ? "demo" : "live",
    crisis_id: input.crisisId,
    raw_damage_level: input.damageLevel,
    mapped_damage_level: mappedDamageLevel,
    is_demo: input.isDemo ?? false,
  });

  // navigator.onLine is unreliable on mobile (iOS Safari / Android often returns
  // false even with real connectivity). Always attempt; catch handles real failures.

  try {
    const sessionId = getSessionId();

    let photoUrl = "";
    try {
      photoUrl = await uploadPhoto(input.photoFile, input.crisisId, sessionId);
    } catch (uploadErr) {
      console.warn("[crisis-reporter] photo upload failed (continuing without photo):", uploadErr);
    }

    const insertData: ObservationInsert = {
      id:                         localId,
      crisis_id:                  input.crisisId,
      building_id:                input.buildingId ?? null,
      infrastructure_name:        input.infrastructureName ?? "",
      infrastructure_description: input.infrastructureDescription ?? null,
      infrastructure_type:        input.infrastructureType,
      infrastructure_type_other:  input.infrastructureTypeOther ?? null,
      damage_level:               mappedDamageLevel,
      debris_clearing_needed:     input.debrisClearingNeeded ?? false,
      photo_url:                  photoUrl,
      latitude:                   input.lat,
      longitude:                  input.lng,
      location_method:            input.locationMethod,
      source:                     "citizen",
      session_id:                 sessionId,
      is_proxy:                   false,
      language:                   i18n.language as UnLanguage,
      client_created_at:          new Date().toISOString(),
      modular_fields:             input.modularFields,
      is_demo:                    input.isDemo ?? false,
    };

    // Log 2: full payload before Supabase insert
    console.log("[crisis-reporter] LOG2 inserting payload:", JSON.stringify(insertData));

    const { error, data: insertResult } = await db.from("observations").insert(insertData).select();

    // Log 3: Supabase response
    if (error) {
      console.error("[crisis-reporter] LOG3 Supabase insert ERROR:", JSON.stringify(error));
      throw error;
    }
    console.log("[crisis-reporter] LOG3 Supabase insert SUCCESS:", insertResult);

    // Log 4: branch taken
    console.log("[crisis-reporter] LOG4 branch=SUPABASE id=" + localId);
    return { success: true, queued: false, id: localId };
  } catch (err) {
    console.error("[crisis-reporter] LOG4 branch=QUEUE reason:", err);
    try {
      await queue.enqueue(input);
    } catch {
      // IndexedDB unavailable — still return queued so UI proceeds
    }
    return {
      success: false,
      queued: true,
      id: localId,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Always flush pending queue on load and on reconnect.
// Not gated on navigator.onLine — the flag is unreliable on mobile.
void queue.flush(submitObservation);
window.addEventListener("online", () => { void queue.flush(submitObservation); });
