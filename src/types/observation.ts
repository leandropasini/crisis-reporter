import type {
  CrisisNature, CrisisSubtype, DamageLevel,
  InfrastructureType, ModularFields,
} from "./schema";

export interface ObservationInput {
  // CameraScreen
  photoFile: File;
  photoPreviewUrl: string;

  // LocationScreen
  lat: number;
  lng: number;
  locationMethod: "gps" | "manual_pin" | "address";
  address?: string;

  // ClassificationScreen
  damageLevel: DamageLevel;
  infrastructureType: InfrastructureType;
  infrastructureTypeOther?: string;
  crisisNature?: CrisisNature;
  crisisSubtype?: CrisisSubtype;
  debrisClearingNeeded?: boolean;

  // DetailsScreen (optional in rapid mode)
  infrastructureName?: string;
  infrastructureDescription?: string;
  modularFields: ModularFields;

  // Context
  crisisId: string;
  buildingId?: string;
  isDemo?: boolean;
}
