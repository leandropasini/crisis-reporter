import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { encodeGeohash } from "../../utils/geohash";
import type { ReviewSuccessPayload } from "./ReviewScreen";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface Props extends ReviewSuccessPayload {
  geohashPrecision?: number; // default 6
  onReportAnother: () => void;
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M6 16l8 8L26 8" stroke="#3ecf8e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QueuedIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#f59e0b" strokeWidth="2">
      <path d="M4 20a12 12 0 0 1 20-9M16 8v8l4 4" strokeLinecap="round" />
      <path d="M28 12a12 12 0 0 1-20 9" strokeLinecap="round" strokeDasharray="3 2" />
    </svg>
  );
}

export default function ConfirmationScreen({
  id,
  lat,
  lng,
  crisisId,
  queued,
  geohashPrecision = 6,
  onReportAnother,
}: Props) {
  const [areaCount, setAreaCount] = useState<number | null>(null);
  const [loadingArea, setLoadingArea] = useState(true);

  const shortId = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const geohash = encodeGeohash(lat, lng, geohashPrecision);

  useEffect(() => {
    async function fetchAreaStats() {
      try {
        const { data, error } = await db
          .from("area_stats")
          .select("observation_count")
          .eq("crisis_id", crisisId)
          .eq("geohash", geohash)
          .maybeSingle() as { data: { observation_count: number } | null; error: unknown };

        if (!error && data) {
          setAreaCount(data.observation_count);
        }
      } catch {
        // network unavailable or no data — show fallback
      } finally {
        setLoadingArea(false);
      }
    }

    fetchAreaStats();
  }, [crisisId, geohash]);

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary items-center justify-center px-6 gap-6">

      {/* Status icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: queued ? "#f59e0b18" : "#3ecf8e18" }}
      >
        {queued ? <QueuedIcon /> : <CheckIcon />}
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-text-primary">
          {queued ? "Saved locally" : "Report received"}
        </p>
        <p className="text-sm text-text-muted">
          {queued
            ? "Will sync when connection is restored"
            : "Added to response map"}
        </p>
      </div>

      {/* Report ID badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-2 rounded-lg border border-border">
        <span className="text-xs text-text-muted uppercase tracking-wide">ID</span>
        <span
          className="text-sm text-text-muted tracking-widest"
          style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
        >
          {shortId}
        </span>
      </div>

      {/* Community impact */}
      <div className="w-full max-w-xs bg-surface-2 border border-border rounded-xl px-4 py-4 text-center space-y-1">
        {loadingArea ? (
          <p className="text-sm text-text-muted">Loading area data…</p>
        ) : areaCount !== null && areaCount > 0 ? (
          <>
            <p className="text-2xl font-bold text-text-primary">{areaCount}</p>
            <p className="text-sm text-text-muted leading-relaxed">
              report{areaCount !== 1 ? "s" : ""} from your area{" "}
              {areaCount === 1 ? "is" : "are"} helping prioritize response
            </p>
          </>
        ) : (
          <p className="text-sm text-text-muted leading-relaxed">
            Be the first to report from this area
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="w-full max-w-xs space-y-3 pt-2">
        <button
          type="button"
          onClick={onReportAnother}
          className="w-full py-3 rounded-xl bg-accent text-white text-sm font-semibold active:opacity-80"
        >
          Report another
        </button>
        <button
          type="button"
          disabled
          className="w-full py-3 rounded-xl border border-border text-text-muted text-sm font-medium opacity-40 cursor-not-allowed"
        >
          View map (coming soon)
        </button>
      </div>
    </div>
  );
}
