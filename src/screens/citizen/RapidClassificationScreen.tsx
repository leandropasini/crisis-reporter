import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";
import BottomNav from "../../components/BottomNav";
import type { DamageLevel, InfrastructureType } from "../../types/schema";

export interface RapidClassificationData {
  damageLevel: DamageLevel;
  infrastructureType: InfrastructureType;
}

interface Props {
  onConfirm: (data: RapidClassificationData) => void;
  onBack: () => void;
  onGoHome?: () => void;
  onGoMap?: () => void;
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 3, background: "var(--cr-surface2)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--cr-primary)", borderRadius: 2, transition: "width 0.3s" }} />
    </div>
  );
}

const DAMAGE_OPTIONS: {
  value: DamageLevel;
  label: string;
  desc: string;
  color: string;
}[] = [
  { value: "minimal",  label: "Minimal",  desc: "Cracks in plaster, broken windows",    color: "#22C55E" },
  { value: "partial",  label: "Partial",  desc: "Large wall cracks, partial roof loss",  color: "#E8823A" },
  { value: "severe",   label: "Severe",   desc: "Collapsed walls, unsafe to enter",      color: "#F59E0B" },
  { value: "complete", label: "Complete", desc: "Complete collapse, rubble only",         color: "#EF4444" },
];

const INFRA_OPTIONS: {
  value: InfrastructureType;
  label: string;
  icon: string;
}[] = [
  { value: "residential",       label: "Residential", icon: "ti-home" },
  { value: "commercial",        label: "Commercial",  icon: "ti-building-store" },
  { value: "government",        label: "Government",  icon: "ti-building-bank" },
  { value: "utility",           label: "Utility",     icon: "ti-bolt" },
  { value: "community",         label: "Health",      icon: "ti-activity-heartbeat" },
  { value: "public_recreation", label: "Education",   icon: "ti-school" },
  { value: "transport_comm",    label: "Transport",   icon: "ti-road" },
  { value: "other",             label: "Other",       icon: "ti-dots" },
];

export default function RapidClassificationScreen({ onConfirm, onBack, onGoHome, onGoMap }: Props) {
  const { t } = useTranslation();
  const [damageLevel, setDamage] = useState<DamageLevel | null>(null);
  const [infraType, setInfra]    = useState<InfrastructureType | null>(null);

  const canAdvance = damageLevel !== null && infraType !== null;

  function handleConfirm() {
    if (!damageLevel || !infraType) return;
    onConfirm({ damageLevel, infrastructureType: infraType });
  }

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
            RAPID REPORT — STEP 3 OF 3
          </span>
          <LanguageSelector variant="inline" />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 12px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Damage level */}
        <section>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--cr-label)",
              marginBottom: 10,
            }}
          >
            {t("classification.damage_section")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DAMAGE_OPTIONS.map((opt) => {
              const sel = damageLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDamage(opt.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    borderRadius: 16,
                    border: `1px solid ${sel ? opt.color : "var(--cr-border)"}`,
                    background: sel ? `${opt.color}18` : "var(--cr-surface)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  {/* Dot */}
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: opt.color,
                      flexShrink: 0,
                    }}
                  />
                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: "var(--cr-text)", marginBottom: 2 }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--cr-label)" }}>{opt.desc}</p>
                  </div>
                  {/* Check */}
                  {sel && (
                    <i
                      className="ti ti-check"
                      style={{ fontSize: 18, color: opt.color, flexShrink: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Infrastructure type */}
        <section>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--cr-label)",
              marginBottom: 10,
            }}
          >
            {t("classification.infra_section")}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {INFRA_OPTIONS.map((opt) => {
              const sel = infraType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInfra(opt.value)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    padding: "12px 6px",
                    borderRadius: 14,
                    border: `1px solid ${sel ? "var(--cr-primary)" : "var(--cr-border)"}`,
                    background: sel ? "var(--cr-primary-dim)" : "var(--cr-surface)",
                    color: sel ? "var(--cr-primary)" : "var(--cr-label)",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s, color 0.15s",
                    minHeight: "var(--min-touch)",
                  }}
                >
                  <i className={`ti ${opt.icon}`} style={{ fontSize: 22 }} />
                  <span style={{ fontSize: 11, textAlign: "center", lineHeight: 1.2 }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>
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
          }}
        >
          {t("common.back")}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canAdvance}
          style={{
            flex: 2,
            minHeight: "var(--min-touch)",
            borderRadius: 16,
            border: "none",
            background: canAdvance ? "var(--cr-primary)" : "var(--cr-surface2)",
            color: canAdvance ? "#fff" : "var(--cr-label)",
            fontSize: 15,
            fontWeight: 700,
            cursor: canAdvance ? "pointer" : "not-allowed",
            transition: "background 0.15s",
          }}
        >
          {t("review.submit")}
        </button>
      </div>

      <BottomNav active="report" onHome={onGoHome} onMap={onGoMap} />
    </div>
  );
}
