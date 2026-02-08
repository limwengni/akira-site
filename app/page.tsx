"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import "./globals.css";
import styles from "./index.module.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use this as visitor key for read access
);

const getRoleLabel = (roleId: any) => {
  const roles: Record<number, string> = {
    0: "UNCLASSIFIED",
    1: "PROTAGONIST",
    2: "ANTAGONIST",
  };

  // Convert to number to ensure it matches the keys
  const id = Number(roleId);
  return roles[id] || "UNCLASSIFIED";
};

export const SUB_ROLES = {
  UNCLASSIFIED: 0,
  PROTAGONIST: 1,
  ANTAGONIST: 2,
  DEUTERAGONIST: 3,
  SUPPORTING: 4,
  TRITAGONIST: 5,
  MINOR: 6,
} as const;

const getSubRoleLabel = (roleId: number): string => {
  const roles: Record<number, string> = {
    [SUB_ROLES.UNCLASSIFIED]: "Unclassified",
    [SUB_ROLES.PROTAGONIST]: "Protagonist",
    [SUB_ROLES.ANTAGONIST]: "Antagonist",
    [SUB_ROLES.DEUTERAGONIST]: "Deuteragonist",
    [SUB_ROLES.SUPPORTING]: "Supporting",
    [SUB_ROLES.TRITAGONIST]: "Tritagonist",
    [SUB_ROLES.MINOR]: "Minor Character",
  };

  return roles[roleId];
};

const getStatusLabel = (roleId: number) => {
  const roles: Record<string, string> = {
    "0": "UNKNOWN",
    "1": "ALIVE",
    "2": "DECEASED",
  };

  const key = roleId !== null ? String(roleId) : "0";
  return roles[key];
};

export default function Home() {
  // --- STATE ---
  const [charList, setCharList] = useState<any[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editingChar, setEditingChar] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [mainFile, setMainFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  // LOGIN FORM STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      setIsLoggedIn(true);
      setShowLogin(false);
    }
  };

  // --- FETCH DATA ---
  // Since we are no longer using "async function Home", we fetch data in useEffect
  useEffect(() => {
    const fetchOCs = async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("name", { ascending: true });

      if (error) console.error("Error fetching OCs:", error);
      else setCharList(data || []);
    };
    fetchOCs();
  }, []);

  // --- Handle login after refresh ---
  useEffect(() => {
    // 1. Fetch OCs
    const fetchOCs = async () => {
      const { data } = await supabase
        .from("characters")
        .select("*")
        .order("name", { ascending: true });
      setCharList(data || []);
    };
    fetchOCs();

    // 2. Check if a user is already logged in
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setIsLoggedIn(true);
    };
    checkUser();
  }, []);

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error logging out: " + error.message);
    } else {
      setIsLoggedIn(false);
      alert("Admin logged out.");
    }
  };

  // --- HANDLERS ---
  const handleSecretClick = () => {
    setClickCount((prev) => {
      const nextCount = prev + 1;

      if (nextCount === 3) {
        if (isLoggedIn) {
          handleLogout();
        } else {
          setShowLogin(true);
        }
        return 0;
      }
      return nextCount;
    });
  };

  // Helper to upload to Supabase Storage
  const uploadToStorage = async (
    file: File,
    folder: string,
    type: "main" | "icon",
  ) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("character-assets")
      .upload(filePath, file, {
        upsert: true, // This overwrites if the file path is identical
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("character-assets")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      // 1. Upload Images if they exist
      let finalImageUrl = editingChar?.image_url || "";
      let finalIconUrl = editingChar?.icon_url || "";

      const slug = (data.name as string)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

      if (mainFile)
        finalImageUrl = await uploadToStorage(mainFile, slug, "main");
      if (iconFile)
        finalIconUrl = await uploadToStorage(iconFile, slug, "icon");

      const charPayload = {
        name: data.name,
        image_url: finalImageUrl,
        icon_url: finalIconUrl,
        quote: data.quote,
        role: parseInt(data.role as string),
        slug: slug,
      };

      const statsPayload = {
        age: data.age,
        gender: data.gender,
        height: data.height,
        species: data.species,
        birthday: data.birthday,
        dimension: data.dimension,
        affiliation: data.affiliation,
        status: 1,
      };

      if (showAddForm) {
        // Save New OC
        const { data: newChar, error: charErr } = await supabase
          .from("characters")
          .insert([charPayload])
          .select()
          .single();
        if (charErr) throw charErr;

        const { error: statsErr } = await supabase
          .from("stats")
          .insert([{ character_id: newChar.id, ...statsPayload }]);
        if (statsErr) throw statsErr;
      } else {
        // Update Existing OC
        const { error: charErr } = await supabase
          .from("characters")
          .update(charPayload)
          .eq("id", editingChar.id);
        if (charErr) throw charErr;

        const { error: statsErr } = await supabase
          .from("stats")
          .update(statsPayload)
          .eq("character_id", editingChar.id);
        if (statsErr) throw statsErr;
      }

      alert("ARCHIVE_UPDATED_SUCCESSFULLY");
      window.location.reload();
    } catch (err: any) {
      alert("CRITICAL_SYNC_ERROR: " + err.message);
    }
  };

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
                <button
                  className={styles["edit-btn"]}
                  onClick={() => setEditingChar(char)}
                  title="Edit Character"
                >
                  ✎
                </button>
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
