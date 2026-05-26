import { useState } from "react";
import {
  DamageLevel, InfrastructureType, CrisisNature, CrisisSubtype,
} from "../../types/schema";

export interface ClassificationData {
  damageLevel: DamageLevel;
  infrastructureType: InfrastructureType;
  infrastructureTypeOther?: string;
  crisisNature: CrisisNature;
  crisisSubtype: CrisisSubtype;
  debrisClearingNeeded: boolean;
}

interface Props {
  defaultSubtype?: CrisisSubtype;
  onConfirm: (data: ClassificationData) => void;
  onBack: () => void;
}

// ── Icons ────────────────────────────────────────────────────────────────────

function HouseIcon({ variant = "intact" }: { variant?: "intact" | "cracked" | "destroyed" }) {
  if (variant === "cracked") return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 13L14 4l11 9M6 11v11h7M22 11v11h-5" />
      <path d="M13 22v-6l2 2 1-4 2 4" strokeWidth="1.4" />
    </svg>
  );
  if (variant === "destroyed") return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 13L14 4l11 9" strokeDasharray="3 2" />
      <path d="M6 13v9M22 13v9M6 22h16" />
      <path d="M10 22v-5l2-2M18 22v-4l-3-3M12 12l3 3 3-3" strokeWidth="1.4" />
    </svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 13L14 4l11 9M6 11v11h16V11" />
      <rect x="11" y="16" width="6" height="6" rx="0.5" />
    </svg>
  );
}

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

// ── Data ─────────────────────────────────────────────────────────────────────

const DAMAGE_OPTIONS: { value: DamageLevel; label: string; variant: "intact" | "cracked" | "destroyed"; color: string }[] = [
  { value: "minimal",  label: "Minimal / No damage",    variant: "intact",    color: "#3ecf8e" },
  { value: "partial",  label: "Partially damaged",      variant: "cracked",   color: "#f59e0b" },
  { value: "complete", label: "Completely damaged",     variant: "destroyed", color: "#e84040" },
];

const INFRA_OPTIONS: { value: InfrastructureType; label: string }[] = [
  { value: "residential",       label: "Residential"    },
  { value: "commercial",        label: "Commercial"     },
  { value: "government",        label: "Government"     },
  { value: "utility",           label: "Utility"        },
  { value: "transport_comm",    label: "Transport"      },
  { value: "community",         label: "Community"      },
  { value: "public_recreation", label: "Recreation"     },
  { value: "other",             label: "Other"          },
];

const NATURE_GROUPS: { nature: CrisisNature; label: string; subtypes: { value: CrisisSubtype; label: string }[] }[] = [
  {
    nature: "natural", label: "Natural",
    subtypes: [
      { value: "earthquake",        label: "Earthquake"    },
      { value: "flood",             label: "Flood"         },
      { value: "tsunami",           label: "Tsunami"       },
      { value: "hurricane_cyclone", label: "Hurricane"     },
      { value: "wildfire",          label: "Wildfire"      },
    ],
  },
  {
    nature: "technological", label: "Technological",
    subtypes: [
      { value: "explosion",         label: "Explosion"         },
      { value: "chemical_incident", label: "Chemical incident" },
    ],
  },
  {
    nature: "human_made", label: "Human-made",
    subtypes: [
      { value: "conflict",          label: "Conflict"     },
      { value: "civil_unrest",      label: "Civil unrest" },
    ],
  },
];

