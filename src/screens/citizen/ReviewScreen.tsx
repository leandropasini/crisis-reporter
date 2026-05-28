import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ObservationInput } from "../../types/observation";
import { submitObservation } from "../../services/submit";

type SubmitState = "idle" | "uploading" | "success" | "queued";

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
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAMAGE_COLORS: Record<string, string> = {
  minimal:  "var(--color-minimal)",
  partial:  "var(--color-warning)",
  complete: "var(--color-critical)",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
      <div className="h-full bg-amber-400 rounded-full"
        style={{ width: `${(step / total) * 100}%` }} />
    </div>
  );
}

function OfflineBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ backgroundColor: "var(--color-surface-1)", border: "1px solid var(--color-border)" }}>
      {/* Cloud-off icon */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.6">
        <path d="M4 14a4 4 0 0 1-.5-8A5 5 0 0 1 14.5 8H15a3 3 0 0 1 2.5 4.5M3 3l14 14" strokeLinecap="round"/>
      </svg>
      <p className="text-sm text-text-secondary">{text}</p>
    </div>
  );
}

function SummaryRow({ label: lbl, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-text-muted uppercase tracking-wide shrink-0">{lbl}</span>
      <span className="text-sm text-right" style={{ color: color ?? "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ReviewScreen({ data, onSuccess, onBack }: Props) {
  const { t } = useTranslation();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const isOffline = !navigator.onLine;

  async function handleSubmit() {
    setSubmitState("uploading");
    const result = await submitObservation(data);
    onSuccess({
      id: result.id,
      lat: data.lat,
      lng: data.lng,
      crisisId: data.crisisId,
      queued: result.queued,
    });
  }

  const pressingNeeds = data.modularFields.pressing_needs;

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary">

      {/* Header */}
      <div className="flex-none" style={{ padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <ProgressBar step={5} total={5} />
        <p className="text-xs text-text-muted text-center tracking-widest uppercase">{t("review.step")}</p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Offline banner */}
        {(isOffline || submitState === "queued") && <OfflineBanner text={t("review.offline")} />}

        {/* Queued state feedback */}
        {submitState === "queued" && !isOffline && (
          <p className="text-xs text-amber-400 text-center">
            {t("review.queued_error")}
          </p>
        )}

        {/* Photo thumbnail */}
        <div className="rounded-xl overflow-hidden aspect-[4/3] bg-surface-2">
          <img
            src={data.photoPreviewUrl}
            alt={t("review.photo_alt")}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Summary */}
        <div className="bg-surface-2 rounded-xl px-4 divide-y divide-border">
          <SummaryRow label={t("review.label_infrastructure")} value={data.infrastructureName} />
          <SummaryRow label={t("review.label_type")}        value={t(`enum.infra_${data.infrastructureType}`)} />
          <SummaryRow
            label={t("review.label_damage")}
            value={t(`enum.damage_${data.damageLevel}`)}
            color={DAMAGE_COLORS[data.damageLevel]}
          />
          <SummaryRow label={t("review.label_debris")} value={data.debrisClearingNeeded ? t("review.yes") : t("review.no")} />
          <SummaryRow
            label={t("review.label_location")}
            value={`${data.lat.toFixed(3)}, ${data.lng.toFixed(3)} (${t(`enum.method_${data.locationMethod}`)})`}
          />
          <SummaryRow label={t("review.label_crisis_type")}  value={t(`enum.subtype_${data.crisisSubtype}`)} />
          {data.modularFields.electricity_condition && (
            <SummaryRow label={t("review.label_electricity")} value={t(`enum.elec_${data.modularFields.electricity_condition}`)} />
          )}
          {data.modularFields.health_services && (
            <SummaryRow label={t("review.label_health")} value={t(`enum.health_${data.modularFields.health_services}`)} />
          )}
          {pressingNeeds && pressingNeeds.length > 0 && (
            <SummaryRow label={t("review.label_needs")} value={pressingNeeds.map((n) => t(`enum.need_${n}`)).join(", ")} />
          )}
        </div>

        {data.infrastructureDescription && (
          <div className="bg-surface-2 rounded-xl px-4 py-3">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">{t("review.notes_title")}</p>
            <p className="text-sm text-text-secondary">{data.infrastructureDescription}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-none border-t border-border" style={{ padding: "12px 16px 32px", display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={onBack}
          disabled={submitState === "uploading"}
          className="flex-1 rounded-xl border border-border text-text-secondary text-sm font-medium active:opacity-70 disabled:opacity-40"
          style={{ padding: "12px 0" }}
        >
          {t("common.back")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitState === "uploading"}
          className="flex-1 rounded-xl bg-accent text-white text-sm font-semibold disabled:opacity-60 active:opacity-80 transition-opacity"
          style={{ padding: "12px 0" }}
        >
          {submitState === "uploading" ? t("review.submitting") : isOffline ? t("review.save_offline") : t("review.submit")}
        </button>
      </div>
    </div>
  );
}
