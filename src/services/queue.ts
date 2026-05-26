// F1: localStorage queue — F2 migrates to IndexedDB with background sync

const QUEUE_KEY = "crisisrep_queue";

interface QueueEntry {
  // File excluded — cannot serialize to localStorage
  // F2: store file as Blob in IndexedDB
  payload: Record<string, unknown>;
  queuedAt: string;
}

function readQueue(): QueueEntry[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as QueueEntry[];
  } catch {
    return [];
  }
}

export const queue = {
  enqueue(payload: Record<string, unknown>): void {
    try {
      const items = readQueue();
      // Drop File — not serializable (F2 handles via IndexedDB Blob)
      const { photoFile: _f, photoPreviewUrl: _p, ...rest } = payload as Record<string, unknown>;
      items.push({ payload: rest, queuedAt: new Date().toISOString() });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
    } catch {
      // localStorage full or unavailable — silently skip
    }
  },

  count(): number {
    return readQueue().length;
  },

  flush(): void {
    // TODO F2: replay queued payloads against Supabase with IndexedDB Blob re-upload
  },
};
