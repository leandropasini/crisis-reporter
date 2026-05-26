import { useState } from "react";
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
  minimal:  "#3ecf8e",
  partial:  "#f59e0b",
  complete: "#e84040",
};

function label(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
      <div className="h-full bg-amber-400 rounded-full"
        style={{ width: `${(step / total) * 100}%` }} />
    </div>
  );
}

function OfflineBanner() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ backgroundColor: "#1a1a18", border: "1px solid #2a2a28" }}>
      {/* Cloud-off icon */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#a8a8a5" strokeWidth="1.6">
        <path d="M4 14a4 4 0 0 1-.5-8A5 5 0 0 1 14.5 8H15a3 3 0 0 1 2.5 4.5M3 3l14 14" strokeLinecap="round"/>
      </svg>
      <p className="text-sm text-text-secondary">Saved locally — will sync when connected</p>
    </div>
  );
}

function SummaryRow({ label: lbl, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-text-muted uppercase tracking-wide shrink-0">{lbl}</span>
      <span className="text-sm text-right" style={{ color: color ?? "#f5f5f4" }}>{value}</span>
    </div>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ReviewScreen({ data, onSuccess, onBack }: Props) {
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
        <p className="text-xs text-text-muted text-center tracking-widest uppercase">Step 5 of 5 — Review</p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Offline banner */}
        {(isOffline || submitState === "queued") && <OfflineBanner />}

        {/* Queued state feedback */}
        {submitState === "queued" && !isOffline && (
          <p className="text-xs text-amber-400 text-center">
            Connection error — saved to local queue
          </p>
        )}

        {/* Photo thumbnail */}
        <div className="rounded-xl overflow-hidden aspect-[4/3] bg-surface-2">
          <img
            src={data.photoPreviewUrl}
            alt="Observation photo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Summary */}
        <div className="bg-surface-2 rounded-xl px-4 divide-y divide-border">
          <SummaryRow label="Infrastructure" value={data.infrastructureName} />
          <SummaryRow label="Type"        value={label(data.infrastructureType)} />
          <SummaryRow
            label="Damage"
            value={label(data.damageLevel)}
            color={DAMAGE_COLORS[data.damageLevel]}
          />
          <SummaryRow label="Debris needed" value={data.debrisClearingNeeded ? "Yes" : "No"} />
          <SummaryRow
            label="Location"
            value={`${data.lat.toFixed(3)}, ${data.lng.toFixed(3)} (${label(data.locationMethod)})`}
          />
          <SummaryRow label="Crisis type"  value={label(data.crisisSubtype)} />
          {data.modularFields.electricity_condition && (
            <SummaryRow label="Electricity" value={label(data.modularFields.electricity_condition)} />
          )}
          {data.modularFields.health_services && (
            <SummaryRow label="Health" value={label(data.modularFields.health_services)} />
          )}
          {pressingNeeds && pressingNeeds.length > 0 && (
            <SummaryRow label="Needs" value={pressingNeeds.map(label).join(", ")} />
          )}
        </div>

        {data.infrastructureDescription && (
          <div className="bg-surface-2 rounded-xl px-4 py-3">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Notes</p>
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
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitState === "uploading"}
          className="flex-1 rounded-xl bg-accent text-white text-sm font-semibold disabled:opacity-60 active:opacity-80 transition-opacity"
          style={{ padding: "12px 0" }}
        >
          {submitState === "uploading" ? "Submitting…" : isOffline ? "Save offline" : "Submit →"}
        </button>
      </div>
    </div>
  );
}
