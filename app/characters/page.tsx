"use client";

//#region --- Imports ---
import styles from "../index.module.css";
import "../globals.css";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Cropper, { Area } from "react-easy-crop";

import { useAuth } from "@/src/hooks/useAuth";
import { useCharacters } from "@/src/hooks/useCharacters";
import { useImageCrop } from "@/src/hooks/useImageCrop";

import { MangaPanel } from "@/src/components/MangaPanel";
import { CharacterCard } from "@/src/components/CharacterCard";

import { categoryLabels, ROLE_MAP } from "@/src/constants/character";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CharacterForm } from "@/src/components/CharacterForm";
// #endregion

export default function Characters() {
  //#region --- States ---
  const { isLoggedIn, login, logout, checkAuthStatus } = useAuth();
  const {
    charList,
    loading: charLoading,
    fetchCharacters,
    handleSave,
    handleDelete,
    isSaving,
  } = useCharacters();
  const {
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
  } = useImageCrop();

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [editingChar, setEditingChar] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  //#endregion

  //#region --- HANDLERS ---
  const showCroppedImage = async () => {
    const result = await getFinalCroppedFile();
    if (!result) return;

    if (result.target === "icon") {
      setIconFile(result.file);
    } else {
      setMainFile(result.file);
    }
  };

  const clearImage = (type: "main" | "icon") => {
    if (type === "main") {
      setMainFile(null);
      if (editingChar) setEditingChar({ ...editingChar, image_url: null });
      // Reset the actual HTML input value
      const input = document.getElementById("mainFile") as HTMLInputElement;
      if (input) input.value = "";
    } else {
      setIconFile(null);
      if (editingChar) setEditingChar({ ...editingChar, icon_url: null });
      // Reset the actual HTML input value
      const input = document.getElementById("iconFile") as HTMLInputElement;
      if (input) input.value = "";
    }
  };
  //#endregion

  // #region --- Load Function ---
  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Fetch Characters
      await fetchCharacters();

      await checkAuthStatus();
    } catch (err) {
      console.error("Initialization failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const availableRoles = Object.entries(ROLE_MAP).filter(([roleNum]) =>
    charList.some((char) => char.role === Number(roleNum)),
  );

  const filteredCharacters = charList.filter((char) => {
    if (filter === "all") return true;
    if (filter === "unclassified") return char.role === 0;
    if (filter === "protagonist") return char.role === 1;
    if (filter === "antagonist") return char.role === 2;
    if (filter === "deuteragonist") return char.role === 3;
    if (filter === "supporting") return char.role === 4;
    if (filter === "tritagonist") return char.role === 5;
    if (filter === "minor") return char.role === 6;
    return true;
  });

  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);

  const paginatedCharacters = filteredCharacters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (editingChar || showAddForm) {
      // Freeze the body
      document.body.style.overflow = "hidden";
    } else {
      // Unfreeze when closed
      document.body.style.overflow = "unset";
    }

    // Cleanup: Always unfreeze when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editingChar, showAddForm]);
  //#endregion

  const SystemOverviewPanel = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) return null;

    const sidebarContainer = document.getElementById("page-sidebar-slot");
    if (!sidebarContainer) return null;

    return createPortal(
      <MangaPanel title="SYSTEM OVERVIEW" collapsible={false}>
        <div className={styles.statBox}>
          <div className={styles.statNumber}>
            {charList.length.toString().padStart(2, "0")}
          </div>
          <div className={styles.statLabel}>Subjects Registered</div>
        </div>
      </MangaPanel>,
      sidebarContainer,
    );
  };

  return (
    <>
      <SystemOverviewPanel />

      <section className={styles.mainContent}>
        <div className={styles.pagePanel}>
          <div className={styles.diagonalOverlay}></div>

          {/* Page Header */}
          <h2 className={styles.pageHeader}>
            {/* <span className={styles.pageTag}>PAGE 1</span> */}
            <div className={styles.filterGroup}>
              <button
                onClick={() => {
                  setFilter("all");
                  setCurrentPage(1);
                }}
                className={filter === "all" ? styles.activeTab : styles.tab}
              >
                ALL
              </button>

              {availableRoles.map(([roleNum, roleLabel]) => (
                <button
                  key={roleNum}
                  onClick={() => {
                    setFilter(roleLabel.toLowerCase());
                    setCurrentPage(1);
                  }}
                  className={
                    filter === roleLabel.toLowerCase()
                      ? styles.activeTab
                      : styles.tab
                  }
                >
                  {roleLabel}
                </button>
              ))}
            </div>
          </h2>

          {/* Character Grid */}
          <div className={styles.archiveGrid}>
            {paginatedCharacters?.map((char, index) => (
              <div key={char.id} className={styles.charEntryWrapper}>
                <CharacterCard
                  char={char}
                  isLoggedIn={isLoggedIn}
                  onEdit={setEditingChar}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className={styles.paginationFooter}>
              <button
                className={styles.pageBtn}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  style={{ marginRight: "8px" }}
                />
                PREV
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      className={`${styles.numBtn} ${currentPage === pageNum ? styles.activeNum : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>

              <button
                className={styles.pageBtn}
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                NEXT
                <FontAwesomeIcon
                  icon={faChevronRight}
                  style={{ marginLeft: "8px" }}
                />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FLOATING ADD BUTTON */}
      {isLoggedIn && (
        <button
          className={styles.addFloatingBtn}
          onClick={() => setShowAddForm(true)}
        >
          +
        </button>
      )}

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loaderBox}>
            <div className={styles.spinner}></div>
            <p>SYNCHRONIZING WITH ARCHIVE...</p>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropperOpen && tempImgSrc && (
        <div className={styles.cropperModal}>
          <div className={styles.cropperContainer}>
            <Cropper
              image={tempImgSrc}
              crop={crop}
              zoom={zoom}
              // ICON = Force Square (1), MAIN = Free (2 / 3)
              // aspect={editingTarget === "icon" ? 1 : 1 / 1.2}
              aspect={1 / 1.2}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) =>
                setCroppedAreaPixels(croppedPixels)
              }
            />
          </div>

          {/* CONTROLS */}
          <div className={styles.cropperControls}>
            <div className={styles.sliderContainer}>
              <span>Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>

            <div className={styles.cropperButtons}>
              <button
                type="button"
                onClick={showCroppedImage}
                className={styles.save2Btn}
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={cancelCrop}
                className={styles.close2Btn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Form */}
      {(editingChar || showAddForm) && (
        <CharacterForm
          editingChar={editingChar}
          showAddForm={showAddForm}
          isSaving={isSaving}
          mainFile={mainFile}
          iconFile={iconFile}
          onFileSelect={onFileSelect}
          openExistingInCropper={openExistingInCropper}
          clearImage={clearImage}
          handleSave={handleSave}
          onClose={() => {
            setEditingChar(null);
            setShowAddForm(false);
            setIconFile(null);
            setMainFile(null);
          }}
        />
      )}
    </>
  );
}
