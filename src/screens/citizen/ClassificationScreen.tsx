import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  InfrastructureType, CrisisNature, CrisisSubtype,
} from "../../types/schema";
import type { DisasterType } from "../../types/schema";
import { DISASTER_CATEGORY_OPTIONS, SEVERITY_OPTIONS } from "../../constants/disasterDamage";

export interface ClassificationData {
  damageLevel: string;
  damageLevelLabel: string;
  infrastructureType: InfrastructureType;
  infrastructureTypeOther?: string;
  crisisNature: CrisisNature;
  crisisSubtype: CrisisSubtype;
  debrisClearingNeeded: boolean;
}

interface Props {
  disasterType: DisasterType;
  defaultSubtype?: CrisisSubtype;
  onConfirm: (data: ClassificationData) => void;
  onBack: () => void;
  modeLabel?: string;
  totalSteps?: number;
}

// ── Icons ────────────────────────────────────────────────────────────────────

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

function subtypeToNature(sub: CrisisSubtype): CrisisNature {
  const natural: CrisisSubtype[] = ["earthquake", "flood", "tsunami", "hurricane_cyclone", "wildfire"];
  const technological: CrisisSubtype[] = ["explosion", "chemical_incident"];
  if (natural.includes(sub)) return "natural";
  if (technological.includes(sub)) return "technological";
  return "human_made";
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ClassificationScreen({ disasterType, defaultSubtype, onConfirm, onBack, modeLabel, totalSteps = 5 }: Props) {
  const { t } = useTranslation();
  const [damageLevel, setDamageLevel] = useState<string | null>(null);
  const [damageCategory, setDamageCategory] = useState<string | null>(null);
  const [infraType, setInfraType] = useState<InfrastructureType | null>(null);
  const [infraOther, setInfraOther] = useState("");
  const [subtype, setSubtype] = useState<CrisisSubtype | null>(defaultSubtype ?? null);
  const [debrisNeeded, setDebrisNeeded] = useState<boolean>(false);

  const crisisNature = subtype ? subtypeToNature(subtype) : null;
  const isGeneric = disasterType === "generic";
  const categories = DISASTER_CATEGORY_OPTIONS[disasterType] ?? [];

  const canAdvance =
    damageLevel !== null &&
    (isGeneric || damageCategory !== null) &&
    infraType !== null &&
    (infraType !== "other" || infraOther.trim().length > 0) &&
    subtype !== null;

  function handleConfirm() {
    if (!canAdvance || !damageLevel || !infraType || !subtype || !crisisNature) return;
    const severityOpt = SEVERITY_OPTIONS.find((o) => o.value === damageLevel);
    onConfirm({
      damageLevel,
      damageLevelLabel: isGeneric
        ? (severityOpt?.label ?? damageLevel)
        : (damageCategory ?? damageLevel),
      infrastructureType: infraType,
      infrastructureTypeOther: infraType === "other" ? infraOther.trim() : undefined,
      crisisNature,
      crisisSubtype: subtype,
      debrisClearingNeeded: debrisNeeded,
    });
  }

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

  const NATURE_GROUPS: { nature: CrisisNature; tKey: string; subtypes: { value: CrisisSubtype; tKey: string }[] }[] = [
    {
      nature: "natural", tKey: "classification.nature_natural",
      subtypes: [
        { value: "earthquake",        tKey: "classification.subtype_earthquake"      },
        { value: "flood",             tKey: "classification.subtype_flood"           },
        { value: "tsunami",           tKey: "classification.subtype_tsunami"         },
        { value: "hurricane_cyclone", tKey: "classification.subtype_hurricane_cyclone" },
        { value: "wildfire",          tKey: "classification.subtype_wildfire"        },
      ],
    },
    {
      nature: "technological", tKey: "classification.nature_technological",
      subtypes: [
        { value: "explosion",         tKey: "classification.subtype_explosion"         },
        { value: "chemical_incident", tKey: "classification.subtype_chemical_incident" },
      ],
    },
    {
      nature: "human_made", tKey: "classification.nature_human_made",
      subtypes: [
        { value: "conflict",    tKey: "classification.subtype_conflict"    },
        { value: "civil_unrest", tKey: "classification.subtype_civil_unrest" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary">

      {/* Header — fixed */}
      <div className="px-4 pt-4 pb-3 space-y-3 flex-none">
        <ProgressBar step={3} total={totalSteps} />
        <p className="text-xs text-text-muted text-center tracking-widest uppercase">
          {modeLabel ? `${modeLabel} — STEP 3 OF ${totalSteps}` : t("classification.step")}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">

        {/* ── Damage category (non-generic only) ── */}
        {!isGeneric && categories.length > 0 && (
          <section>
            <SectionLabel>{t("classification.category_section")}</SectionLabel>
            <div className="space-y-2">
              {categories.map((cat) => {
                const selected = damageCategory === cat;
                const key = `classification.cat_${disasterType}_${cat.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDamageCategory(cat)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-[0.99]"
                    style={{
                      borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                      backgroundColor: selected
                        ? "color-mix(in srgb, var(--color-primary) 9%, transparent)"
                        : "var(--color-surface-2)",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: selected ? "var(--color-primary)" : "var(--color-label)", flexShrink: 0 }} />
                    <span className="text-sm font-medium" style={{ color: selected ? "var(--color-primary)" : "var(--color-value)" }}>
                      {t(key, cat)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Severity (all types) ── */}
        <section>
          <SectionLabel>{t("classification.severity_section")}</SectionLabel>
          <div className="space-y-2">
            {SEVERITY_OPTIONS.map((opt) => {
              const selected = damageLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDamageLevel(opt.value)}
                  className="w-full flex items-start gap-4 px-4 py-3.5 rounded-xl border transition-all active:scale-[0.99]"
                  style={{
                    borderColor: selected ? opt.color : "var(--color-border)",
                    backgroundColor: selected ? `color-mix(in srgb, ${opt.color} 9%, transparent)` : "var(--color-surface-2)",
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: opt.color, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <p className="text-sm font-semibold" style={{ color: selected ? opt.color : "var(--color-value)" }}>
                      {t(`classification.severity_${opt.value}`, opt.label)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-label)" }}>
                      {opt.description}
                    </p>
                  </div>
                  {selected && (
                    <span className="ml-auto flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: opt.color, marginTop: 2 }}>
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
          <SectionLabel>{t("classification.infra_section")}</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {INFRA_OPTIONS.map((opt) => {
              const selected = infraType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInfraType(opt.value)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border transition-all active:scale-95"
                  style={{
                    minHeight: "var(--min-touch)",
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                    backgroundColor: selected ? "color-mix(in srgb, var(--color-primary) 9%, var(--color-surface-2))" : "var(--color-surface-2)",
                    color: selected ? "var(--color-primary)" : "var(--color-label)",
                  }}
                >
                  <InfraIcon type={opt.value} />
                  <span className="text-[10px] leading-tight text-center"
                    style={{ color: selected ? "var(--color-value)" : "var(--color-label)" }}>
                    {t(opt.tKey)}
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
              placeholder={t("classification.infra_placeholder")}
              className="mt-3 w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          )}
        </section>

        {/* ── Crisis type ── */}
        <section>
          <SectionLabel>{t("classification.crisis_section")}</SectionLabel>
          <div className="space-y-3">
            {NATURE_GROUPS.map((group) => (
              <div key={group.nature}>
                <p className="text-[11px] uppercase tracking-wide mb-2" style={{ color: "var(--color-label)" }}>{t(group.tKey)}</p>
                <div className="flex flex-wrap gap-2">
                  {group.subtypes.map((s) => {
                    const selected = subtype === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSubtype(s.value)}
                        className="px-4 rounded-full border text-xs font-medium transition-all active:scale-95"
                        style={{
                          minHeight: "var(--min-touch)",
                          borderColor: selected ? "var(--color-warning)" : "var(--color-border)",
                          backgroundColor: selected ? "color-mix(in srgb, var(--color-warning) 13%, transparent)" : "var(--color-surface-2)",
                          color: selected ? "var(--color-warning)" : "var(--color-value)",
                        }}
                      >
                        {t(s.tKey)}
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
          <SectionLabel>{t("classification.debris_section")}</SectionLabel>
          <div className="flex gap-3">
            {[true, false].map((val) => {
              const selected = debrisNeeded === val;
              return (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setDebrisNeeded(val)}
                  className="flex-1 rounded-xl border text-sm font-medium transition-all active:scale-[0.98]"
                  style={{
                    minHeight: "var(--min-touch)",
                    borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                    backgroundColor: selected ? "color-mix(in srgb, var(--color-primary) 9%, var(--color-surface-2))" : "var(--color-surface-2)",
                    color: selected ? "var(--color-primary)" : "var(--color-value)",
                  }}
                >
                  {val ? t("review.yes") : t("review.no")}
                </button>
              );
            })}
          </div>
        </section>

        {/* Validation hint */}
        {!canAdvance && (
          <p className="text-xs text-text-muted text-center">
            {t(isGeneric ? "classification.validation_hint_generic" : "classification.validation_hint")}
          </p>
        )}
      </div>

      {/* Footer — fixed */}
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
