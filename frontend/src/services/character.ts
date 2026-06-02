import { supabase } from "../lib/superbase";

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

    const data = await response.json();
    return { data, error: null };
  },

  uploadImage: async (file: File, slug: string, type: string) => {
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

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Failed to upload image");
    }

    return result.publicUrl;
  },

  // Used to remove the images if user cleared them without uploading a new one
  async deleteImage(url: string) {
    if (!url || url.includes("placeholder")) return;

    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/storage/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Failed to delete image");
    }

    return result.deleted;
  },

  async save(charPayload: any, statsPayload: any, id?: number) {
    const authHeaders = await getAuthHeaders();

    if (!id) {
      // NEW CHARACTER
      const response = await fetch(`${API_BASE_URL}/characters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          charPayload,
          statsPayload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to create character");
      }

      return { success: true, message: result.message ?? null, error: null };
    } else {
      const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          charPayload,
          statsPayload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to update character");
      }

      return { success: true, message: result.message ?? null, error: null };
    }
  },

  async delete(id: number, slug: string) {
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

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Failed to delete character");
    }

    return { success: true, message: result.message ?? null, error: null };
  },
};
