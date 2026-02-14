import { supabase } from "../lib/superbase";

export const characterService = {
  async fetchAllCharacters() {
    return await supabase
      .from("characters")
      .select("*, stats(*)") // Joins the stats table
      .order("name", { ascending: true });
  },

  async uploadImage(file: File, folder: string, type: "main" | "icon") {
    // A. CLEANUP: Find and delete any existing file of this type
    // List all files in the character's folder
    const { data: existingFiles } = await supabase.storage
      .from("character-assets")
      .list(folder);

    if (existingFiles && existingFiles.length > 0) {
      // Find files that start with "main-" or "icon-"
      const filesToDelete = existingFiles
        .filter((f) => f.name.startsWith(`${type}-`))
        .map((f) => `${folder}/${f.name}`); // Construct full path

      if (filesToDelete.length > 0) {
        console.log(`🗑️ DELETING ONLY '${type}' FILES:`, filesToDelete);

        const { error: removeError } = await supabase.storage
          .from("character-assets")
          .remove(filesToDelete);

        if (removeError) console.error("Remove failed:", removeError);
      } else {
        console.log(`✅ No old '${type}' images found to delete. Safe.`);
      }
    }

    // B. UPLOAD: Now upload the new one
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

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
    const { data: list } = await supabase.storage
      .from("character-assets")
      .list(slug); // List everything inside the 'slug' folder

    if (list && list.length > 0) {
      const filesToRemove = list.map((x) => `${slug}/${x.name}`);
      await supabase.storage.from("character-assets").remove(filesToRemove);
    }

    // 2. Delete from Database
    // Because of "Cascade", deleting the Character automatically deletes their Stats!
    const { error } = await supabase.from("characters").delete().eq("id", id);

    if (error) throw error;
  },
};
