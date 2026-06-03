export type CharacterAssetType = "main" | "icon" | "gallery";

export interface CharacterStatRecord {
  character_id?: number;
  age?: string | null;
  gender?: number | null;
  height?: number | null;
  species?: string | null;
  birthday?: string | null;
  status?: number | null;
}

export interface Character {
  id: number;
  name: string;
  role: number;
  slug: string;
  quote?: string | null;
  bio?: string | null;
  abilities?: string | null;
  relationships?: string | null;
  trivias?: string | null;
  labels?: string[] | null;
  image_url?: string | null;
  icon_url?: string | null;
  gallery?: string[] | null;
  stats?: CharacterStatRecord[];
}

export interface CharacterLoreEntry {
  name: string;
  desc: string;
}

export interface CharacterFormExtraData {
  abilities: string;
  relationships: string;
  trivias: string;
  labels: string[];
  galleryFiles: File[];
}

export interface CharacterPayload {
  name: string;
  image_url: string;
  icon_url: string;
  quote: string;
  role: number;
  slug: string;
  bio: string;
  abilities: string;
  relationships: string;
  trivias: string;
  labels: string[];
  gallery: string[];
}

export interface CharacterStatsPayload {
  age?: string;
  gender?: number;
  height?: number;
  species?: string;
  birthday?: string;
  status?: number;
}

export interface CharacterWriteRequest {
  charPayload: CharacterPayload;
  statsPayload: CharacterStatsPayload;
}

export interface CharacterMutationResult {
  success: boolean;
  message: string | null;
  error: string | null;
}

export interface ImageUploadResponse {
  publicUrl: string;
  message?: string;
}
