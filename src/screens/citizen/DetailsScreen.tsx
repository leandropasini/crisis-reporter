import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";
import type { ModularFields } from "../../types/schema";

export interface DetailsData {
  infrastructureName: string;
  infrastructureDescription?: string;
  modularFields: ModularFields;
}

interface Props {
  modularFieldsEnabled?: boolean;
  initialName?: string;
  onConfirm: (data: DetailsData) => void;
  onBack: () => void;
  modeLabel?: string;
  totalSteps?: number;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ElectricityCondition = NonNullable<ModularFields["electricity_condition"]>;
type HealthServices       = NonNullable<ModularFields["health_services"]>;
type PressingNeed         = NonNullable<ModularFields["pressing_needs"]>[number];

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
      <div className="h-full bg-amber-400 rounded-full transition-all duration-300"
        style={{ width: `${(step / total) * 100}%` }} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider mb-3"
      style={{ fontSize: "var(--font-label)", color: "var(--color-label)" }}>
      {children}
    </p>
  );
}

function SingleSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-4 rounded-full border text-xs font-medium transition-all active:scale-95"
            style={{
              minHeight: "var(--min-touch)",
              borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
              backgroundColor: selected ? "color-mix(in srgb, var(--color-primary) 13%, var(--color-surface-2))" : "var(--color-surface-2)",
              color: selected ? "var(--color-primary)" : "var(--color-value)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: { value: PressingNeed; label: string }[];
  value: PressingNeed[];
  onChange: (v: PressingNeed[]) => void;
}) {
  function toggle(opt: PressingNeed) {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className="px-4 rounded-full border text-xs font-medium transition-all active:scale-95"
            style={{
              minHeight: "var(--min-touch)",
              borderColor: selected ? "var(--color-minimal)" : "var(--color-border)",
              backgroundColor: selected ? "color-mix(in srgb, var(--color-minimal) 13%, var(--color-surface-2))" : "var(--color-surface-2)",
              color: selected ? "var(--color-minimal)" : "var(--color-value)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function DetailsScreen({ modularFieldsEnabled = false, initialName, onConfirm, onBack, modeLabel, totalSteps = 5 }: Props) {
  const { t } = useTranslation();
  const [name, setName]         = useState(initialName ?? "");
  const [description, setDesc]  = useState("");
  const [electricity, setElec]  = useState<ElectricityCondition | undefined>();
  const [health, setHealth]     = useState<HealthServices | undefined>();
  const [needs, setNeeds]       = useState<PressingNeed[]>([]);

  const canAdvance = name.trim().length > 0;

  const ELECTRICITY_OPTIONS: { value: ElectricityCondition; label: string }[] = [
    { value: "no_damage",       label: t("details.elec_no_damage")       },
    { value: "minor_damage",    label: t("details.elec_minor_damage")    },
    { value: "moderate_damage", label: t("details.elec_moderate_damage") },
    { value: "severe_damage",   label: t("details.elec_severe_damage")   },
    { value: "no_service",      label: t("details.elec_no_service")      },
  ];

  const HEALTH_OPTIONS: { value: HealthServices; label: string }[] = [
    { value: "fully_functional",     label: t("details.health_fully_functional")     },
    { value: "partially_functional", label: t("details.health_partially_functional") },
    { value: "not_functional",       label: t("details.health_not_functional")       },
    { value: "unknown",              label: t("details.health_unknown")              },
  ];

  const NEEDS_OPTIONS: { value: PressingNeed; label: string }[] = [
    { value: "food",          label: t("details.need_food")          },
    { value: "water",         label: t("details.need_water")         },
    { value: "medical_care",  label: t("details.need_medical_care")  },
    { value: "shelter",       label: t("details.need_shelter")       },
    { value: "electricity",   label: t("details.need_electricity")   },
    { value: "sanitation",    label: t("details.need_sanitation")    },
    { value: "communication", label: t("details.need_communication") },
    { value: "transport",     label: t("details.need_transport")     },
    { value: "other",         label: t("details.need_other")         },
  ];

  function handleConfirm() {
    if (!canAdvance) return;
    const modularFields: ModularFields = {};
    if (modularFieldsEnabled) {
      if (electricity) modularFields.electricity_condition = electricity;
      if (health)      modularFields.health_services = health;
      if (needs.length) modularFields.pressing_needs = needs;
    }
    onConfirm({
      infrastructureName: name.trim(),
      infrastructureDescription: description.trim() || undefined,
      modularFields,
    });
  }

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3 flex-none" style={{ position: "relative", zIndex: 100 }}>
        <ProgressBar step={4} total={totalSteps} />
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted tracking-widest uppercase">
            {modeLabel ? `${modeLabel} — STEP 4 OF ${totalSteps}` : t("details.step")}
          </p>
          <LanguageSelector variant="inline" />
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">

        {/* ── Infrastructure name ── */}
        <section>
          <SectionLabel>{t("details.name_section")}</SectionLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("details.name_placeholder")}
            className="w-full bg-surface-2 border rounded-lg px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
            style={{ borderColor: name.trim() ? "var(--color-accent)" : "var(--color-border)" }}
          />
          {!name.trim() && (
            <p className="text-xs text-text-muted mt-1.5">{t("details.name_required")}</p>
          )}
        </section>

        {/* ── Description ── */}
        <section>
          <SectionLabel>{t("details.details_section")}</SectionLabel>
          <textarea
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={t("details.details_placeholder")}
            rows={3}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none transition-colors"
          />
        </section>

        {/* ── Modular fields (conditional) ── */}
        {modularFieldsEnabled && (
          <>
            {/* Electricity condition */}
            <section>
              <SectionLabel>{t("details.electricity_section")}</SectionLabel>
              <SingleSelect
                options={ELECTRICITY_OPTIONS}
                value={electricity}
                onChange={setElec}
              />
            </section>

            {/* Health services */}
            <section>
              <SectionLabel>{t("details.health_section")}</SectionLabel>
              <SingleSelect
                options={HEALTH_OPTIONS}
                value={health}
                onChange={setHealth}
              />
            </section>

            {/* Pressing needs */}
            <section>
              <SectionLabel>{t("details.needs_section")}</SectionLabel>
              <MultiSelect
                options={NEEDS_OPTIONS}
                value={needs}
                onChange={setNeeds}
              />
              {needs.length > 0 && (
                <p className="text-xs text-text-muted mt-2">
                  {t("details.selected_count", { count: needs.length })}
                </p>
              )}
            </section>
          </>
        )}
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
          disabled={!canAdvance}
          className="flex-1 rounded-xl text-white text-sm font-semibold disabled:opacity-40 active:opacity-80 transition-opacity"
          style={{ minHeight: "var(--min-touch)", minWidth: 120, backgroundColor: "var(--color-primary)" }}
        >
          {t("common.next")}
        </button>
      </div>
    </div>
  );
}
