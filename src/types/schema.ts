// Mirrors SQL enums from 001_enums.sql — keep in sync

export const CrisisMode = {
  RAPID:       "rapid",
  FULL:        "full",
  CONTEXTUAL:  "contextual",
} as const;
export type CrisisMode = (typeof CrisisMode)[keyof typeof CrisisMode];

export const DamageLevel = {
  MINIMAL:  "minimal",
  PARTIAL:  "partial",
  SEVERE:   "severe",
  COMPLETE: "complete",
} as const;
export type DamageLevel = (typeof DamageLevel)[keyof typeof DamageLevel];

export const InfrastructureType = {
  RESIDENTIAL:       "residential",
  COMMERCIAL:        "commercial",
  GOVERNMENT:        "government",
  UTILITY:           "utility",
  TRANSPORT_COMM:    "transport_comm",
  COMMUNITY:         "community",
  PUBLIC_RECREATION: "public_recreation",
  SCHOOL:            "school",
  HEALTH_CENTER:     "health_center",
  BRIDGE:            "bridge",
  POWER_STATION:     "power_station",
  OTHER:             "other",
} as const;
export type InfrastructureType = (typeof InfrastructureType)[keyof typeof InfrastructureType];

export const CrisisNature = {
  NATURAL:       "natural",
  TECHNOLOGICAL: "technological",
  HUMAN_MADE:    "human_made",
} as const;
export type CrisisNature = (typeof CrisisNature)[keyof typeof CrisisNature];

export const CrisisSubtype = {
  EARTHQUAKE:        "earthquake",
  FLOOD:             "flood",
  TSUNAMI:           "tsunami",
  HURRICANE_CYCLONE: "hurricane_cyclone",
  WILDFIRE:          "wildfire",
  EXPLOSION:         "explosion",
  CHEMICAL_INCIDENT: "chemical_incident",
  CONFLICT:          "conflict",
  CIVIL_UNREST:      "civil_unrest",
} as const;
export type CrisisSubtype = (typeof CrisisSubtype)[keyof typeof CrisisSubtype];

export const ObservationSource = {
  CITIZEN:   "citizen",
  DRONE:     "drone",
  SATELLITE: "satellite",
  SENSOR:    "sensor",
} as const;
export type ObservationSource = (typeof ObservationSource)[keyof typeof ObservationSource];

export const ObservationStatus = {
  ACTIVE:     "active",
  SUPERSEDED: "superseded",
  FLAGGED:    "flagged",
} as const;
export type ObservationStatus = (typeof ObservationStatus)[keyof typeof ObservationStatus];

export const CrisisStatus = {
  ACTIVE:     "active",
  MONITORING: "monitoring",
  CLOSED:     "closed",
} as const;
export type CrisisStatus = (typeof CrisisStatus)[keyof typeof CrisisStatus];

export type DisasterType =
  | "flood" | "earthquake" | "hurricane"
  | "landslide" | "fire" | "drought" | "generic";

export const UnLanguage = {
  AR: "ar",
  ZH: "zh",
  EN: "en",
  FR: "fr",
  RU: "ru",
  ES: "es",
} as const;
export type UnLanguage = (typeof UnLanguage)[keyof typeof UnLanguage];

// modular_fields JSONB shape (Appendix 1 do edital)
export interface ModularFields {
  electricity_condition?: "no_damage" | "minor_damage" | "moderate_damage" | "severe_damage" | "no_service";
  health_services?: "fully_functional" | "partially_functional" | "not_functional" | "unknown";
  pressing_needs?: Array<"food" | "water" | "medical_care" | "shelter" | "electricity" | "sanitation" | "communication" | "transport" | "other">;
}
