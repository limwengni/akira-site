import { supabase } from "../lib/superbase";
import type {
  Character,
  CharacterAssetType,
  CharacterMutationResult,
  CharacterPayload,
  CharacterStatsPayload,
  CharacterWriteRequest,
  ImageUploadResponse,
} from "@/src/types/character";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please log in to continue.");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
};

export const characterService = {
  async fetchAllCharacters() {
    const response = await fetch(`${API_BASE_URL}/characters`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch characters");
    }

    const data = (await response.json()) as Character[];
    return { data, error: null };
  },

  async uploadImage(
    file: File,
    slug: string,
    type: CharacterAssetType,
  ): Promise<string> {
    const authHeaders = await getAuthHeaders();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);
    formData.append("asset_type", type);

    const response = await fetch(`${API_BASE_URL}/storage/upload`, {
      method: "POST",
      headers: authHeaders,
      body: formData,
    });

    const result = (await response.json()) as
      | ({ detail?: string } & Partial<ImageUploadResponse>)
      | undefined;

    if (!response.ok) {
      throw new Error(result?.detail || "Failed to upload image");
    }

    if (!result?.publicUrl) {
      throw new Error("Upload succeeded, but no image URL was returned.");
    }

    return result.publicUrl;
  },

  async deleteImage(url: string): Promise<string[]> {
    if (!url || url.includes("placeholder")) return [];

    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/storage/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ url }),
    });

    const result = (await response.json()) as {
      deleted?: string[];
      detail?: string;
    };

    if (!response.ok) {
      throw new Error(result.detail || "Failed to delete image");
    }

    return result.deleted ?? [];
  },

  async save(
    charPayload: CharacterPayload,
    statsPayload: CharacterStatsPayload,
    id?: number | null,
  ): Promise<CharacterMutationResult> {
    const authHeaders = await getAuthHeaders();
    const payload: CharacterWriteRequest = {
      charPayload,
      statsPayload,
    };

    const response = await fetch(
      !id ? `${API_BASE_URL}/characters` : `${API_BASE_URL}/characters/${id}`,
      {
        method: !id ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      },
    );

    const result = (await response.json()) as {
      detail?: string;
      message?: string | null;
    };

    if (!response.ok) {
      throw new Error(
        result.detail || (!id ? "Failed to create character" : "Failed to update character"),
      );
    }

    return { success: true, message: result.message ?? null, error: null };
  },

  async delete(id: number, slug: string): Promise<CharacterMutationResult> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/characters/${id}?slug=${encodeURIComponent(slug)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      },
    );

    const result = (await response.json()) as {
      detail?: string;
      message?: string | null;
    };

    if (!response.ok) {
      throw new Error(result.detail || "Failed to delete character");
    }

    return { success: true, message: result.message ?? null, error: null };
  },
};
