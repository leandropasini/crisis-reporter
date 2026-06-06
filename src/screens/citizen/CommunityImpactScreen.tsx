import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";

export interface CommunityImpactData {
  electricityStatus: string | undefined;
  healthStatus: string | undefined;
  pressingNeeds: string[];
}

interface Props {
  onConfirm: (data: CommunityImpactData) => void;
  onBack: () => void;
  modeLabel?: string;
  totalSteps?: number;
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-400 rounded-full transition-all duration-300"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-wider mb-3"
      style={{ fontSize: "var(--font-label)", color: "var(--color-label)" }}
    >
      {children}
    </p>
  );
}

export default function CommunityImpactScreen({
  onConfirm,
  onBack,
  modeLabel,
  totalSteps = 6,
}: Props) {
  const { t } = useTranslation();
  const [electricity, setElectricity] = useState<string | undefined>();
  const [health, setHealth]           = useState<string | undefined>();
  const [needs, setNeeds]             = useState<string[]>([]);
  const [otherText, setOtherText]     = useState("");

  const ELECTRICITY_OPTIONS = [
    { value: "no_damage",       label: t("community_impact.electricity_no_damage")       },
    { value: "minor_damage",    label: t("community_impact.electricity_minor_damage")    },
    { value: "moderate_damage", label: t("community_impact.electricity_moderate_damage") },
    { value: "severe_damage",   label: t("community_impact.electricity_severe_damage")   },
    { value: "destroyed",       label: t("community_impact.electricity_destroyed")       },
    { value: "unknown",         label: t("community_impact.electricity_unknown")         },
  ];

  const HEALTH_OPTIONS = [
    { value: "fully_functional",     label: t("community_impact.health_fully_functional")     },
    { value: "partially_functional", label: t("community_impact.health_partially_functional") },
    { value: "largely_disrupted",    label: t("community_impact.health_largely_disrupted")    },
    { value: "not_functioning",      label: t("community_impact.health_not_functioning")      },
    { value: "unknown",              label: t("community_impact.health_unknown")              },
  ];

  const NEEDS_OPTIONS = [
    { value: "food_water",     label: t("community_impact.need_food_water")     },
    { value: "cash",           label: t("community_impact.need_cash")           },
    { value: "healthcare",     label: t("community_impact.need_healthcare")     },
    { value: "shelter",        label: t("community_impact.need_shelter")        },
    { value: "livelihoods",    label: t("community_impact.need_livelihoods")    },
    { value: "wash",           label: t("community_impact.need_wash")           },
    { value: "basic_services", label: t("community_impact.need_basic_services") },
    { value: "protection",     label: t("community_impact.need_protection")     },
    { value: "local_support",  label: t("community_impact.need_local_support")  },
    { value: "other",          label: t("community_impact.need_other")          },
  ];

  function toggleNeed(val: string) {
    if (needs.includes(val)) {
      setNeeds(needs.filter((n) => n !== val));
      if (val === "other") setOtherText("");
    } else if (needs.length < 3) {
      setNeeds([...needs, val]);
    }
  }

  function handleConfirm() {
    const finalNeeds = needs.map((n) => {
      if (n === "other" && otherText.trim()) return `other:${otherText.trim()}`;
      return n;
    });
    onConfirm({ electricityStatus: electricity, healthStatus: health, pressingNeeds: finalNeeds });
  }

  const rowStyle = (selected: boolean, disabled: boolean) => ({
    minHeight: "var(--min-touch)",
    borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
    backgroundColor: selected
      ? "color-mix(in srgb, var(--color-primary) 9%, transparent)"
      : "var(--color-surface-2)",
    color: selected ? "var(--color-primary)" : disabled ? "var(--color-label)" : "var(--color-value)",
    opacity: disabled ? 0.4 : 1,
    textAlign: "left" as const,
  });

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3 flex-none" style={{ position: "relative", zIndex: 100 }}>
        <ProgressBar step={4} total={totalSteps} />
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted tracking-widest uppercase">
            {modeLabel ? `${modeLabel} — STEP 4 OF ${totalSteps}` : t("community_impact.step")}
          </p>
          <LanguageSelector variant="inline" />
        </div>
        <h2 className="text-base font-semibold" style={{ color: "var(--color-value)" }}>
          {t("community_impact.title")}
        </h2>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">

        {/* Electricity */}
        <section>
          <SectionLabel>{t("community_impact.electricity_section")}</SectionLabel>
          <div className="space-y-2">
            {ELECTRICITY_OPTIONS.map((opt) => {
              const selected = electricity === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setElectricity(selected ? undefined : opt.value)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99]"
                  style={rowStyle(selected, false)}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: selected ? "var(--color-primary)" : "var(--color-label)", flexShrink: 0 }} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Health services */}
        <section>
          <SectionLabel>{t("community_impact.health_section")}</SectionLabel>
          <div className="space-y-2">
            {HEALTH_OPTIONS.map((opt) => {
              const selected = health === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHealth(selected ? undefined : opt.value)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99]"
                  style={rowStyle(selected, false)}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: selected ? "var(--color-primary)" : "var(--color-label)", flexShrink: 0 }} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Pressing needs */}
        <section>
          <SectionLabel>{t("community_impact.needs_section")}</SectionLabel>
          <p className="text-xs mb-3" style={{ color: "var(--color-label)" }}>
            {t("community_impact.needs_hint")}
          </p>
          <div className="space-y-2">
            {NEEDS_OPTIONS.map((opt) => {
              const selected = needs.includes(opt.value);
              const maxReached = needs.length >= 3 && !selected;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={maxReached}
                  onClick={() => toggleNeed(opt.value)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99]"
                  style={rowStyle(selected, maxReached)}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: selected ? "var(--color-primary)" : "var(--color-label)", flexShrink: 0 }} />
                  {opt.label}
                </button>
              );
            })}
          </div>
          {needs.includes("other") && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder={t("community_impact.need_other_placeholder")}
              className="mt-3 w-full bg-surface-2 border rounded-lg px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
              style={{ borderColor: otherText.trim() ? "var(--color-accent)" : "var(--color-border)" }}
            />
          )}
          {needs.length > 0 && (
            <p className="text-xs mt-2" style={{ color: "var(--color-label)" }}>
              {needs.length}/3
            </p>
          )}
        </section>

      </div>

      {/* Footer */}
      <div className="flex-none px-4 pb-8 pt-3 border-t border-border flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border text-sm font-medium active:opacity-70"
          style={{ minHeight: "var(--min-touch)", minWidth: 120, borderColor: "var(--color-border)", color: "var(--color-label)" }}
        >
          {t("common.back")}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 rounded-xl text-white text-sm font-semibold active:opacity-80 transition-opacity"
          style={{ minHeight: "var(--min-touch)", minWidth: 120, backgroundColor: "var(--color-primary)" }}
        >
          {t("common.next")}
        </button>
      </div>
    </div>
  );
}