function subtypeToNature(sub: CrisisSubtype): CrisisNature {
  for (const g of NATURE_GROUPS) {
    if (g.subtypes.some((s) => s.value === sub)) return g.nature;
  }
  return "natural";
}

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

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ClassificationScreen({ defaultSubtype, onConfirm, onBack }: Props) {
  const [damageLevel, setDamageLevel] = useState<DamageLevel | null>(null);
  const [infraType, setInfraType] = useState<InfrastructureType | null>(null);
  const [infraOther, setInfraOther] = useState("");
  const [subtype, setSubtype] = useState<CrisisSubtype | null>(defaultSubtype ?? null);
  const [debrisNeeded, setDebrisNeeded] = useState<boolean>(false);

  const crisisNature = subtype ? subtypeToNature(subtype) : null;

  const canAdvance =
    damageLevel !== null &&
    infraType !== null &&
    (infraType !== "other" || infraOther.trim().length > 0) &&
    subtype !== null;

  function handleConfirm() {
    if (!canAdvance || !damageLevel || !infraType || !subtype || !crisisNature) return;
    onConfirm({
      damageLevel,
      infrastructureType: infraType,
      infrastructureTypeOther: infraType === "other" ? infraOther.trim() : undefined,
      crisisNature,
      crisisSubtype: subtype,
      debrisClearingNeeded: debrisNeeded,
    });
  }

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary">

      {/* Header — fixed */}
      <div className="px-4 pt-4 pb-3 space-y-3 flex-none">
        <ProgressBar step={3} total={5} />
        <p className="text-xs text-text-muted text-center tracking-widest uppercase">Step 3 of 5</p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">

        {/* ── Damage level ── */}
        <section>
          <SectionLabel>Damage level *</SectionLabel>
          <div className="space-y-2">
            {DAMAGE_OPTIONS.map((opt) => {
              const selected = damageLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDamageLevel(opt.value)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all active:scale-[0.99]"
                  style={{
                    borderColor: selected ? opt.color : "#2a2a28",
                    backgroundColor: selected ? `${opt.color}18` : "#1e1e1c",
                    color: selected ? opt.color : "#a8a8a5",
                  }}
                >
                  <span style={{ color: selected ? opt.color : "#6b6b68" }}>
                    <HouseIcon variant={opt.variant} />
                  </span>
                  <span className="text-sm font-medium text-left">{opt.label}</span>
                  {selected && (
                    <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: opt.color }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Infrastructure type ── */}
        <section>
          <SectionLabel>Infrastructure type *</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {INFRA_OPTIONS.map((opt) => {
              const selected = infraType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInfraType(opt.value)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all active:scale-95"
                  style={{
                    borderColor: selected ? "#e86c2c" : "#2a2a28",
                    backgroundColor: selected ? "#e86c2c18" : "#1e1e1c",
                    color: selected ? "#e86c2c" : "#6b6b68",
                  }}
                >
                  <InfraIcon type={opt.value} />
                  <span className="text-[10px] leading-tight text-center"
                    style={{ color: selected ? "#f5f5f4" : "#6b6b68" }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {infraType === "other" && (
            <input
              type="text"
              value={infraOther}
              onChange={(e) => setInfraOther(e.target.value)}
              placeholder="Describe infrastructure type…"
              className="mt-3 w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          )}
        </section>

        {/* ── Crisis type ── */}
        <section>
          <SectionLabel>Crisis type *</SectionLabel>
          <div className="space-y-3">
            {NATURE_GROUPS.map((group) => (
              <div key={group.nature}>
                <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.subtypes.map((s) => {
                    const selected = subtype === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSubtype(s.value)}
                        className="px-3 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95"
                        style={{
                          borderColor: selected ? "#f59e0b" : "#2a2a28",
                          backgroundColor: selected ? "#f59e0b22" : "#1e1e1c",
                          color: selected ? "#f59e0b" : "#a8a8a5",
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Debris clearing ── */}
        <section>
          <SectionLabel>Debris clearing needed?</SectionLabel>
          <div className="flex gap-3">
            {[true, false].map((val) => {
              const selected = debrisNeeded === val;
              return (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setDebrisNeeded(val)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98]"
                  style={{
                    borderColor: selected ? "#e86c2c" : "#2a2a28",
                    backgroundColor: selected ? "#e86c2c18" : "#1e1e1c",
                    color: selected ? "#e86c2c" : "#a8a8a5",
                  }}
                >
                  {val ? "Yes" : "No"}
                </button>
              );
            })}
          </div>
        </section>

        {/* Validation hint */}
        {!canAdvance && (
          <p className="text-xs text-text-muted text-center">
            Select damage level, infrastructure type, and crisis type to continue
          </p>
        )}
      </div>

      {/* Footer — fixed */}
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
