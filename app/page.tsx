"use client";

//#region --- Imports ---
import styles from "./index.module.css";
import "./globals.css";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";

import { useAuth } from "@/src/hooks/useAuth";
import { useCharacters } from "@/src/hooks/useCharacters";
import { useImageCrop } from "@/src/hooks/useImageCrop";

import { MangaPanel } from "@/src/components/MangaPanel";
import { CharacterCard } from "@/src/components/CharacterCard";

import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";

import { categoryLabels } from "@/src/constants/character";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CharacterForm } from "@/src/components/CharacterForm";
// #endregion

export default function Home() {
  //#region --- Path Constants ---
  const pathname = usePathname();

  const menuItems = [
    { id: "01", label: "Introduction", href: "/" },
    { id: "02", label: "Characters", href: "/characters" }, // or whatever your path is
    { id: "03", label: "World Lore", href: "/world-lore" },
    { id: "04", label: "Archive", href: "/archive" },
    { id: "05", label: "About the Artist", href: "/about" },
  ];
  //#endregion

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

  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("All");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [editingChar, setEditingChar] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  //#endregion

  //#region --- HANDLERS ---
  // Handler for Login
  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const result = await login(email, password);
    if (result.success) setShowLogin(false); // Close modal on success
  };

  // Handler for Logout
  const onLogoutSubmit = async () => {
    await logout();
    setShowLogout(false); // Close modal
  };

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

  // This happens inside your component
  const filteredCharacters = charList.filter((char) => {
    if (filter === "All") return true;
    if (filter === "Unclassified") return char.role === 0;
    if (filter === "Protagonist") return char.role === 1;
    if (filter === "Antagonist") return char.role === 2;
    return true;
  });

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

  return (
    <>
      <div className={styles.outerViewport}>
        {/* The Centered Page Container */}
        <div id="mangaPage" className={styles.pageContainer}>
          {/* Halftone Screentone Background */}
          <div className={styles.halftoneBg}></div>

          {/* Content Wrapper */}
          <div className={styles.contentWrapper}>
            {/* Manga Title Banner */}
            <Header />

            {/* Main 2-Column Grid Layout */}
            <main className={styles.mainGrid}>
              {/* LEFT SIDE: Sidebar */}
              <aside className={styles.sidebar}>
                <MangaPanel title="CONTENTS" dark collapsible={true}>
                  <nav className={styles.navLinks}>
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href;

                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          className={`${styles.navItem} ${isActive ? styles.activeNavItem : ""}`}
                        >
                          <span>
                            {item.id}. {item.label}
                          </span>
                        </a>
                      );
                    })}
                  </nav>
                </MangaPanel>

                <MangaPanel title="SYSTEM OVERVIEW">
                  <div className={styles.statBox}>
                    <div className={styles.statNumber}>
                      {charList.length.toString().padStart(2, "0")}
                    </div>
                    <div className={styles.statLabel}>Subjects Registered</div>
                  </div>
                </MangaPanel>
              </aside>

              {/* RIGHT SIDE: Character List */}
              <section className={styles.mainContent}>
                <div className={styles.pagePanel}>
                  <div className={styles.diagonalOverlay}></div>

                  {/* Page Header */}
                  <h2 className={styles.pageHeader}>
                    <span className={styles.pageTag}>PAGE 1</span>
                    <div className={styles.filterGroup}>
                      {["All", "Unclassified", "Protagonist", "Antagonist"].map(
                        (category) => (
                          <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={
                              filter === category
                                ? styles.activeTab
                                : styles.tab
                            }
                          >
                            {categoryLabels[category]}
                          </button>
                        ),
                      )}
                    </div>
                  </h2>

                  {/* Character Grid */}
                  <div className={styles.archiveGrid}>
                    {filteredCharacters?.map((char, index) => (
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
                  <div className={styles.paginationFooter}>
                    <button className={styles.pageBtn} disabled>
                      <FontAwesomeIcon
                        icon={faChevronLeft}
                        style={{ marginRight: "8px" }}
                      />
                      PREV
                    </button>

                    <div className={styles.pageNumbers}>
                      <button
                        className={`${styles.numBtn} ${styles.activeNum}`}
                      >
                        1
                      </button>
                    </div>

                    <button className={styles.pageBtn} disabled>
                      NEXT
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        style={{ marginLeft: "8px" }}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </main>

            {/* Footer Section */}
            <Footer
              isLoggedIn={isLoggedIn}
              onOpenLogout={() => setShowLogout(true)}
              onOpenLogin={() => setShowLogin(true)}
            />
          </div>
        </div>
      </div>

      {/* FLOATING ADD BUTTON */}
      {isLoggedIn && (
        <button
          className={styles.addFloatingBtn}
          onClick={() => setShowAddForm(true)}
        >
          +
        </button>
      )}

      {/* --- MODALS --- */}
      {/* Login Popup */}
      {showLogin && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3>ADMIN ACCESS</h3>
            </header>

            <form onSubmit={onLoginSubmit}>
              <input
                type="email"
                placeholder="Admin Email"
                className={styles.inputField}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div style={{ paddingBottom: "15px" }}></div>
              <input
                type="password"
                placeholder="Password"
                className={styles.inputField}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className={styles.modalActions}>
                {/* 2. Set button to type="submit" */}
                <button
                  type="submit"
                  className={styles.saveBtn}
                  onClick={onLoginSubmit}
                >
                  Unlock
                </button>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setShowLogin(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogout && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h3>CONFIRM LOGOUT</h3>
            </header>
            <p>Are you sure you want to logout?</p>
            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={onLogoutSubmit}>
                Confirm
              </button>
              <button
                className={styles.closeBtn}
                type="button"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
              aspect={editingTarget === "icon" ? 1 : 1 / 1.2}
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
