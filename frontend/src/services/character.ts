import { supabase } from "../lib/superbase";

export const characterService = {
  async fetchAllCharacters() {
    return await supabase
      .from("characters")
      .select("*, stats(*)") // Joins the stats table
      .order("name", { ascending: true });
  },

  uploadImage: async (file: File, slug: string, type: string) => {
    const isGallery = type.startsWith("gallery");
    const folder = slug; // e.g., "hikaru"

    // A. CLEANUP (Only for Main/Icon)
    // We don't want to delete gallery files whenever we upload a new one!
    if (!isGallery) {
      const { data: existingFiles } = await supabase.storage
        .from("character-assets")
        .list(folder);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles
          .filter((f) => f.name.startsWith(`${type}-`))
          .map((f) => `${folder}/${f.name}`);

        if (filesToDelete.length > 0) {
          await supabase.storage.from("character-assets").remove(filesToDelete);
        }
      }
    }

    // B. UPLOAD LOGIC
    const fileExt = file.name.split(".").pop();
    let filePath = "";

    if (isGallery) {
      // If it's a gallery file, we keep the original name but add a timestamp to avoid cache issues
      // Path: hikaru/gallery/123456789-my-art.png
      const cleanFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension from original name
      filePath = `${folder}/gallery/${Date.now()}-${cleanFileName}.${fileExt}`;
    } else {
      // Standard Main/Icon logic
      // Path: hikaru/main-123456789.png
      filePath = `${folder}/${type}-${Date.now()}.${fileExt}`;
    }

    const { error } = await supabase.storage
      .from("character-assets")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("character-assets")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Used to remove the images if user cleared them without uploading a new one
  async deleteImage(url: string) {
    if (!url || url.includes("placeholder")) return;

    try {
      const path = url.split("public/character-assets/")[1];

      if (path) {
        const { data, error } = await supabase.storage
          .from("character-assets")
          .remove([path]);

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error("Error in deleteAsset:", error);
      throw error;
    }
  },

  async save(charPayload: any, statsPayload: any, id?: number) {
    if (!id) {
      // NEW CHARACTER
      const { data: newChar, error: charErr } = await supabase
        .from("characters")
        .insert([charPayload])
        .select()
        .single();

      if (charErr) throw charErr;

      const { error: statsErr } = await supabase
        .from("stats")
        .insert([{ character_id: newChar.id, ...statsPayload }]);

      if (statsErr) throw statsErr;
    } else {
      // UPDATE CHARACTER
      const updates = [];

      if (Object.keys(charPayload).length > 0) {
        updates.push(
          supabase.from("characters").update(charPayload).eq("id", id),
        );
      }

      if (Object.keys(statsPayload).length > 0) {
        updates.push(
          supabase.from("stats").update(statsPayload).eq("character_id", id),
        );
      }

      if (updates.length > 0) {
        const results = await Promise.all(updates);
        // Check for errors in any of the results
        for (const res of results) {
          if (res.error) throw res.error;
        }
      }
    }
  },

  async delete(id: number, slug: string) {
    // 1. CLEANUP STORAGE
    const foldersToClean = [slug, `${slug}/gallery`];

    for (const folderPath of foldersToClean) {
      const { data: list } = await supabase.storage
        .from("character-assets")
        .list(folderPath);

      if (list && list.length > 0) {
        const filesToRemove = list
          .filter((x) => x.name !== ".emptyKeep")
          .map((x) => `${folderPath}/${x.name}`);

        if (filesToRemove.length > 0) {
          await supabase.storage.from("character-assets").remove(filesToRemove);
        }
      }
    }

    // 2. DELETE FROM DATABASE
    const { error } = await supabase.from("characters").delete().eq("id", id);

    if (error) throw error;
  },
};
