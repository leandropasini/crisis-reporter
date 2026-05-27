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

export async function submitObservation(input: ObservationInput): Promise<SubmitResult> {
  const localId = crypto.randomUUID();

  if (!navigator.onLine) {
    await queue.enqueue(input);
    return { success: false, queued: true, id: localId };
  }

  try {
    const sessionId = getSessionId();
    const photoUrl = await uploadPhoto(input.photoFile, input.crisisId, sessionId);

    const insertData: ObservationInsert = {
      id:                         localId,
      crisis_id:                  input.crisisId,
      building_id:                input.buildingId ?? null,
      infrastructure_name:        input.infrastructureName,
      infrastructure_description: input.infrastructureDescription ?? null,
      infrastructure_type:        input.infrastructureType,
      infrastructure_type_other:  input.infrastructureTypeOther ?? null,
      damage_level:               input.damageLevel,
      debris_clearing_needed:     input.debrisClearingNeeded,
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
    };

    const { error } = await db.from("observations").insert(insertData);

    if (error) throw error;

    return { success: true, queued: false, id: localId };
  } catch (err) {
    await queue.enqueue(input);
    return {
      success: false,
      queued: true,
      id: localId,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

window.addEventListener("online", () => { void queue.flush(submitObservation); });
if (navigator.onLine) void queue.flush(submitObservation);
