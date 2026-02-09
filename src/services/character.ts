import { supabase } from "../lib/superbase";

export const characterService = {
  async fetchAllCharacters() {
    return await supabase
      .from("characters")
      .select("*, stats(*)") // Joins the stats table
      .order("name", { ascending: true });
  },

  async uploadImage(file: File, folder: string, type: "main" | "icon") {
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("character-assets")
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from("character-assets")
      .getPublicUrl(filePath);
    return data.publicUrl;
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

  async delete(id: number) {
    const { error: statsErr } = await supabase
      .from("stats")
      .delete()
      .eq("character_id", id);
    if (statsErr) throw statsErr;

    const { error: charErr } = await supabase
      .from("characters")
      .delete()
      .eq("id", id);
    if (charErr) throw charErr;
  }
};
