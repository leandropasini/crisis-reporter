import { useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { IconBolt, IconActivityHeartbeat, IconAlertTriangle, IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import type { IconProps } from "@tabler/icons-react";
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

const ORANGE = "#F97316";

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

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: `2px solid ${selected ? ORANGE : "var(--color-border)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {selected && <span style={{ width: 8, height: 8, borderRadius: "50%", background: ORANGE }} />}
    </span>
  );
}

function CheckBox({ selected, disabled }: { selected: boolean; disabled: boolean }) {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        border: `2px solid ${selected ? ORANGE : "var(--color-border)"}`,
        background: selected ? ORANGE : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {selected && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function pillStyle(selected: boolean, disabled: boolean) {
  return {
    minHeight: "var(--min-touch)",
    borderColor: selected ? ORANGE : "var(--color-border)",
    backgroundColor: selected
      ? `color-mix(in srgb, ${ORANGE} 12%, var(--color-surface-2))`
      : "var(--color-surface-2)",
    color: disabled ? "var(--color-label)" : "var(--color-value)",
    opacity: disabled ? 0.4 : 1,
    textAlign: "left" as const,
  };
}

interface AccordionSectionProps {
  Icon: ComponentType<IconProps>;
  title: string;
  isOpen: boolean;
  hasSelection: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ Icon, title, isOpen, hasSelection, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 transition-colors"
        style={{
          minHeight: "var(--min-touch)",
          backgroundColor: isOpen
            ? "color-mix(in srgb, var(--color-surface-2) 100%, white 6%)"
            : "var(--color-surface-2)",
        }}
      >
        <Icon size={24} style={{ color: ORANGE, flexShrink: 0 }} />
        <span
          className="flex-1 text-base font-semibold text-left"
          style={{ color: ORANGE }}
        >
          {title}
        </span>
        {hasSelection && (
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: ORANGE, flexShrink: 0 }} />
        )}
        {isOpen
          ? <IconChevronUp size={18} style={{ color: "var(--color-label)", flexShrink: 0 }} />
          : <IconChevronDown size={18} style={{ color: "var(--color-label)", flexShrink: 0 }} />}
      </button>
      <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 200ms ease" }}>
        <div style={{ overflow: "hidden", minHeight: 0 }}>
          <div className="px-3 py-3 space-y-2" style={{ borderTop: "1px solid var(--color-border)" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityImpactScreen({
  onConfirm,
  modeLabel,
  totalSteps = 6,
}: Props) {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<number | null>(0);
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

  function toggleSection(i: number) {
    setOpenSection(openSection === i ? null : i);
  }

  function handleConfirm() {
    const finalNeeds = needs.map((n) => {
      if (n === "other" && otherText.trim()) return `other:${otherText.trim()}`;
      return n;
    });
    onConfirm({ electricityStatus: electricity, healthStatus: health, pressingNeeds: finalNeeds });
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-surface text-text-primary">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3 flex-none" style={{ position: "relative", zIndex: 100, paddingTop: "calc(16px + var(--demo-disclaimer-h, 0px))" }}>
        <ProgressBar step={4} total={totalSteps} />
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted tracking-widest uppercase">
            {modeLabel ? `${modeLabel} — ${t("common.step_of", { step: 4, total: totalSteps })}` : t("community_impact.step")}
          </p>
          <LanguageSelector variant="inline" />
        </div>
        <h2 className="text-base font-semibold" style={{ color: "var(--color-value)" }}>
          {t("community_impact.title")}
        </h2>
      </div>

      {/* Scrollable accordion body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">

        <AccordionSection
          Icon={IconBolt}
          title={t("community_impact.electricity_section")}
          isOpen={openSection === 0}
          hasSelection={electricity !== undefined}
          onToggle={() => toggleSection(0)}
        >
          {ELECTRICITY_OPTIONS.map((opt) => {
            const selected = electricity === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setElectricity(selected ? undefined : opt.value)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99]"
                style={pillStyle(selected, false)}
              >
                <RadioDot selected={selected} />
                {opt.label}
              </button>
            );
          })}
        </AccordionSection>

        <AccordionSection
          Icon={IconActivityHeartbeat}
          title={t("community_impact.health_section")}
          isOpen={openSection === 1}
          hasSelection={health !== undefined}
          onToggle={() => toggleSection(1)}
        >
          {HEALTH_OPTIONS.map((opt) => {
            const selected = health === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setHealth(selected ? undefined : opt.value)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99]"
                style={pillStyle(selected, false)}
              >
                <RadioDot selected={selected} />
                {opt.label}
              </button>
            );
          })}
        </AccordionSection>

        <AccordionSection
          Icon={IconAlertTriangle}
          title={t("community_impact.needs_section")}
          isOpen={openSection === 2}
          hasSelection={needs.length > 0}
          onToggle={() => toggleSection(2)}
        >
          <p className="text-xs" style={{ color: "var(--color-label)" }}>
            {t("community_impact.needs_hint")}
          </p>
          {NEEDS_OPTIONS.map((opt) => {
            const selected = needs.includes(opt.value);
            const maxReached = needs.length >= 3 && !selected;
            return (
              <div key={opt.value}>
                <button
                  type="button"
                  disabled={maxReached}
                  onClick={() => toggleNeed(opt.value)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99]"
                  style={pillStyle(selected, maxReached)}
                >
                  <CheckBox selected={selected} disabled={maxReached} />
                  {opt.label}
                </button>
                {opt.value === "other" && selected && (
                  <input
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder={t("community_impact.need_other_placeholder")}
                    className="mt-2 w-full bg-surface-2 border rounded-lg px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                    style={{ borderColor: otherText.trim() ? ORANGE : "var(--color-border)" }}
                  />
                )}
              </div>
            );
          })}
          {needs.length > 0 && (
            <p className="text-xs" style={{ color: "var(--color-label)" }}>
              {needs.length}/3
            </p>
          )}
        </AccordionSection>

      </div>

      {/* Footer */}
      <div className="flex-none px-4 pb-8 pt-3 border-t border-border">
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full rounded-xl text-white text-sm font-semibold active:opacity-80 transition-opacity"
          style={{ minHeight: "var(--min-touch)", backgroundColor: ORANGE }}
        >
          {t("common.next")}
        </button>
      </div>
    </div>
  );
}
