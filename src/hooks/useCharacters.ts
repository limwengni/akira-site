"use client";

import { useState } from "react";
import useSWR from "swr";
import { characterService } from "@/src/services/character";

const characterFetcher = async () => {
  const { data, error } = await characterService.fetchAllCharacters();
  if (error) throw error;
  return data || [];
};

export const useCharacters = () => {
  const {
    data: charList = [], // Defaults to an empty array so map() doesn't break
    isLoading: loading,
    mutate, // The magic cache updater function
  } = useSWR("characters-cache", characterFetcher);

  const [isSaving, setIsSaving] = useState(false);

  const fetchCharacters = async () => {
    await mutate();
  };

  const handleSave = async (
    e: React.FormEvent<HTMLFormElement>,
    editingChar: any,
    mainFile: File | null,
    iconFile: File | null,
    onSuccess: () => void,
    extraData?: {
      abilities: string;
      relationships: string;
      trivias: string;
      labels: string[];
      galleryFiles: File[];
    },
  ) => {
    e.preventDefault();
    if (isSaving) return; // Prevent multiple saves

    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    const isNew = !editingChar?.id;

    let currentSlug = editingChar?.slug || "";

    if (isNew) {
      // New: Generate "ashita" from "Ashita Kazumi"
      currentSlug = (data.name as string).trim().split(" ")[0].toLowerCase();
    }

    const tempMainUrl = mainFile
      ? URL.createObjectURL(mainFile)
      : editingChar?.image_url;

    const tempIconUrl = iconFile
      ? URL.createObjectURL(iconFile)
      : editingChar?.icon_url;

    const optimisticChar = {
      id: editingChar?.id || Date.now(), // Temporary ID for new items
      ...editingChar, // Keep existing data (like ID)
      name: data.name,
      role: parseInt(data.role as string),
      quote: data.quote,
      bio: data.bio,
      abilities: extraData?.abilities,
      relationships: extraData?.relationships,
      trivias: extraData?.trivias,
      labels: extraData?.labels,
      image_url: tempMainUrl,
      icon_url: tempIconUrl,
      slug: currentSlug,
    };

    let updatedList;
    if (isNew) {
      updatedList = [optimisticChar, ...charList];
    } else {
      updatedList = charList.map((c: any) =>
        c.id === editingChar!.id ? optimisticChar : c,
      );
    }
    mutate(updatedList, false);

    const tempEditingId = editingChar?.id; // Remember this for the DB call

    try {
      // 1. Upload Images if they exist
      let finalImageUrl = editingChar?.image_url || "";
      let finalIconUrl = editingChar?.icon_url || "";
      let uploadErrors: string[] = [];

      if (mainFile) {
        try {
          finalImageUrl = await characterService.uploadImage(
            mainFile,
            currentSlug,
            "main",
          );
        } catch (err) {
          console.error("Main image upload failed", err);
          uploadErrors.push("Main Image");
        }
      }
      if (iconFile) {
        try {
          finalIconUrl = await characterService.uploadImage(
            iconFile,
            currentSlug,
            "icon",
          );
        } catch (err) {
          console.error("Icon upload failed", err);
          uploadErrors.push("Icon");
        }
      }

      let galleryUrls = editingChar?.gallery || [];
      if (extraData?.galleryFiles && extraData.galleryFiles.length > 0) {
        // Loop and upload each gallery file to the /gallery/ folder
        const uploadPromises = extraData.galleryFiles.map((file) =>
          characterService.uploadImage(file, currentSlug, "gallery"),
        );
        const newGalleryUrls = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...newGalleryUrls];
      }

      // --- Existing character but their images were cleared ---
      if (!isNew) {
        // Find the original data from your list to see what the URL WAS before editing
        const originalChar = charList.find((c) => c.id === editingChar.id);

        // Scenario: Delete old Main Image if it was REPLACED or REMOVED
        if (originalChar?.image_url && (mainFile || !editingChar.image_url)) {
          // We use 'await' but don't let it block the save if it fails
          characterService
            .deleteImage(originalChar.image_url)
            .catch(console.error);
        }

        // Scenario: Delete old Icon if it was REPLACED or REMOVED
        if (originalChar?.icon_url && (iconFile || !editingChar.icon_url)) {
          characterService
            .deleteImage(originalChar.icon_url)
            .catch(console.error);
        }
      }
      // -------------------------------

      const charPayload = {
        name: data.name,
        image_url: finalImageUrl,
        icon_url: finalIconUrl,
        quote: data.quote,
        role: parseInt(data.role as string),
        slug: currentSlug,
        bio: data.bio,
        abilities: extraData?.abilities,
        relationships: extraData?.relationships,
        trivias: extraData?.trivias,
        labels: extraData?.labels,
        gallery: galleryUrls,
      };

      // Format birthday to YYYY-MM-DD if possible (using dummy year 2000)
      const birthday = `2000-${data.birth_month}-${data.birth_day}`;

      const rawStats = {
        age: data.age,
        gender: data.gender,
        height: data.height ? parseInt(data.height as string) : null, // Store as number only
        species: data.species,
        birthday: birthday,
        // dimension: parseInt(data.dimension as string) || null,
        // affiliation: parseInt(data.affiliation as string) || null,
        status: parseInt(data.status as string) || 1,
      };

      const statsPayload = Object.fromEntries(
        Object.entries(rawStats).filter(([_, v]) => v != null && v !== ""),
      );

      // Save to Database
      await characterService.save(
        charPayload,
        statsPayload,
        isNew ? null : tempEditingId,
      );

      // FINAL USER FEEDBACK
      if (uploadErrors.length > 0) {
        alert(
          `Character saved, BUT these images failed to upload: ${uploadErrors.join(", ")}. Please try uploading them again.`,
        );
      }

      mutate();
    } catch (err: any) {
      console.error("Sync failed", err);
      alert("Save failed: " + err.message);
      mutate(charList, false); // ← revert back instead of reloading
    } finally {
      setIsSaving(false);
      onSuccess();
    }
  };

  const handleDelete = async (id: number, slug: string) => {
    if (!confirm(`CONFIRM PERMANENT DELETION OF ${slug.toUpperCase()}?`))
      return;

    const originalList = [...charList];
    mutate(charList.filter((c: any) => c.id !== id), false);

    try {
      await characterService.delete(id, slug);
      mutate();
    } catch (err: any) {
      console.error("Deletion failed:", err);
      alert("Deletion Error: " + err.message);
      // Revert the UI if the database failed to delete
      mutate(originalList, false);
    }
  };

  return {
    charList,
    loading,
    fetchCharacters,
    handleSave,
    handleDelete,
    isSaving,
  };
};
