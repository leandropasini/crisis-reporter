import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../services/supabase";
import { encodeGeohash, decodeGeohashBbox } from "../../utils/geohash";
import type { ReviewSuccessPayload } from "./ReviewScreen";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface Props extends ReviewSuccessPayload {
  geohashPrecision?: number;
  onReportAnother: () => void;
}

interface DamageCounts {
  total: number;
  minimal: number;
  partial: number;
  complete: number;
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M6 16l8 8L26 8" stroke="var(--color-minimal)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QueuedIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--color-warning)" strokeWidth="2">
      <path d="M4 20a12 12 0 0 1 20-9M16 8v8l4 4" strokeLinecap="round" />
      <path d="M28 12a12 12 0 0 1-20 9" strokeLinecap="round" strokeDasharray="3 2" />
    </svg>
  );
}

function DamageBar({ counts }: { counts: DamageCounts }) {
  const { minimal, partial, complete, total } = counts;
  return (
    <div className="w-full flex rounded-full overflow-hidden" style={{ height: 6 }}>
      {minimal > 0 && (
        <div style={{ flex: minimal / total, backgroundColor: "var(--color-minimal)" }} />
      )}
      {partial > 0 && (
        <div style={{ flex: partial / total, backgroundColor: "var(--color-warning)" }} />
      )}
      {complete > 0 && (
        <div style={{ flex: complete / total, backgroundColor: "var(--color-critical)" }} />
      )}
    </div>
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
  const { t } = useTranslation();
  const [counts, setCounts] = useState<DamageCounts | null>(null);
  const [loadingArea, setLoadingArea] = useState(true);

  const shortId = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const geohash = encodeGeohash(lat, lng, geohashPrecision);

  useEffect(() => {
    async function fetchAreaStats() {
      try {
        const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const bbox = decodeGeohashBbox(geohash);

        const { data, error } = await db
          .from("observations")
          .select("damage_level")
          .eq("crisis_id", crisisId)
          .gte("latitude", bbox.minLat)
          .lte("latitude", bbox.maxLat)
          .gte("longitude", bbox.minLng)
          .lte("longitude", bbox.maxLng)
          .gte("client_created_at", since48h) as { data: { damage_level: string }[] | null; error: unknown };

        if (!error && data) {
          const c = { total: data.length, minimal: 0, partial: 0, complete: 0 };
          for (const row of data) {
            if (row.damage_level === "minimal") c.minimal++;
            else if (row.damage_level === "partial") c.partial++;
            else if (row.damage_level === "complete") c.complete++;
          }
          setCounts(c);
        }
      } catch {
        // network unavailable — show fallback
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
        style={{ backgroundColor: queued ? "color-mix(in srgb, var(--color-warning) 9%, transparent)" : "color-mix(in srgb, var(--color-minimal) 9%, transparent)" }}
      >
        {queued ? <QueuedIcon /> : <CheckIcon />}
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-text-primary">
          {queued ? t("confirmation.saved_locally") : t("confirmation.received")}
        </p>
        <p className="text-sm text-text-muted">
          {queued
            ? t("confirmation.will_sync")
            : t("confirmation.added_to_map")}
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
      <div className="w-full max-w-xs bg-surface-2 border border-border rounded-xl px-4 py-4 text-center space-y-3">
        {loadingArea ? (
          <p className="text-sm text-text-muted">{t("confirmation.loading_area")}</p>
        ) : counts !== null && counts.total >= 2 ? (
          <>
            <p className="text-sm text-text-muted leading-relaxed">
              {t("confirmation.area_count_48h", { count: counts.total })}
            </p>
            <DamageBar counts={counts} />
            <div className="flex justify-between text-xs text-text-muted">
              <span style={{ color: "var(--color-minimal)" }}>{counts.minimal}</span>
              <span style={{ color: "var(--color-warning)" }}>{counts.partial}</span>
              <span style={{ color: "var(--color-critical)" }}>{counts.complete}</span>
            </div>
          </>
        ) : counts !== null && counts.total === 1 ? (
          <p className="text-sm text-text-muted leading-relaxed">
            {t("confirmation.your_first")}
          </p>
        ) : (
          <p className="text-sm text-text-muted leading-relaxed">
            {t("confirmation.first_report")}
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
          {t("confirmation.report_another")}
        </button>
        <button
          type="button"
          disabled
          className="w-full py-3 rounded-xl border border-border text-text-muted text-sm font-medium opacity-40 cursor-not-allowed"
        >
          {t("confirmation.view_map")}
        </button>
      </div>
    </div>
  );
}
