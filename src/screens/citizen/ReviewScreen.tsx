import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconCloudOff } from "@tabler/icons-react";
import type { ObservationInput } from "../../types/observation";
import { submitObservation } from "../../services/submit";
import LanguageSelector from "../../components/LanguageSelector";
import BottomNav from "../../components/BottomNav";

type SubmitState = "idle" | "uploading" | "success" | "queued" | "error";

export interface ReviewSuccessPayload {
  id: string;
  lat: number;
  lng: number;
  crisisId: string;
  queued: boolean;
}

interface Props {
  data: ObservationInput;
  onSuccess: (payload: ReviewSuccessPayload) => void;
  onBack: () => void;
  modeLabel?: string;
  totalSteps?: number; // kept for API compat, progress bar always at 100% in review
  onGoHome?: () => void;
  onGoMap?: () => void;
}

const DAMAGE_COLORS: Record<string, string> = {
  minimal:  "#22C55E",
  partial:  "#E8823A",
  severe:   "#F59E0B",
  complete: "#EF4444",
};

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 3, background: "var(--cr-surface2)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--cr-primary)", borderRadius: 2 }} />
    </div>
  );
}

export default function ReviewScreen({
  data,
  onSuccess,
  onBack,
  modeLabel,
  totalSteps: _totalSteps = 3,
  onGoHome,
  onGoMap,
}: Props) {
  const { t } = useTranslation();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const isOffline = !navigator.onLine;

  async function handleSubmit() {
    setSubmitState("uploading");
    try {
      const result = await submitObservation(data);
      onSuccess({
        id: result.id,
        lat: data.lat,
        lng: data.lng,
        crisisId: data.crisisId,
        queued: result.queued,
      });
    } catch {
      setSubmitState("error");
    }
  }

  const headerLabel = modeLabel ? `${modeLabel} — REVIEW` : t("review.step");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--cr-bg)",
        color: "var(--cr-text)",
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "16px 20px 12px" }}>
        <ProgressBar pct={100} />
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
            {headerLabel}
          </span>
          <LanguageSelector variant="inline" />
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Offline banner */}
        {(isOffline || submitState === "queued") && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--cr-surface)",
              border: "1px solid var(--cr-border)",
            }}
          >
            <IconCloudOff size={18} style={{ color: "var(--cr-label)" }} />
            <p style={{ fontSize: 14, color: "var(--cr-label)" }}>{t("review.offline")}</p>
          </div>
        )}

        {submitState === "error" && (
          <p style={{ fontSize: 13, color: "var(--cr-critical)", textAlign: "center" }}>
            {t("review.submit_error")}
          </p>
        )}

        {/* Photo */}
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            aspectRatio: "4/3",
            background: "var(--cr-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={data.photoPreviewUrl}
            alt={t("review.photo_alt")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Summary card */}
        <div
          style={{
            background: "var(--cr-surface)",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {[
            {
              label: t("review.label_type"),
              value: t(`enum.infra_${data.infrastructureType}`),
              color: "var(--cr-text)",
            },
            {
              label: t("review.label_damage"),
              value: t(`enum.damage_${data.damageLevel}`),
              color: DAMAGE_COLORS[data.damageLevel] ?? "var(--cr-text)",
            },
            {
              label: t("review.label_location"),
              value: `${data.lat.toFixed(3)}°, ${data.lng.toFixed(3)}°`,
              color: "var(--cr-label)",
              sub: data.address,
            },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                padding: "16px 20px",
                borderBottom: i < arr.length - 1 ? "0.5px solid var(--cr-border)" : "none",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--cr-label)",
                  flexShrink: 0,
                }}
              >
                {row.label}
              </span>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: row.color }}>{row.value}</p>
                {row.sub && <p style={{ fontSize: 12, color: "var(--cr-label)", marginTop: 2 }}>{row.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 20px",
          borderTop: "1px solid var(--cr-border)",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={submitState === "uploading"}
          style={{
            flex: 1,
            minHeight: "var(--min-touch)",
            borderRadius: 16,
            border: "1px solid var(--cr-border)",
            background: "var(--cr-surface)",
            color: "var(--cr-label)",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            opacity: submitState === "uploading" ? 0.4 : 1,
          }}
        >
          {t("common.back")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitState === "uploading"}
          style={{
            flex: 2,
            minHeight: "var(--min-touch)",
            borderRadius: 16,
            border: "none",
            background: "var(--cr-primary)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: submitState === "uploading" ? "not-allowed" : "pointer",
            opacity: submitState === "uploading" ? 0.6 : 1,
          }}
        >
          {submitState === "uploading"
            ? t("review.submitting")
            : submitState === "error"
            ? t("review.retry")
            : isOffline
            ? t("review.save_offline")
            : "Submit report →"}
        </button>
      </div>

      <BottomNav active="report" onHome={onGoHome} onMap={onGoMap} />
    </div>
  );
}
