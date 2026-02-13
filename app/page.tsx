"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import "./globals.css";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faXmark } from "@fortawesome/free-solid-svg-icons";
import { GENDER_MAP, getRoleLabel, ROLE_MAP } from "../src/constants/character";
import { authService } from "@/src/services/auth";
import { characterService } from "@/src/services/character";
import { getCroppedImg } from "@/src/utils/cropUtils";
import { STATUS_MAP } from "@/src/constants/character";

// --- Sub-components for Layout ---
const MangaPanel = ({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) => (
  <section
    className={`${styles.mangaPanel} ${dark ? styles.panelDark : styles.panelLight}`}
  >
    <div
      className={`${styles.panelHeader} ${dark ? styles.headerDark : styles.headerLight}`}
    >
      {title}
    </div>
    <div className={styles.panelContent}>{children}</div>
  </section>
);

export default function Home() {
  //#region --- States ---
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(true); // For sound effect

  const [charList, setCharList] = useState<any[]>([]);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [editingChar, setEditingChar] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  type Area = {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImgSrc, setTempImgSrc] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<"icon" | "main" | null>(
    null,
  );
  //#endregion

  //#region --- Auth Function ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  // LOGIN FORM STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await authService.login(email, password);
    if (error) {
      alert("Authentication failed: " + error.message);
    } else {
      alert("Login successful!");
      setIsLoggedIn(true);
      setShowLogin(false);
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    const { error } = await authService.logout();
    if (error) {
      alert("Logout failed: " + error.message);
    } else {
      alert("Logout successful!");
      setIsLoggedIn(false);
      window.location.reload();
    }
  };

  const checkAuthStatus = async () => {
    const user = await authService.getSession();
    setIsLoggedIn(!!user);
  };
  //#endregion

  //#region --- HANDLERS ---
  const handleSecretClick = () => {
    setClickCount((prev) => {
      const nextCount = prev + 1;

      if (nextCount === 3) {
        if (isLoggedIn) {
          setShowLogout(true);
        } else {
          setShowLogin(true);
        }
        return 0;
      }
      return nextCount;
    });
  };

  const onFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "icon" | "main",
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = URL.createObjectURL(file);

      setTempImgSrc(imageDataUrl);
      setEditingTarget(type);
      setCropperOpen(true);
      setZoom(1); // Reset zoom
    }
  };

  const showCroppedImage = async () => {
    try {
      if (!tempImgSrc || !croppedAreaPixels) return;

      // Use our utility to get the blob
      const croppedBlob = await getCroppedImg(tempImgSrc, croppedAreaPixels);

      const fileName =
        editingTarget === "icon" ? "cropped-icon.jpg" : "cropped-main.jpg";

      // Convert Blob to File (Optional, but helps keep types consistent)
      const croppedFile = new File([croppedBlob], fileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      if (editingTarget === "icon") {
        setIconFile(croppedFile);
      } else {
        setMainFile(croppedFile);
      }

      // Cleanup
      setCropperOpen(false);
      setTempImgSrc(null);
    } catch (e) {
      console.error(e);
    }
  };

  const onCancel = () => {
    setCropperOpen(false);
    setTempImgSrc(null); // Clear the temp image so it doesn't linger
    setEditingTarget(null);
  };
  //#endregion

  // #region --- Load Function ---
  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Fetch Characters
      const data = await characterService.fetchAllCharacters();
      setCharList(data.data || []);

      await checkAuthStatus();
    } catch (err) {
      console.error("Initialization failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setIsBlinking((b) => !b), 500);
    return () => clearInterval(blink);
  }, []);
  //#endregion

  //#region --- Save / Delete Handlers ---
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    setEditingChar(null);
    setShowAddForm(false);
    setMainFile(null);
    setIconFile(null);

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

      const charPayload = {
        name: data.name,
        image_url: finalImageUrl,
        icon_url: finalIconUrl,
        quote: data.quote,
        role: parseInt(data.role as string),
        slug: currentSlug,
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
      } catch (dbError) {
        alert("Failed to save character data. Please try again.");
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
    }
  };

  const handleDelete = async (id: number, slug: string) => {
    if (!confirm("CONFIRM_DELETION?")) return;

    const originalList = [...charList];

    setCharList((prev) => prev.filter((c) => c.id !== id));

    try {
      await characterService.delete(id, slug);
      console.log("Character deleted successfully.");
    } catch (err: any) {
      console.error("Deletion failed:", err);
      alert("Deletion Error: " + err.message);
      setCharList(originalList); // Revert UI
    }
  };
  //#endregion

  return (
    <>
      <div className={styles.outerViewport}>
        {/* The Centered Page Container */}
        <div id="manga-page" className={styles.pageContainer}>
          {/* Halftone Screentone Background */}
          <div className={styles.halftoneBg}></div>

          {/* Content Wrapper */}
          <div className={styles.contentWrapper}>
            {/* Manga Title Banner */}
            <header className={styles.mangaHeader}>
              <div className={styles.volTag}>VOL. 01 // 2024</div>
              <h1 className={styles.mangaTitle}>AKIRA'S SECRET BASEMENT</h1>
              <div className={styles.headerDecor}>
                <span className={styles.decorLine}></span>
                <span className={styles.decorText}>Directory</span>
                <span className={styles.decorLine}></span>
              </div>
            </header>

            {/* Main 2-Column Grid Layout */}
            <main className={styles.mainGrid}>
              {/* LEFT SIDE: Sidebar */}
              <aside className={styles.sidebar}>
                <MangaPanel title="CONTENTS" dark>
                  <nav className={styles.navLinks}>
                    {[
                      "01. Introduction",
                      "02. Protagonists",
                      "03. The Rivals",
                      "04. World Lore",
                      "05. Archive",
                    ].map((item) => (
                      <a key={item} href="#" className={styles.navItem}>
                        <span>{item}</span>
                      </a>
                    ))}
                  </nav>
                </MangaPanel>

                <MangaPanel title="READER REACH">
                  <div className={styles.statBox}>
                    <div className={styles.statNumber}>{charList.length}</div>
                    <div className={styles.statLabel}>Subjects Registered</div>
                  </div>
                </MangaPanel>

                {/* Sound Effect */}
                {/* <div
                  className={`${styles.soundEffect} ${isBlinking ? styles.soundBlink : ""}`}
                >
                  ゴゴゴ
                </div> */}
              </aside>

              {/* RIGHT SIDE: Character List */}
              <section className={styles.mainContent}>
                <div className={styles.pagePanel}>
                  {/* Diagonal Overlay */}
                  <div className={styles.diagonalOverlay}></div>

                  {/* Page Header */}
                  <h2 className={styles.pageHeader}>
                    <span className={styles.pageTag}>PAGE 1</span>
                    <span className={styles.chapterTag}>CHARACTERS</span>
                  </h2>

                  {/* Character Grid */}
                  <div className={styles["archive-grid"]}>
                    {charList?.map((char, index) => (
                      <div key={char.id} className={styles.charEntryWrapper}>
                        <div className={styles["teyan-card"]}>
                          {/* EDIT ICON - Only visible when logged in */}
                          {isLoggedIn && (
                            <div className={styles["action-stack"]}>
                              <button
                                className={styles["edit-btn"]}
                                onClick={() => setEditingChar(char)}
                                title="Edit Character"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                className={styles["delete-btn"]}
                                onClick={() => handleDelete(char.id, char.slug)}
                                title="Delete Character"
                              >
                                <FontAwesomeIcon icon={faXmark} />
                              </button>
                            </div>
                          )}

                          <div className={styles["img-wrap-container"]}>
                            <Link
                              href={`/profile/${char.slug}`}
                              className={styles["img-wrap"]}
                            >
                              <img
                                src={`${char.image_url}?width=300&height=300&resize=cover`}
                                alt={char.name}
                                loading="lazy"
                              />
                            </Link>
                            <div className={styles["avatar-box"]}>
                              <img
                                src={char.icon_url || char.image_url}
                                alt="icon"
                              />
                            </div>
                          </div>

                          <div className={styles["card-meta"]}>
                            <div className={styles["meta-header"]}>
                              <div className={styles["name-box"]}>
                                <h3 className={styles["char-name"]}>
                                  {char.name}
                                </h3>
                                <span
                                  className={
                                    char.role === 1
                                      ? styles["char-role-pro"]
                                      : char.role === 2
                                        ? styles["char-role-ant"]
                                        : styles["char-role"]
                                  }
                                  data-role={char.role}
                                >
                                  {getRoleLabel(char.role)}
                                </span>
                              </div>
                            </div>
                            <div className={styles["char-quote"]}>
                              {char.quote}
                            </div>
                          </div>
                        </div>
                        {/* Add dotted line separator except for last item */}
                        {index < charList.length - 1 && (
                          <div className={styles.dottedSeparator}></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination Footer */}
                  <div className={styles.paginationFooter}>
                    <button className={styles.pageBtn} disabled>
                      ← NEXT
                    </button>
                    <div className={styles.pageNumbers}>
                      <button
                        className={`${styles.numBtn} ${styles.activeNum}`}
                      >
                        1
                      </button>
                    </div>
                    <button className={styles.pageBtn} disabled>
                      PREV →
                    </button>
                  </div>
                </div>
              </section>
            </main>

            {/* Footer Section */}
            <footer className={styles.mangaFooter}>
              <div className={styles.footerLeft}>
                <div className={styles.theEnd}>THE END.</div>
                <p className={styles.footerMeta} onClick={handleSecretClick}>
                  AKIRA_CORE // © {new Date().getFullYear()}
                </p>
              </div>
              <div className={styles.footerRight}>
                <div className={styles.footerBlocks}>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.block} ${i === 0 ? styles.blockActive : ""}`}
                    ></div>
                  ))}
                </div>
                <div className={styles.copyrightTag}>
                  Copyright © {new Date().getFullYear()} Akira
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* FLOATING ADD BUTTON */}
      {isLoggedIn && (
        <button
          className={styles["add-floating-btn"]}
          onClick={() => setShowAddForm(true)}
        >
          +
        </button>
      )}

      {/* --- MODALS --- */}
      {/* Login Popup */}
      {showLogin && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal-content"]}>
            <h3>ADMIN ACCESS</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevents page reload
                handleLogin();
              }}
            >
              <input
                type="email"
                placeholder="Admin Email"
                className={styles["input-field"]}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className={styles["input-field"]}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className={styles["modal-actions"]}>
                {/* 2. Set button to type="submit" */}
                <button type="submit">Unlock</button>
                <button type="button" onClick={() => setShowLogin(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogout && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal-content"]}>
            <h3>CONFIRM LOGOUT</h3>
            <p>ARE YOU SURE YOU WANT TO LOGOUT?</p>
            <div className={styles["modal-actions"]}>
              <button
                onClick={() => {
                  handleLogout();
                  setShowLogout(false);
                }}
              >
                CONFIRM
              </button>
              <button type="button" onClick={() => setShowLogout(false)}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loaderBox}>
            <div className={styles.spinner}></div>
            <p>SYNCHRONIZING_WITH_ARCHIVE...</p>
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
              aspect={editingTarget === "icon" ? 1 : 2 / 3}
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
              {/* RED CANCEL BUTTON */}
              <button
                type="button" // Important: preventing form submission
                onClick={onCancel}
                className={styles.btnCancel}
              >
                Cancel
              </button>

              {/* GREEN DONE BUTTON */}
              <button
                type="button"
                onClick={showCroppedImage}
                className={styles.btnSave}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Form */}
      {(editingChar || showAddForm) && (
        <div className={styles["modal-overlay"]}>
          <div
            className={styles["modal-content"]}
            style={{ maxWidth: "900px" }}
          >
            <header className={styles.modalHeader}>
              <h3>
                {showAddForm
                  ? "// INITIALIZING NEW ENTRY"
                  : `// EDITING SUBJECT: ${editingChar?.name}`}
              </h3>
            </header>

            <form onSubmit={handleSave}>
              <div className={styles.formDashboard}>
                {/* LEFT COLUMN: VISUALS */}
                <div className={styles.formSidebar}>
                  <label className={styles.fieldLabel}>MAIN SPLASH ART</label>
                  <div
                    className={styles.dropZone}
                    onClick={() => document.getElementById("mainFile")?.click()}
                  >
                    <img
                      src={
                        mainFile
                          ? URL.createObjectURL(mainFile)
                          : editingChar?.image_url || "/placeholder-bg.png"
                      }
                      alt="Preview"
                    />
                    <input
                      type="file"
                      id="mainFile"
                      hidden
                      onChange={(e) => onFileSelect(e, "main")}
                    />
                    <span>CLICK TO UPLOAD</span>
                  </div>

                  <label className={styles.fieldLabel}>SYSTEM ICON</label>
                  <div
                    className={styles.dropZoneSmall}
                    onClick={() => document.getElementById("iconFile")?.click()}
                  >
                    <img
                      src={
                        iconFile
                          ? URL.createObjectURL(iconFile)
                          : editingChar?.icon_url || "/placeholder-icon.png"
                      }
                      alt="Preview"
                    />
                    <input
                      type="file"
                      id="iconFile"
                      hidden
                      accept="image/*"
                      onChange={(e) => onFileSelect(e, "icon")}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: DATA */}
                <div className={styles.formMain}>
                  <div className={styles.formRow}>
                    <div style={{ flex: 2 }}>
                      <label>SUBJECT NAME</label>
                      <input
                        name="name"
                        defaultValue={editingChar?.name}
                        className={styles["input-field"]}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>ROLE DESIGNATION</label>
                      <select
                        name="role"
                        defaultValue={editingChar?.role || "0"}
                        className={styles["input-field"]}
                      >
                        {Object.entries(ROLE_MAP).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label>DESIGNATED QUOTE</label>
                  <textarea
                    name="quote"
                    defaultValue={editingChar?.quote}
                    className={styles["input-field"]}
                    rows={2}
                  />

                  <div className={styles.statsSection}>
                    <h4 className={styles.sectionDivider}>
                      VITAL STATISTICS INITIALIZATION
                    </h4>
                    <div className={styles.statsGrid}>
                      <div>
                        <label>GENDER</label>
                        <select
                          name="gender"
                          defaultValue={editingChar?.stats?.[0]?.gender ?? "1"}
                          className={styles["input-field"]}
                        >
                          {Object.entries(GENDER_MAP).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>SPECIES</label>
                        <input
                          name="species"
                          defaultValue={editingChar?.stats?.[0]?.species}
                          className={styles["input-field"]}
                        />
                      </div>
                      <div>
                        <label>AGE</label>
                        <input
                          name="age"
                          defaultValue={editingChar?.stats?.[0]?.age}
                          className={styles["input-field"]}
                        />
                      </div>
                      <div>
                        <label>HEIGHT (CM)</label>
                        <input
                          type="number"
                          name="height"
                          defaultValue={editingChar?.stats?.[0]?.height
                            ?.toString()
                            .replace(/\D/g, "")}
                          placeholder="e.g. 175"
                          className={styles["input-field"]}
                        />
                      </div>
                      <div>
                        {/* BIRTHDAY LOGIC */}
                        {(() => {
                          const bday = editingChar?.stats?.[0]?.birthday; // e.g., "2000-12-21"
                          const [_, month, day] = bday
                            ? bday.split("-")
                            : ["", "01", "01"];

                          return (
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                gridColumn: "span 2",
                              }}
                            >
                              <div style={{ flex: 2 }}>
                                <label>BIRTHDAY MONTH</label>
                                <select
                                  name="birth_month"
                                  defaultValue={month}
                                  className={styles["input-field"]}
                                >
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option
                                      key={i + 1}
                                      value={String(i + 1).padStart(2, "0")}
                                    >
                                      {new Date(2000, i)
                                        .toLocaleString("default", {
                                          month: "long",
                                        })
                                        .toUpperCase()}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ flex: 1 }}>
                                <label>DAY</label>
                                <select
                                  name="birth_day"
                                  defaultValue={day}
                                  className={styles["input-field"]}
                                >
                                  {Array.from({ length: 31 }, (_, i) => (
                                    <option
                                      key={i + 1}
                                      value={String(i + 1).padStart(2, "0")}
                                    >
                                      {i + 1}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <label>VITAL STATUS</label>
                        <select
                          name="status"
                          defaultValue={editingChar?.stats?.[0]?.status ?? "1"}
                          className={styles["input-field"]}
                        >
                          {Object.entries(STATUS_MAP).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* TODO Dimension and Organization may need database, 
                            currently i dont have plan on their names and details
                            so i not going to save them first 
                        */}
                      {/* <div style={{ gridColumn: "span 2" }}>
                          <label>DIMENSION OF ORIGIN</label>
                          <input
                            name="dimension"
                            defaultValue={editingChar?.stats?.[0]?.dimension}
                            className={styles["input-field"]}
                          />
                        </div> */}
                    </div>
                    {/* <div style={{ gridColumn: "span 2" }}>
                        <label>ORGANIZATIONAL AFFILIATION</label>
                        <input
                          name="affiliation"
                          defaultValue={editingChar?.stats?.[0]?.affiliation}
                          className={styles["input-field"]}
                        />
                      </div> */}
                  </div>
                </div>
              </div>

              <div className={styles["modal-actions"]}>
                <button type="submit" className={styles.saveBtn}>
                  SYNCHRONIZE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingChar(null);
                    setShowAddForm(false);
                    setIconFile(null);
                    setMainFile(null);
                  }}
                  className={styles.closeBtn}
                >
                  ABORT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
