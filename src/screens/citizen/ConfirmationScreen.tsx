import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconCheck, IconClock, IconMap2, IconShare2, IconTrendingUp } from "@tabler/icons-react";
import { supabase } from "../../services/supabase";
import { encodeGeohash, decodeGeohashBbox } from "../../utils/geohash";
import type { ReviewSuccessPayload } from "./ReviewScreen";
import LanguageSelector from "../../components/LanguageSelector";
import BottomNav from "../../components/BottomNav";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface Props extends ReviewSuccessPayload {
  geohashPrecision?: number;
  onReportAnother: () => void;
  onViewMap?: () => void;
}

interface AreaStats {
  total: number;
  contributors: number;
  last6h: number;
}

export default function ConfirmationScreen({
  id,
  lat,
  lng,
  crisisId,
  queued,
  geohashPrecision = 6,
  onReportAnother,
  onViewMap,
}: Props) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AreaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  const shortId = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const geohash = encodeGeohash(lat, lng, geohashPrecision);

  const others = stats ? Math.max(stats.total - 1, 0) : 0;
  const isIncreasing = !!stats && stats.last6h >= 2 && stats.last6h >= stats.total / 2;

  useEffect(() => {
    async function fetchAreaStats() {
      try {
        const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const since6h  = new Date(Date.now() -  6 * 60 * 60 * 1000).toISOString();
        const bbox = decodeGeohashBbox(geohash);

        const { data, error } = await db
          .from("observations")
          .select("damage_level, client_created_at")
          .eq("crisis_id", crisisId)
          .gte("latitude", bbox.minLat)
          .lte("latitude", bbox.maxLat)
          .gte("longitude", bbox.minLng)
          .lte("longitude", bbox.maxLng)
          .gte("client_created_at", since48h) as {
            data: { damage_level: string; client_created_at: string }[] | null;
            error: unknown;
          };

        if (!error && data) {
          const last6h = data.filter((r) => r.client_created_at >= since6h).length;
          setStats({
            total: data.length,
            contributors: data.length, // one per report in this context
            last6h,
          });
        }
      } catch {
        // network unavailable
      } finally {
        setLoading(false);
      }
    }

    fetchAreaStats();
  }, [crisisId, geohash]);

  async function handleShare() {
    const shareData = {
      title: "UN Crisis Reporter",
      text: t("confirmation.share_text"),
      url: window.location.origin + "/app",
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "var(--cr-bg)",
        color: "var(--cr-text)",
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "16px 20px 12px" }}>
        <div style={{ height: 3, background: "#22C55E", borderRadius: 2 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--cr-label)",
              fontWeight: 600,
            }}
          >
            {t("confirmation.received")}
          </span>
          <LanguageSelector variant="inline" />
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: "1 1 auto",
          padding: "16px 20px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Checkmark */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: queued ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)",
            border: `1px solid ${queued ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {queued
            ? <IconClock size={36} style={{ color: "#F59E0B" }} />
            : <IconCheck size={36} style={{ color: "#22C55E" }} />
          }
        </div>

        {/* Message */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--cr-text)" }}>
            {queued ? t("confirmation.saved_locally") : t("confirmation.headline_received")}
          </p>
          <p style={{ fontSize: 15, color: "var(--cr-label)" }}>
            {queued ? t("confirmation.will_sync") : t("confirmation.live_on_map")}
          </p>
          {!queued && !loading && (
            <p style={{ fontSize: 14, color: "var(--cr-label)" }}>
              {others >= 1
                ? t("confirmation.others_helping", { count: others })
                : t("confirmation.first_share_link")}
            </p>
          )}
          {!queued && isIncreasing && (
            <p style={{ fontSize: 14, color: "var(--cr-primary)", fontWeight: 600 }}>
              {t("confirmation.area_increasing")}
            </p>
          )}
        </div>

        {/* ID badge */}
        <div
          style={{
            padding: "7px 16px",
            background: "#1a1a1a",
            border: "1px solid var(--cr-border)",
            borderRadius: 10,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--cr-label)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            ID: {shortId}
          </span>
        </div>

        {/* Community impact */}
        <div
          style={{
            width: "100%",
            background: "var(--cr-surface)",
            borderRadius: 18,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--cr-label)",
            }}
          >
            {t("confirmation.community_impact_view")}
          </p>

          {loading ? (
            <p style={{ fontSize: 14, color: "var(--cr-label)", textAlign: "center" }}>
              {t("confirmation.loading_area")}
            </p>
          ) : stats && stats.total >= 1 ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: "var(--cr-text)", lineHeight: 1 }}>
                  {stats.total}
                </span>
                <span style={{ fontSize: 13, color: "var(--cr-label)" }}>
                  {t("confirmation.reports_within_radius")}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--cr-primary)", fontWeight: 500 }}>
                {t("confirmation.last6h_48h", { count: stats.last6h })}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[
                  { label: t("confirmation.stat_buildings"), value: stats.total },
                  { label: t("confirmation.stat_contributors"), value: stats.contributors },
                  { label: t("confirmation.stat_trending"), icon: "ti-trending-up", iconColor: "#22C55E" },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    style={{
                      background: "#111",
                      borderRadius: 12,
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {cell.icon ? (
                      <IconTrendingUp size={22} style={{ color: cell.iconColor }} />
                    ) : (
                      <span style={{ fontSize: 22, fontWeight: 700, color: "var(--cr-text)" }}>{cell.value}</span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--cr-label)" }}>{cell.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: "var(--cr-label)", lineHeight: 1.5, textAlign: "center" }}>
              {t("confirmation.first_in_area_cta")}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={onViewMap}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              minHeight: "var(--min-touch)",
              borderRadius: 16,
              border: "none",
              background: "var(--cr-primary)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <IconMap2 size={20} />
            {t("confirmation.view_community_map")}
          </button>
          <button
            type="button"
            onClick={handleShare}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              minHeight: "var(--min-touch)",
              borderRadius: 16,
              border: "1px solid var(--cr-border)",
              background: "var(--cr-surface)",
              color: "var(--cr-text)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <IconShare2 size={20} />
            {t("confirmation.share_button")}
          </button>
          {linkCopied && (
            <p style={{ fontSize: 13, color: "var(--cr-label)", textAlign: "center", margin: 0 }}>
              {t("confirmation.link_copied")}
            </p>
          )}
          <button
            type="button"
            onClick={onReportAnother}
            style={{
              width: "100%",
              minHeight: "var(--min-touch)",
              borderRadius: 16,
              border: "1px solid var(--cr-border)",
              background: "var(--cr-surface)",
              color: "var(--cr-label)",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t("confirmation.submit_another")}
          </button>
        </div>
      </div>

      <BottomNav active="report" onHome={onReportAnother} onMap={onViewMap} />
    </div>
  );
}
