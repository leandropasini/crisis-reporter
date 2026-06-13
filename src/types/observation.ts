import type {
  CrisisNature, CrisisSubtype,
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
  placeName?: string;
  buildingName?: string;

  // ClassificationScreen
  damageLevel: string;
  damageLevelLabel?: string;
  infrastructureType: InfrastructureType;
  infrastructureTypeOther?: string;
  crisisNature?: CrisisNature;
  crisisSubtype?: CrisisSubtype;
  debrisClearingNeeded?: boolean;

  // DetailsScreen (optional in rapid mode)
  infrastructureName?: string;
  infrastructureDescription?: string;
  modularFields: ModularFields;

  // CommunityImpactScreen
  electricityStatus?: string;
  healthStatus?: string;
  pressingNeeds?: string[];

  // Context
  crisisId: string;
  buildingId?: string;
  isDemo?: boolean;
}
