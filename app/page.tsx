"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./globals.css";
import styles from "./index.module.css";
import { supabase } from "../src/lib/superbase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getRoleLabel, getStatusLabel } from "../src/constants/character";
import { authService } from "@/src/services/auth";
import { characterService } from "@/src/services/character";

export default function Home() {
  //#region --- States ---
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);

  const [charList, setCharList] = useState<any[]>([]);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [editingChar, setEditingChar] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
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

  // --- HANDLERS ---
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    const isNew = !editingChar?.id;

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
    };

    if (isNew) {
      setCharList((prev) => [optimisticChar, ...prev]); // Add to top of list
    } else {
      setCharList((prev) =>
        prev.map((c) => (c.id === editingChar.id ? optimisticChar : c)),
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

      const slug = (data.name as string)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

      if (mainFile)
        finalImageUrl = await characterService.uploadImage(
          mainFile,
          slug,
          "main",
        );
      if (iconFile)
        finalIconUrl = await characterService.uploadImage(
          iconFile,
          slug,
          "icon",
        );

      const charPayload = {
        name: data.name,
        image_url: finalImageUrl,
        icon_url: finalIconUrl,
        quote: data.quote,
        role: parseInt(data.role as string),
        slug: slug,
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

      await characterService.save(
        charPayload,
        statsPayload,
        isNew ? null : tempEditingId,
      );

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

  const handleDelete = async (id: number) => {
    if (!confirm("CONFIRM_DELETION?")) return;

    const originalList = [...charList];
    setCharList((prev) => prev.filter((c) => c.id !== id));

    try {
      await characterService.delete(id);
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
                    onClick={() => handleDelete(char.id)}
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
                  <img src={char.image_url} alt={char.name} loading="lazy" />
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
                      onChange={(e) => setMainFile(e.target.files?.[0] || null)}
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
                      onChange={(e) => setIconFile(e.target.files?.[0] || null)}
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
