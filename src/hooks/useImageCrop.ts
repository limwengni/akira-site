import { useState } from "react";
import { Area } from "react-easy-crop";
import { getCroppedImg } from "@/src/utils/cropUtils";

export const useImageCrop = () => {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImgSrc, setTempImgSrc] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<"icon" | "main" | null>(
    null,
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "icon" | "main",
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setTempImgSrc(URL.createObjectURL(file));
      setEditingTarget(type);
      setCropperOpen(true);
      setZoom(1);
    }
  };

  const getFinalCroppedFile = async () => {
    if (!tempImgSrc || !croppedAreaPixels) return null;

    const croppedBlob = await getCroppedImg(tempImgSrc, croppedAreaPixels);
    const fileName =
      editingTarget === "icon" ? "cropped-icon.jpg" : "cropped-main.jpg";

    const file = new File([croppedBlob], fileName, {
      type: "image/png",
      lastModified: Date.now(),
    });

    // Cleanup
    setCropperOpen(false);
    setTempImgSrc(null);

    return { file, target: editingTarget };
  };

  const cancelCrop = () => {
    setCropperOpen(false);
    setTempImgSrc(null);
    setEditingTarget(null);
  };

  const openExistingInCropper = (url: string, type: "icon" | "main") => {
    if (!url) return;
    setTempImgSrc(url);
    setEditingTarget(type);
    setCropperOpen(true);
    setZoom(1); // Reset zoom for the existing image
  };

  return {
    cropperOpen,
    tempImgSrc,
    editingTarget,
    crop,
    zoom,
    setCrop,
    setZoom,
    setCroppedAreaPixels,
    onFileSelect,
    getFinalCroppedFile,
    cancelCrop,
    openExistingInCropper,
  };
};
