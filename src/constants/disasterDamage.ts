import type { DamageLevel, DisasterType } from "../types/schema";

export interface DamageOption {
  value: string;
  label: string;
  description: string;
  displayLevel: DamageLevel;
}

export const DISASTER_DAMAGE_OPTIONS: Record<DisasterType, DamageOption[]> = {
  flood: [
    { value: "flood_partial",    label: "Partial flooding",        description: "Water entered ground floor",             displayLevel: "partial"  },
    { value: "flood_full",       label: "Full flooding",           description: "Building submerged above first floor",   displayLevel: "complete" },
    { value: "flood_structural", label: "Structural damage",       description: "Walls compromised by water pressure",    displayLevel: "complete" },
    { value: "flood_erosion",    label: "Foundation erosion",      description: "Building at risk of collapse",           displayLevel: "complete" },
    { value: "flood_complete",   label: "Complete loss",           description: "Swept away or uninhabitable",            displayLevel: "complete" },
  ],
  earthquake: [
    { value: "eq_hairline",     label: "Hairline cracks",         description: "Plaster and finishing only",             displayLevel: "minimal"  },
    { value: "eq_structural",   label: "Structural cracks",       description: "Load-bearing walls affected",            displayLevel: "partial"  },
    { value: "eq_partial",      label: "Partial collapse",        description: "One or more sections down",              displayLevel: "complete" },
    { value: "eq_complete",     label: "Complete collapse",       description: "Building destroyed",                     displayLevel: "complete" },
    { value: "eq_liquefaction", label: "Ground instability",      description: "Liquefaction or soil failure",           displayLevel: "complete" },
  ],
  hurricane: [
    { value: "hur_roof_partial", label: "Roof partially damaged", description: "Tiles or sheeting lost",                 displayLevel: "partial"  },
    { value: "hur_roof_full",    label: "Roof destroyed",         description: "Complete roof loss",                     displayLevel: "complete" },
    { value: "hur_facade",       label: "Windows and facades",    description: "Blown out or shattered",                 displayLevel: "partial"  },
    { value: "hur_structural",   label: "Structural damage",      description: "Damage by wind pressure",                displayLevel: "complete" },
    { value: "hur_complete",     label: "Complete destruction",   description: "Building uninhabitable",                 displayLevel: "complete" },
  ],
  landslide: [
    { value: "ls_partial",      label: "Partially buried",        description: "Debris reached the structure",           displayLevel: "partial"  },
    { value: "ls_foundation",   label: "Foundation undermined",   description: "Ground removed beneath building",        displayLevel: "complete" },
    { value: "ls_access",       label: "Access blocked",          description: "Route to building cut off",              displayLevel: "minimal"  },
    { value: "ls_complete",     label: "Complete burial",         description: "Building destroyed or buried",           displayLevel: "complete" },
  ],
  fire: [
    { value: "fire_smoke",      label: "Smoke damage",            description: "Superficial, structure intact",          displayLevel: "minimal"  },
    { value: "fire_partial",    label: "Partial burn",            description: "One section affected",                   displayLevel: "partial"  },
    { value: "fire_major",      label: "Major burn",              description: "Structural integrity compromised",       displayLevel: "complete" },
    { value: "fire_complete",   label: "Complete loss",           description: "Total destruction",                      displayLevel: "complete" },
  ],
  drought: [
    { value: "dr_cracking",     label: "Infrastructure cracking", description: "Damage from heat or dryness",           displayLevel: "partial"  },
    { value: "dr_water",        label: "Water supply disrupted",  description: "No running water",                       displayLevel: "partial"  },
    { value: "dr_health",       label: "Health facility stressed",description: "Overwhelmed or non-functional",          displayLevel: "complete" },
    { value: "dr_access",       label: "Access compromised",      description: "Roads or routes unusable",               displayLevel: "minimal"  },
  ],
  tsunami:           [],
  conflict:          [],
  civil_unrest:      [],
  explosion:         [],
  chemical_incident: [],
  generic: [
    { value: "minimal",         label: "Minimal",                 description: "Cracks in plaster, broken windows",     displayLevel: "minimal"  },
    { value: "partial",         label: "Partially damaged",       description: "Large wall cracks, partial roof loss",  displayLevel: "partial"  },
    { value: "complete",        label: "Completely damaged",      description: "Collapsed or uninhabitable",            displayLevel: "complete" },
  ],
};

const _allOptions = Object.values(DISASTER_DAMAGE_OPTIONS).flat();

export const DAMAGE_VALUE_TO_DISPLAY: Record<string, DamageLevel> = {
  ...Object.fromEntries(_allOptions.map((o) => [o.value, o.displayLevel])),
  // New UI values → DB display levels (backward compat for queued items)
  partially_damaged:  "partial",
  completely_damaged: "complete",
};

export function getDisplayLevel(value: string): DamageLevel {
  return DAMAGE_VALUE_TO_DISPLAY[value] ?? "minimal";
}

export const DISASTER_TYPE_LABELS: Record<DisasterType, string> = {
  flood:             "Flood",
  earthquake:        "Earthquake",
  hurricane:         "Hurricane",
  landslide:         "Landslide",
  fire:              "Fire",
  drought:           "Drought",
  tsunami:           "Tsunami",
  conflict:          "Conflict",
  civil_unrest:      "Civil unrest",
  explosion:         "Explosion",
  chemical_incident: "Chemical incident",
  generic:           "Generic",
};

export const DISASTER_CATEGORY_OPTIONS: Record<DisasterType, string[]> = {
  flood:             ["Water level", "Structural damage", "Road blocked", "Power outage", "Contamination risk"],
  earthquake:        ["Structural collapse", "Wall cracks", "Foundation damage", "Road blocked", "Utilities failure"],
  hurricane:         ["Roof damage", "Flooding", "Fallen trees", "Power outage", "Window/facade damage"],
  landslide:         ["Road blocked", "Building at risk", "Active slide", "Buried infrastructure", "Drainage failure"],
  fire:              ["Active burning", "Smoke exposure", "Structural damage", "Evacuation needed", "Utilities failure"],
  drought:           ["Water supply failure", "Crop loss", "Soil degradation", "Health risk", "Infrastructure stress"],
  tsunami:           [],
  conflict:          [],
  civil_unrest:      [],
  explosion:         [],
  chemical_incident: [],
  generic:           [],
};

export const SEVERITY_OPTIONS: { value: string; label: string; description: string; color: string }[] = [
  { value: "minimal",            label: "Minimal",            description: "Cracks in plaster, broken windows",   color: "var(--color-minimal)"  },
  { value: "partially_damaged",  label: "Partially damaged",  description: "Large wall cracks, partial roof loss", color: "var(--color-warning)"  },
  { value: "completely_damaged", label: "Completely damaged",  description: "Collapsed or uninhabitable",           color: "var(--color-critical)" },
];
