"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import "./globals.css";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getRoleLabel, getStatusLabel } from "../src/constants/character";
import { authService } from "@/src/services/auth";
import { characterService } from "@/src/services/character";
import { getCroppedImg } from "@/src/utils/cropUtils";

export default function Home() {
  //#region --- States ---
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);

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

      const rawStats = {
        age: data.age,
        gender: data.gender,
        height: data.height,
        species: data.species,
        birthday: data.birthday,
        dimension: data.dimension,
        affiliation: data.affiliation,
        status: 1,
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
      <header className="header-section">
        <h1 className="header-title">AKIRA'S OC ARCHIVE</h1>
        <p className="header-subtitle">WORLDBUILDING DATABASE</p>
      </header>

      {/* Use styles.container here */}
      <main className={styles.container}>
        <div className={styles["archive-grid"]}>
          {charList?.map((char) => (
            <div key={char.id} className={styles["teyan-card"]}>
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
                  <img src={char.icon_url || char.image_url} alt="icon" />
                </div>
              </div>

              <div className={styles["card-meta"]}>
                <div className={styles["meta-header"]}>
                  <div className={styles["name-box"]}>
                    <h3 className={styles["char-name"]}>{char.name}</h3>
                    <span className={styles["char-role"]} data-role={char.role}>
                      {getRoleLabel(char.role)}
                    </span>
                  </div>
                </div>
                <div className={styles["char-quote"]}>{char.quote}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FLOATING ADD BUTTON */}
      {isLoggedIn && (
        <button
          className={styles["add-floating-btn"]}
          onClick={() => setShowAddForm(true)}
        >
          +
        </button>
      )}

      <footer>
        <span className="footer-brand" onClick={handleSecretClick}>
          AKIRA_CORE
        </span>
        <div className="footer-links">
          <a href="https://akirachizu.carrd.co/">MAIN_SITE</a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} AKIRA ARCHIVE</p>
      </footer>

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
                  ? "// INITIALIZING_NEW_ENTRY"
                  : `// EDITING_SUBJECT: ${editingChar?.name}`}
              </h3>
            </header>

            <form onSubmit={handleSave}>
              <div className={styles.formDashboard}>
                {/* LEFT COLUMN: VISUALS */}
                <div className={styles.formSidebar}>
                  <label className={styles.fieldLabel}>MAIN_SPLASH_ART</label>
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
                    <span>CLICK_TO_UPLOAD</span>
                  </div>

                  <label className={styles.fieldLabel}>SYSTEM_ICON</label>
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
                      <label>SUBJECT_NAME</label>
                      <input
                        name="name"
                        defaultValue={editingChar?.name}
                        className={styles["input-field"]}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>ROLE_DESIGNATION</label>
                      <select
                        name="role"
                        defaultValue={editingChar?.role || "0"}
                        className={styles["input-field"]}
                      >
                        <option value="0">UNCLASSIFIED</option>
                        <option value="1">PROTAGONIST</option>
                        <option value="2">ANTAGONIST</option>
                      </select>
                    </div>
                  </div>

                  <label>DESIGNATED_QUOTE</label>
                  <textarea
                    name="quote"
                    defaultValue={editingChar?.quote}
                    className={styles["input-field"]}
                    rows={2}
                  />

                  {showAddForm && (
                    <div className={styles.statsSection}>
                      <h4 className={styles.sectionDivider}>
                        VITAL_STATISTICS_INITIALIZATION
                      </h4>
                      <div className={styles.statsGrid}>
                        <input
                          name="age"
                          placeholder="AGE"
                          defaultValue={editingChar?.stats?.[0]?.age}
                          className={styles["input-field"]}
                        />
                        <input
                          name="gender"
                          placeholder="GENDER"
                          defaultValue={editingChar?.stats?.[0]?.gender}
                          className={styles["input-field"]}
                        />
                        <input
                          name="height"
                          placeholder="HEIGHT"
                          defaultValue={editingChar?.stats?.[0]?.height}
                          className={styles["input-field"]}
                        />
                        <input
                          name="species"
                          placeholder="SPECIES"
                          defaultValue={editingChar?.stats?.[0]?.species}
                          className={styles["input-field"]}
                        />
                        <input
                          name="birthday"
                          placeholder="BIRTHDAY"
                          defaultValue={editingChar?.stats?.[0]?.birthday}
                          className={styles["input-field"]}
                        />
                        <input
                          name="dimension"
                          placeholder="DIMENSION"
                          defaultValue={editingChar?.stats?.[0]?.dimension}
                          className={styles["input-field"]}
                        />
                      </div>
                      <input
                        name="affiliation"
                        placeholder="AFFILIATION"
                        defaultValue={editingChar?.stats?.[0]?.affiliation}
                        className={styles["input-field"]}
                      />
                    </div>
                  )}
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
