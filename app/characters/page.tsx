"use client";

//#region --- Imports ---
import styles from "../index.module.css";
import "../globals.css";

import { useState, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";

import { useAuth } from "@/src/hooks/useAuth";
import { useCharacters } from "@/src/hooks/useCharacters";
import { useImageCrop } from "@/src/hooks/useImageCrop";

import { CharacterCard, CharacterCardSkeleton } from "@/src/components/CharacterCard";

import { getRoleLabel, ROLE_MAP } from "@/src/constants/character";
import {
  faCaretDown,
  faCaretUp,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faClose,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CharacterForm } from "@/src/components/CharacterForm";
// #endregion

export default function Characters() {
  //#region --- States ---
  const { isLoggedIn, checkAuthStatus } = useAuth();
  const {
    charList,
    loading: charLoading,
    handleSave,
    handleDelete,
    isSaving,
  } = useCharacters();
  const {
    cropperOpen,
    tempImgSrc,
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

  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChar, setEditingChar] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [charPendingDelete, setCharPendingDelete] = useState<{
    id: number;
    slug: string;
    name: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);

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

  const requestDelete = (id: number, slug: string, name: string) => {
    setDeleteError("");
    setCharPendingDelete({ id, slug, name });
  };

  const confirmDelete = async () => {
    if (!charPendingDelete) return;

    const result = await handleDelete(charPendingDelete.id, charPendingDelete.slug);

    if (result?.success) {
      setCharPendingDelete(null);
      setDeleteError("");
      return;
    }

    setDeleteError(
      result?.error || "We couldn't delete this record right now. Please try again.",
    );
  };
  //#endregion

  const availableRoles = Object.entries(ROLE_MAP).filter(([roleNum]) =>
    charList.some((char) => char.role === Number(roleNum)),
  );

  const filteredCharacters = charList.filter((char) => {
    const matchesSearch = char.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()); // by default is "" so it returns true

    const charRoleName = getRoleLabel(char.role).toLowerCase();

    const matchesRole = filter === "all" || charRoleName === filter;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);

  const paginatedCharacters = filteredCharacters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the dropdown is open, AND the click was not inside the dropdownRef
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false); // Close it!
      }
    };

    // Only attach the listener if the menu is actually open
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the listener when the menu closes or component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  useEffect(() => {
    checkAuthStatus();
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

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 320);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const footer = document.querySelector(`.${styles.footerBar}`);
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearFooter(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px 0px 72px 0px",
        threshold: 0,
      },
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);
  //#endregion

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <section className={styles.mainContent}>
        <div className={`${styles.pagePanel} ${styles.characterListingPanel}`}>
          {/* Page Header */}
          <h2 className={styles.pageHeader}>
            {/* <span className={styles.pageTag}>PAGE 1</span> */}
            <div className={styles.headerControls}>
              <div className={styles.resultsCount} aria-live="polite">
                {filteredCharacters.length} character
                {filteredCharacters.length === 1 ? "" : "s"} found
              </div>

              <div className={styles.headerActions}>
                {/* SEARCH BAR */}
                <div className={styles.searchWrapper}>
                  <FontAwesomeIcon
                    icon={faSearch}
                    className={styles.searchIcon}
                  />
                  <input
                    type="text"
                    placeholder="Search characters"
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />

                  {/* Clear Button (only appears if there's text) */}
                  {searchQuery && (
                    <button
                      className={styles.clearButton}
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear Search"
                    >
                      <FontAwesomeIcon
                        icon={faClose}
                        className={styles.closeButton}
                      />
                    </button>
                  )}
                </div>

                {/* FILTER DROPDOWN */}
                <div className={styles.dropdownWrapper} ref={dropdownRef}>
                  <button
                    className={styles.dropdownToggle}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    FILTER: {filter.toUpperCase()}
                    {isFilterOpen ? (
                      <FontAwesomeIcon
                        icon={faCaretUp}
                        className={styles.closeButton}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faCaretDown}
                        className={styles.closeButton}
                      />
                    )}
                  </button>

                  {isFilterOpen && (
                    <div className={styles.dropdownMenu}>
                      <div className={styles.filterGroup}>
                        <button
                          onClick={() => {
                            setFilter("all");
                            setCurrentPage(1);
                            setIsFilterOpen(false); // Close menu on click
                          }}
                          className={
                            filter === "all" ? styles.activeTab : styles.tab
                          }
                        >
                          ALL
                        </button>

                        {availableRoles.map(([roleNum, roleLabel]) => (
                          <button
                            key={roleNum}
                            onClick={() => {
                              setFilter(roleLabel.toLowerCase());
                              setCurrentPage(1);
                              setIsFilterOpen(false); // Close menu on click
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </h2>

          {/* Character Grid */}
          <div className={styles.archiveGrid}>
            {/* 1. IF SWR IS FETCHING: Show Skeletons */}
            {charLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className={styles.charEntryWrapper}>
                  <CharacterCardSkeleton />
                </div>
              ))
            ) :
            paginatedCharacters && paginatedCharacters.length > 0 ? (
              paginatedCharacters.map((char) => (
                <div key={char.id} className={styles.charEntryWrapper}>
                  <CharacterCard
                    char={char}
                    isLoggedIn={isLoggedIn}
                    onEdit={setEditingChar}
                    onDelete={requestDelete}
                  />
                </div>
              ))
            ) : (
              /* --- THE EMPTY STATE FALLBACK --- */
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>?</div>
                <h3>No characters found!</h3>
                <p>
                  We couldn&apos;t find anyone matching{" "}
                  <b>&quot;{searchQuery}&quot;</b>
                  {filter !== "all"
                    ? ` in the ${filter.toUpperCase()} category`
                    : ""}
                  .
                </p>

                <button
                  className={styles.resetButton}
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("all");
                    setCurrentPage(1); // Reset page here too!
                  }}
                >
                  CLEAR FILTERS
                </button>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className={styles.paginationFooter}>
            <div className={styles.pageNavButtons}>
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

              <div
                className={`${styles.numBtn} ${styles.activeNum} ${styles.pageIndicator}`}
                aria-live="polite"
                aria-label={`Page ${Math.max(currentPage, 1)} of ${Math.max(totalPages, 1)}`}
              >
                {Math.max(currentPage, 1)}
              </div>

              <button
                className={styles.pageBtn}
                disabled={currentPage === totalPages || totalPages === 0}
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
          </div>
        </div>
      </section>

      {/* FLOATING ADD BUTTON */}
      {showBackToTop && (
        <button
          className={`${styles.backToTopBtn} ${isLoggedIn ? styles.backToTopBtnRaised : ""} ${isNearFooter ? styles.floatingBtnFooterSafe : ""} ${isLoggedIn && isNearFooter ? styles.backToTopBtnRaisedFooterSafe : ""}`}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <FontAwesomeIcon icon={faChevronUp} />
        </button>
      )}

      {isLoggedIn && (
        <button
          className={`${styles.addFloatingBtn} ${isNearFooter ? styles.floatingBtnFooterSafe : ""}`}
          onClick={() => setShowAddForm(true)}
        >
          +
        </button>
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

      {charPendingDelete && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.authModalContent}`}>
            <button
              type="button"
              className={styles.authModalClose}
              onClick={() => {
                setCharPendingDelete(null);
                setDeleteError("");
              }}
              aria-label="Close delete dialog"
            >
              x
            </button>
            <header className={styles.modalHeader}>
              <h3 className={styles.authModalTitle}>CONFIRM DELETION</h3>
            </header>
            <div className={styles.authModalBody}>
              <p className={styles.authModalText}>
                Permanently delete <strong>{charPendingDelete.name}</strong> from
                the archive? This action cannot be undone.
              </p>
              {deleteError && (
                <p className={styles.authErrorMessage} role="alert">
                  {deleteError}
                </p>
              )}
              <div className={`${styles.modalActions} ${styles.authModalActions}`}>
                <button
                  type="button"
                  className={`${styles.saveBtn} ${styles.authPrimaryBtn} ${styles.dangerActionBtn}`}
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className={`${styles.closeBtn} ${styles.authSecondaryBtn}`}
                  onClick={() => {
                    setCharPendingDelete(null);
                    setDeleteError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
