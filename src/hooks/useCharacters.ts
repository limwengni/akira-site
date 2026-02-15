"use client";

import { useState, useEffect } from "react";
import { characterService } from "@/src/services/character";

export const useCharacters = () => {
  const [charList, setCharList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCharacters = async () => {
    setLoading(true);
    const data = await characterService.fetchAllCharacters();
    setCharList(data.data || []);
    setLoading(false);
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

    if (isNew) {
      setCharList((prev) => [optimisticChar, ...prev]); // Add to top of list
    } else {
      setCharList((prev) =>
        prev.map((c) => (c.id === editingChar!.id ? optimisticChar : c)),
      );
    }

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
      try {
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
        } else {
          alert("Character saved successfully!");
        }
      } catch (dbError: any) {
        console.error("DATABASE ERROR:", dbError); // Check F12 console for this!
        alert(
          "Failed to save character data: " +
            (dbError.message || "Unknown Error"),
        );
      }

      const freshData = await characterService.fetchAllCharacters();
      if (freshData.data) {
        setCharList(freshData.data);
      }

      console.log("Background sync complete.");
    } catch (err: any) {
      console.error("Sync failed", err);
      alert("Critical Sync Error: " + err.message + ". The page will reload.");
      window.location.reload();
    } finally {
      setIsSaving(false);
      onSuccess();
    }
  };

  const handleDelete = async (id: number, slug: string) => {
    if (!confirm(`CONFIRM PERMANENT DELETION OF ${slug.toUpperCase()}?`)) return;

    const originalList = [...charList];
    setCharList((prev) => prev.filter((c) => c.id !== id));

    try {
      await characterService.delete(id, slug);
      alert("Character deleted successfully.");
    } catch (err: any) {
      console.error("Deletion failed:", err);
      alert("Deletion Error: " + err.message);
      setCharList(originalList); // Revert UI
    }
  };

  return {
    charList,
    setCharList,
    loading,
    fetchCharacters,
    handleSave,
    handleDelete,
    isSaving,
  };
};
