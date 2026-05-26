import { useState } from "react";
import type { ModularFields } from "../../types/schema";

export interface DetailsData {
  infrastructureName: string;
  infrastructureDescription?: string;
  modularFields: ModularFields;
}

interface Props {
  modularFieldsEnabled?: boolean;
  onConfirm: (data: DetailsData) => void;
  onBack: () => void;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ElectricityCondition = NonNullable<ModularFields["electricity_condition"]>;
type HealthServices       = NonNullable<ModularFields["health_services"]>;
type PressingNeed         = NonNullable<ModularFields["pressing_needs"]>[number];

// ── Data ──────────────────────────────────────────────────────────────────────

const ELECTRICITY_OPTIONS: { value: ElectricityCondition; label: string }[] = [
  { value: "no_damage",       label: "No damage"       },
  { value: "minor_damage",    label: "Minor damage"    },
  { value: "moderate_damage", label: "Moderate damage" },
  { value: "severe_damage",   label: "Severe damage"   },
  { value: "no_service",      label: "No service"      },
];

const HEALTH_OPTIONS: { value: HealthServices; label: string }[] = [
  { value: "fully_functional",    label: "Fully functional"    },
  { value: "partially_functional", label: "Partially functional" },
  { value: "not_functional",      label: "Not functional"      },
  { value: "unknown",             label: "Unknown"             },
];

const NEEDS_OPTIONS: { value: PressingNeed; label: string }[] = [
  { value: "food",           label: "Food"          },
  { value: "water",          label: "Water"         },
  { value: "medical_care",   label: "Medical care"  },
  { value: "shelter",        label: "Shelter"       },
  { value: "electricity",    label: "Electricity"   },
  { value: "sanitation",     label: "Sanitation"    },
  { value: "communication",  label: "Communication" },
  { value: "transport",      label: "Transport"     },
  { value: "other",          label: "Other"         },
];

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
  return <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{children}</p>;
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
            className="px-3 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95"
            style={{
              borderColor: selected ? "#e86c2c" : "#2a2a28",
              backgroundColor: selected ? "#e86c2c22" : "#1e1e1c",
              color: selected ? "#e86c2c" : "#a8a8a5",
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
            className="px-3 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95"
            style={{
              borderColor: selected ? "#3ecf8e" : "#2a2a28",
              backgroundColor: selected ? "#3ecf8e22" : "#1e1e1c",
              color: selected ? "#3ecf8e" : "#a8a8a5",
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

export default function DetailsScreen({ modularFieldsEnabled = false, onConfirm, onBack }: Props) {
  const [name, setName]         = useState("");
  const [description, setDesc]  = useState("");
  const [electricity, setElec]  = useState<ElectricityCondition | undefined>();
  const [health, setHealth]     = useState<HealthServices | undefined>();
  const [needs, setNeeds]       = useState<PressingNeed[]>([]);

  const canAdvance = name.trim().length > 0;

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
      <div className="px-4 pt-4 pb-3 space-y-3 flex-none">
        <ProgressBar step={4} total={5} />
        <p className="text-xs text-text-muted text-center tracking-widest uppercase">Step 4 of 5</p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">

        {/* ── Infrastructure name ── */}
        <section>
          <SectionLabel>Infrastructure name *</SectionLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name or description of this infrastructure"
            className="w-full bg-surface-2 border rounded-lg px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
            style={{ borderColor: name.trim() ? "#e86c2c" : "#2a2a28" }}
          />
          {!name.trim() && (
            <p className="text-xs text-text-muted mt-1.5">Required to continue</p>
          )}
        </section>

        {/* ── Description ── */}
        <section>
          <SectionLabel>Additional details</SectionLabel>
          <textarea
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Optional — visible damage, context, access issues…"
            rows={3}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none transition-colors"
          />
        </section>

        {/* ── Modular fields (conditional) ── */}
        {modularFieldsEnabled && (
          <>
            {/* Electricity condition */}
            <section>
              <SectionLabel>Electricity condition</SectionLabel>
              <SingleSelect
                options={ELECTRICITY_OPTIONS}
                value={electricity}
                onChange={setElec}
              />
            </section>

            {/* Health services */}
            <section>
              <SectionLabel>Health services</SectionLabel>
              <SingleSelect
                options={HEALTH_OPTIONS}
                value={health}
                onChange={setHealth}
              />
            </section>

            {/* Pressing needs */}
            <section>
              <SectionLabel>Most pressing needs</SectionLabel>
              <MultiSelect
                options={NEEDS_OPTIONS}
                value={needs}
                onChange={setNeeds}
              />
              {needs.length > 0 && (
                <p className="text-xs text-text-muted mt-2">
                  {needs.length} selected
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
          className="flex-1 py-3 rounded-xl border border-border text-text-secondary text-sm font-medium active:opacity-70"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canAdvance}
          className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-semibold disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
