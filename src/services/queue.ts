import { openDB, type DBSchema } from "idb";
import type { ObservationInput } from "../types/observation";

const DB_NAME = "crisisrep";
const STORE = "queue" as const;
const DB_VERSION = 1;

interface QueueEntry {
  id?: number;
  payload: Omit<ObservationInput, "photoFile" | "photoPreviewUrl">;
  photoBlob: Blob;
  photoName: string;
  photoType: string;
  queuedAt: string;
}

interface QueueDB extends DBSchema {
  queue: { key: number; value: QueueEntry };
}

type SubmitFn = (input: ObservationInput) => Promise<{ success: boolean; queued: boolean }>;

async function getDb() {
  return openDB<QueueDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

export const queue = {
  async enqueue(input: ObservationInput): Promise<void> {
    try {
      const db = await getDb();
      const { photoFile, photoPreviewUrl: _p, ...payload } = input;
      await db.add(STORE, {
        payload,
        photoBlob: photoFile,
        photoName: photoFile.name,
        photoType: photoFile.type,
        queuedAt: new Date().toISOString(),
      });
    } catch {
      // IndexedDB unavailable — silently skip
    }
  },

  async count(): Promise<number> {
    try {
      const db = await getDb();
      return await db.count(STORE);
    } catch {
      return 0;
    }
  },

  async flush(submit: SubmitFn): Promise<void> {
    try {
      const db = await getDb();
      const entries = await db.getAll(STORE);
      for (const entry of entries) {
        // Delete before attempting — submitObservation re-enqueues on failure
        await db.delete(STORE, entry.id!);
        const file = new File([entry.photoBlob], entry.photoName, { type: entry.photoType });
        const input: ObservationInput = { ...entry.payload, photoFile: file, photoPreviewUrl: "" };
        await submit(input);
      }
    } catch {
      // DB unavailable or unexpected error — retry on next online event
    }
  },
};
