"use client";

import { useState } from "react";
import useSWR from "swr";
import { characterService } from "@/src/services/character";
import type {
  Character,
  CharacterFormExtraData,
  CharacterMutationResult,
  CharacterPayload,
  CharacterStatsPayload,
} from "@/src/types/character";

const characterFetcher = async (): Promise<Character[]> => {
  const { data, error } = await characterService.fetchAllCharacters();
  if (error) throw error;
  return data || [];
};

const getFormValue = (formData: FormData, key: string): string =>
  String(formData.get(key) ?? "").trim();

const parseOptionalInteger = (value: string): number | undefined => {
  if (!value) return undefined;
  const parsedValue = Number.parseInt(value, 10);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

interface SaveCharacterParams {
  formElement: HTMLFormElement;
  editingChar: Character | null;
  mainFile: File | null;
  iconFile: File | null;
  extraData: CharacterFormExtraData;
}

export const useCharacters = () => {
  const {
    data: charList = [],
    isLoading: loading,
    mutate,
  } = useSWR<Character[]>("characters-cache", characterFetcher);

  const [isSaving, setIsSaving] = useState(false);

  const fetchCharacters = async () => {
    await mutate();
  };

  const handleSave = async ({
    formElement,
    editingChar,
    mainFile,
    iconFile,
    extraData,
  }: SaveCharacterParams): Promise<CharacterMutationResult> => {
    if (isSaving) {
      return {
        success: false,
        message: null,
        error: "A save is already in progress.",
      };
    }

    setIsSaving(true);

    const formData = new FormData(formElement);
    const isNew = !editingChar?.id;
    const name = getFormValue(formData, "name");
    const role = Number.parseInt(getFormValue(formData, "role"), 10);
    const quote = getFormValue(formData, "quote");
    const bio = getFormValue(formData, "bio");
    const slug =
      editingChar?.slug || name.split(" ")[0]?.toLowerCase() || "";

    const tempMainUrl = mainFile
      ? URL.createObjectURL(mainFile)
      : editingChar?.image_url || "";

    const tempIconUrl = iconFile
      ? URL.createObjectURL(iconFile)
      : editingChar?.icon_url || "";

    const optimisticChar: Character = {
      ...editingChar,
      id: editingChar?.id || Date.now(),
      name,
      role,
      quote,
      bio,
      abilities: extraData.abilities,
      relationships: extraData.relationships,
      trivias: extraData.trivias,
      labels: extraData.labels,
      image_url: tempMainUrl,
      icon_url: tempIconUrl,
      slug,
    };

    const updatedList = isNew
      ? [optimisticChar, ...charList]
      : charList.map((character) =>
          character.id === editingChar?.id ? optimisticChar : character,
        );

    mutate(updatedList, false);

    try {
      let finalImageUrl = editingChar?.image_url || "";
      let finalIconUrl = editingChar?.icon_url || "";
      const uploadErrors: string[] = [];

      if (mainFile) {
        try {
          finalImageUrl = await characterService.uploadImage(mainFile, slug, "main");
        } catch (error) {
          console.error("Main image upload failed", error);
          uploadErrors.push("main image");
        }
      }

      if (iconFile) {
        try {
          finalIconUrl = await characterService.uploadImage(iconFile, slug, "icon");
        } catch (error) {
          console.error("Icon upload failed", error);
          uploadErrors.push("icon");
        }
      }

      let galleryUrls = editingChar?.gallery || [];
      if (extraData.galleryFiles.length > 0) {
        const uploadPromises = extraData.galleryFiles.map((file) =>
          characterService.uploadImage(file, slug, "gallery"),
        );
        const newGalleryUrls = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...newGalleryUrls];
      }

      if (!isNew && editingChar) {
        const originalChar = charList.find((character) => character.id === editingChar.id);

        if (originalChar?.image_url && (mainFile || !editingChar.image_url)) {
          characterService.deleteImage(originalChar.image_url).catch(console.error);
        }

        if (originalChar?.icon_url && (iconFile || !editingChar.icon_url)) {
          characterService.deleteImage(originalChar.icon_url).catch(console.error);
        }
      }

      const charPayload: CharacterPayload = {
        name,
        image_url: finalImageUrl,
        icon_url: finalIconUrl,
        quote,
        role,
        slug,
        bio,
        abilities: extraData.abilities,
        relationships: extraData.relationships,
        trivias: extraData.trivias,
        labels: extraData.labels,
        gallery: galleryUrls,
      };

      const birthday = `2000-${getFormValue(formData, "birth_month")}-${getFormValue(formData, "birth_day")}`;
      const status = parseOptionalInteger(getFormValue(formData, "status"));

      const statsPayload: CharacterStatsPayload = {
        age: getFormValue(formData, "age") || undefined,
        gender: parseOptionalInteger(getFormValue(formData, "gender")),
        height: parseOptionalInteger(getFormValue(formData, "height")),
        species: getFormValue(formData, "species") || undefined,
        birthday,
        status: status ?? 1,
      };

      const saveResult = await characterService.save(
        charPayload,
        statsPayload,
        isNew ? null : editingChar?.id,
      );

      await mutate();

      if (uploadErrors.length > 0) {
        return {
          success: true,
          message: `Character saved, but ${uploadErrors.join(" and ")} upload failed. Please retry those files.`,
          error: null,
        };
      }

      return saveResult;
    } catch (error) {
      console.error("Sync failed", error);
      mutate(charList, false);

      return {
        success: false,
        message: null,
        error:
          error instanceof Error
            ? `Save failed: ${error.message}`
            : "Save failed. Please try again.",
      };
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (
    id: number,
    slug: string,
  ): Promise<CharacterMutationResult> => {
    try {
      const result = await characterService.delete(id, slug);
      mutate(charList.filter((character) => character.id !== id), false);
      await mutate();
      return { success: true, message: result.message ?? null, error: null };
    } catch (error) {
      console.error("Deletion failed:", error);
      return {
        success: false,
        message: null,
        error:
          error instanceof Error
            ? error.message
            : "Deletion failed. Please try again.",
      };
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
