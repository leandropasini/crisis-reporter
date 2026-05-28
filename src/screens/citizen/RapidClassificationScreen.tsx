import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DamageLevel, InfrastructureType } from "../../types/schema";

export interface RapidClassificationData {
  damageLevel: DamageLevel;
  infrastructureType: InfrastructureType;
}

interface Props {
  onConfirm: (data: RapidClassificationData) => void;
  onBack: () => void;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function InfraIcon({ type }: { type: InfrastructureType }) {
  switch (type) {
    case "residential": return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M2 10.5L11 3l9 7.5M5 9v9h12V9" />
        <rect x="8.5" y="13" width="5" height="5" />
      </svg>
    );
    case "commercial": return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="6" width="16" height="13" rx="0.5" />
        <path d="M3 9h16M7 6V4h8v2" />
        <rect x="8" y="12" width="6" height="7" />
      </svg>
    );
    case "government": return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M2 19h18M2 9h18M11 2l9 7H2l9-7z" />
        <path d="M5 9v10M9 9v10M13 9v10M17 9v10" />
      </svg>
    );
    case "utility": return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M13 2L6 12h7l-4 8 9-10h-7l4-8z" />
      </svg>
    );
    case "transport_comm": return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M2 15h18M6 15l2-6h6l2 6M11 9V3M8 5l3-3 3 3" />
      </svg>
    );
    case "community": return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="11" cy="7" r="3" />
        <path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7" />
        <circle cx="5" cy="9" r="2" />
        <path d="M2 19c0-2.761 1.343-5 3-5" />
        <circle cx="17" cy="9" r="2" />
        <path d="M20 19c0-2.761-1.343-5-3-5" />
      </svg>
    );
    case "public_recreation": return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M11 2v18M7 6c0 0 1 3 4 4s4-4 4-4" />
        <path d="M4 12c0 0 2 4 7 4s7-4 7-4" />
      </svg>
    );
    case "other": return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="11" cy="11" r="9" />
        <path d="M11 8c0-1.5 3-1.5 3 0 0 2-3 2-3 3.5M11 16v.5" strokeLinecap="round" />
      </svg>
    );
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar() {
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-2)" }}>
      <div className="h-full rounded-full" style={{ width: "100%", backgroundColor: "var(--color-warning)" }} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider mb-3"
      style={{ color: "var(--color-label)" }}>
      {children}
    </p>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

const DAMAGE_OPTIONS: {
  value: DamageLevel;
  tKey: string;
  color: string;
  descKey: string;
}[] = [
  { value: "minimal",  tKey: "classification.damage_minimal",  color: "var(--color-minimal)",  descKey: "classification.damage_minimal_desc" },
  { value: "partial",  tKey: "classification.damage_partial",  color: "var(--color-warning)",  descKey: "classification.damage_partial_desc" },
  { value: "complete", tKey: "classification.damage_complete", color: "var(--color-critical)", descKey: "classification.damage_complete_desc" },
];

const INFRA_OPTIONS: { value: InfrastructureType; tKey: string }[] = [
  { value: "residential",       tKey: "classification.infra_residential" },
  { value: "commercial",        tKey: "classification.infra_commercial"  },
  { value: "government",        tKey: "classification.infra_government"  },
  { value: "utility",           tKey: "classification.infra_utility"     },
  { value: "transport_comm",    tKey: "classification.infra_transport"   },
  { value: "community",         tKey: "classification.infra_community"   },
  { value: "public_recreation", tKey: "classification.infra_recreation"  },
  { value: "other",             tKey: "classification.infra_other"       },
];

export default function RapidClassificationScreen({ onConfirm, onBack }: Props) {
  const { t } = useTranslation();
  const [damageLevel, setDamage] = useState<DamageLevel | null>(null);
  const [infraType, setInfra]    = useState<InfrastructureType | null>(null);

  const canAdvance = damageLevel !== null && infraType !== null;

  function handleConfirm() {
    if (!damageLevel || !infraType) return;
    onConfirm({ damageLevel, infrastructureType: infraType });
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-value)" }}>

      {/* Header */}
      <div className="flex-none px-4 pt-4 pb-3 space-y-3">
        <ProgressBar />
        <p className="text-xs text-center tracking-widest uppercase font-semibold"
          style={{ color: "var(--color-label)" }}>
          RAPID REPORT — STEP 3 OF 3
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">

        {/* ── Damage level — full-width stacked buttons ── */}
        <section>
          <SectionLabel>{t("classification.damage_section")}</SectionLabel>
          <div className="space-y-3">
            {DAMAGE_OPTIONS.map((opt) => {
              const selected = damageLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDamage(opt.value)}
                  className="w-full flex items-center px-5 rounded-xl border transition-all active:scale-[0.99]"
                  style={{
                    minHeight: "var(--min-touch)",
                    borderColor: selected ? opt.color : "var(--color-border)",
                    backgroundColor: selected
                      ? `color-mix(in srgb, ${opt.color} 12%, var(--color-surface-2))`
                      : "var(--color-surface-2)",
                  }}
                >
                  <span className="flex-1 text-base font-semibold text-left"
                    style={{ color: selected ? opt.color : "var(--color-value)" }}>
                    {t(opt.tKey)}
                  </span>
                  {selected && (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: opt.color }}>
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                        <path d="M1 4.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Infrastructure type — icon grid ── */}
        <section>
          <SectionLabel>{t("classification.infra_section")}</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {INFRA_OPTIONS.map((opt) => {
              const selected = infraType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInfra(opt.value)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all active:scale-95"
                  style={{
                    minHeight: "var(--min-touch)",
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                    backgroundColor: selected
                      ? "color-mix(in srgb, var(--color-primary) 10%, var(--color-surface-2))"
                      : "var(--color-surface-2)",
                    color: selected ? "var(--color-primary)" : "var(--color-label)",
                  }}
                >
                  <InfraIcon type={opt.value} />
                </button>
              );
            })}
          </div>
          {infraType && (
            <p className="mt-2 text-xs text-center" style={{ color: "var(--color-label)" }}>
              {t(INFRA_OPTIONS.find((o) => o.value === infraType)!.tKey)}
            </p>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="flex-none px-4 pb-8 pt-3 border-t flex gap-3" style={{ borderColor: "var(--color-border)" }}>
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border text-sm font-medium active:opacity-70"
          style={{
            minHeight: "var(--min-touch)",
            borderColor: "var(--color-border)",
            color: "var(--color-label)",
          }}
        >
          {t("common.back")}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canAdvance}
          className="flex-1 rounded-xl text-white text-sm font-semibold disabled:opacity-40 active:opacity-80 transition-opacity"
          style={{
            minHeight: "var(--min-touch)",
            backgroundColor: "var(--color-primary)",
          }}
        >
          {t("review.submit")}
        </button>
      </div>
    </div>
  );
}
