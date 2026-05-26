import type {
  CrisisNature, CrisisStatus, CrisisSubtype,
  DamageLevel, InfrastructureType,
  ObservationSource, ObservationStatus,
  UnLanguage, ModularFields,
} from "./schema";

// Row shapes as standalone types to avoid circular self-reference in Database
interface CrisisRow {
  id: string;
  name: string;
  nature: CrisisNature;
  subtype: CrisisSubtype;
  location_name: string;
  bbox_sw_lat: number | null;
  bbox_sw_lng: number | null;
  bbox_ne_lat: number | null;
  bbox_ne_lng: number | null;
  started_at: string;
  ended_at: string | null;
  status: CrisisStatus;
  geohash_precision: number;
  created_at: string;
}

interface BuildingRow {
  id: string;
  crisis_id: string;
  osm_id: string | null;
  geojson: Record<string, unknown>;
  centroid_lat: number;
  centroid_lng: number;
  address: string | null;
  name: string | null;
  created_at: string;
}

interface ObservationRow {
  id: string;
  crisis_id: string;
  building_id: string | null;
  infrastructure_name: string;
  infrastructure_description: string | null;
  infrastructure_type: InfrastructureType;
  infrastructure_type_other: string | null;
  damage_level: DamageLevel;
  debris_clearing_needed: boolean;
  photo_url: string;
  photo_thumbnail_url: string | null;
  latitude: number;
  longitude: number;
  location_method: string;
  source: ObservationSource;
  session_id: string;
  is_proxy: boolean;
  proxy_description: string | null;
  language: UnLanguage;
  confidence: number;
  version_number: number;
  superseded_by: string | null;
  status: ObservationStatus;
  client_created_at: string;
  synced_at: string;
  created_at: string;
  modular_fields: ModularFields;
}

export interface ObservationInsert {
  id?: string;
  crisis_id: string;
  infrastructure_name: string;
  infrastructure_type: InfrastructureType;
  damage_level: DamageLevel;
  debris_clearing_needed: boolean;
  photo_url: string;
  latitude: number;
  longitude: number;
  location_method: string;
  source: ObservationSource;
  session_id: string;
  is_proxy: boolean;
  language: UnLanguage;
  client_created_at: string;
  building_id?: string | null;
  infrastructure_description?: string | null;
  infrastructure_type_other?: string | null;
  photo_thumbnail_url?: string | null;
  proxy_description?: string | null;
  confidence?: number;
  version_number?: number;
  superseded_by?: string | null;
  status?: ObservationStatus;
  synced_at?: string;
  created_at?: string;
  modular_fields?: ModularFields;
}

interface AreaStatsRow {
  id: string;
  crisis_id: string;
  geohash: string;
  observation_count: number;
  complete_count: number;
  partial_count: number;
  minimal_count: number;
  last_updated: string;
}

export interface Database {
  public: {
    Tables: {
      crises: {
        Row: CrisisRow;
        Insert: Omit<CrisisRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<CrisisRow, "id" | "created_at">>;
        Relationships: [];
      };
      buildings: {
        Row: BuildingRow;
        Insert: Omit<BuildingRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<BuildingRow, "id" | "created_at">>;
        Relationships: [];
      };
      observations: {
        Row: ObservationRow;
        Insert: ObservationInsert;
        Update: Partial<ObservationInsert>;
        Relationships: [];
      };
      area_stats: {
        Row: AreaStatsRow;
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      damage_level: DamageLevel;
      infrastructure_type: InfrastructureType;
      crisis_nature: CrisisNature;
      crisis_subtype: CrisisSubtype;
      observation_source: ObservationSource;
      observation_status: ObservationStatus;
      crisis_status: CrisisStatus;
      un_language: UnLanguage;
    };
  };
}
