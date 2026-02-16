"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/index.module.css";
import { GENDER_MAP, ROLE_MAP, STATUS_MAP } from "@/src/constants/character";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

interface CharacterFormProps {
  editingChar: any;
  showAddForm: boolean;
  isSaving: boolean;
  mainFile: File | null;
  iconFile: File | null;
  onFileSelect: (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "main" | "icon",
  ) => void;
  openExistingInCropper: (url: string, target: "main" | "icon") => void;
  clearImage: (type: "main" | "icon") => void;
  handleSave: (
    e: React.FormEvent<HTMLFormElement>,
    char: any,
    main: File | null,
    icon: File | null,
    onSuccess: () => void,
    extraData?: {
      abilities: string;
      relationships: string;
      trivias: string;
      labels: string[];
      galleryFiles: File[];
    },
  ) => Promise<void> | void;
  onClose: () => void;
}

//#region --- Helper Functions ---
const stringifyLore = (items: { name: string; desc: string }[]) => {
  return items
    .map((item) => `<b>${item.name}:</b> ${item.desc}`)
    .join("<br><br>");
};

const stringifyTrivia = (items: string[]) => {
  return items.map((item) => `• ${item}`).join("<br><br>");
};
//#endregion

export const CharacterForm = ({
  editingChar,
  showAddForm,
  isSaving,
  mainFile,
  iconFile,
  onFileSelect,
  openExistingInCropper,
  clearImage,
  handleSave,
  onClose,
}: CharacterFormProps) => {
  // Birthday Parsing Logic
  const bday = editingChar?.stats?.[0]?.birthday;
  const [_, month, day] = bday ? bday.split("-") : ["", "01", "01"];

  // --- States ---
  const [formStep, setFormStep] = useState(1);

  // Lore Lists
  const [abilities, setAbilities] = useState<{ name: string; desc: string }[]>(
    [],
  );
  const [relationships, setRelationships] = useState<
    { name: string; desc: string }[]
  >([]);
  const [trivias, setTrivias] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>(["BASE"]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const [currentGalleryUrls, setCurrentGalleryUrls] = useState<string[]>([]);

  // Temp Inputs
  const [tempAbility, setTempAbility] = useState({ name: "", desc: "" });
  const [tempRel, setTempRel] = useState({ name: "", desc: "" });
  const [tempTrivia, setTempTrivia] = useState("");
  const [tempLabel, setTempLabel] = useState("");

  // --- Handlers ---
  const decodeHTML = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const addAbility = () => {
    if (tempAbility.name && tempAbility.desc) {
      setAbilities([...abilities, tempAbility]);
      setTempAbility({ name: "", desc: "" });
    }
  };

  const addRel = () => {
    if (tempRel.name && tempRel.desc) {
      setRelationships([...relationships, tempRel]);
      setTempRel({ name: "", desc: "" });
    }
  };

  const addTrivia = () => {
    if (tempTrivia) {
      setTrivias([...trivias, tempTrivia]);
      setTempTrivia("");
    }
  };

  const addLabel = () => {
    if (tempLabel && !labels.includes(tempLabel)) {
      setLabels([...labels, tempLabel.toUpperCase()]);
      setTempLabel("");
    }
  };

  const updateEntry = (
    list: any[],
    setList: Function,
    index: number,
    field: "name" | "desc",
    value: string,
  ) => {
    const updated = [...list];
    updated[index][field] = value;
    setList(updated);
  };

  useEffect(() => {
    if (editingChar?.gallery) {
      setCurrentGalleryUrls(editingChar.gallery);
    } else {
      setCurrentGalleryUrls([]);
    }
  }, [editingChar]);

  //#region --- THE PARSER (HTML to State) ---
  useEffect(() => {
    setAbilities([]);
    setRelationships([]);
    setTrivias([]);
    setLabels(["BASE"]);

    if (editingChar) {
      // 1. Parse Abilities
      if (editingChar.abilities) {
        const parts = decodeHTML(editingChar.abilities)
          .split("<br><br>")
          .filter((p: string) => p.trim() !== "");

        const parsed = parts
          .map((p: string) => {
            // 1. Remove the bold tags to get "Name: Description"
            const cleanPart = p
              .replace(/<\/?b>/gi, "")
              .replace(/<\/?strong>/gi, "");

            // 2. Find the first colon
            const colonIndex = cleanPart.indexOf(":");

            if (colonIndex !== -1) {
              return {
                name: cleanPart.substring(0, colonIndex).trim(),
                desc: cleanPart.substring(colonIndex + 1).trim(),
              };
            }

            console.warn("Manual Parse failed for part:", p);
            return null;
          })
          .filter(Boolean);

        setAbilities(parsed as any);
      }

      // 2. Parse Relationships
      if (editingChar.relationships) {
        const parts = decodeHTML(editingChar.relationships)
          .split("<br><br>")
          .filter((p: string) => p.trim() !== "");

        const parsed = parts
          .map((p: string) => {
            // 1. Remove the bold tags to get "Name: Description"
            const cleanPart = p
              .replace(/<\/?b>/gi, "")
              .replace(/<\/?strong>/gi, "");

            // 2. Find the first colon
            const colonIndex = cleanPart.indexOf(":");

            if (colonIndex !== -1) {
              return {
                name: cleanPart.substring(0, colonIndex).trim(),
                desc: cleanPart.substring(colonIndex + 1).trim(),
              };
            }

            console.warn("Manual Parse failed for part:", p);
            return null;
          })
          .filter(Boolean);

        setRelationships(parsed as any);
      }

      // 3. Parse Trivias (Handles the bullet points)
      if (editingChar.trivias) {
        const parsedTrivia = editingChar.trivias
          .split("<br><br>")
          .map((t: string) => t.replace(/^[•\s]*/, "").trim()) // Remove bullet and spaces
          .filter((t: string) => t.length > 0);
        setTrivias(parsedTrivia);
      }

      // 4. Parse Labels (if they exist in DB)
      if (editingChar.labels && Array.isArray(editingChar.labels)) {
        setLabels(editingChar.labels);
      }
    }
  }, [editingChar, showAddForm]);
  //#endregion

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prepare the formatted data for the database
    const extraData = {
      abilities: stringifyLore(abilities),
      relationships: stringifyLore(relationships),
      trivias: stringifyTrivia(trivias),
      labels: labels,
      galleryFiles: galleryFiles,
      existingGalleryUrls: currentGalleryUrls,
    };

    handleSave(e, editingChar, mainFile, iconFile, onClose, extraData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: "900px" }}>
        <header className={styles.modalHeader}>
          <div className={styles.headerTop}>
            <h3>
              {showAddForm
                ? "// INITIALIZING NEW ENTRY"
                : `// EDITING: ${editingChar?.name}`}
            </h3>
            {/* <span className={styles.stepIndicator}>STEP {formStep} / 3</span> */}
          </div>

          <nav className={styles.formNav}>
            {/* The Buttons */}
            <div className={styles.navButtons}>
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className={`${styles.navBtn} ${formStep === 1 ? styles.activeNav : ""}`}
              >
                <span className={styles.navNum}>01</span> VITAL DATA
              </button>
              <button
                type="button"
                onClick={() => setFormStep(2)}
                className={`${styles.navBtn} ${formStep === 2 ? styles.activeNav : ""}`}
              >
                <span className={styles.navNum}>02</span> LORE & ARCHIVE
              </button>
              <button
                type="button"
                onClick={() => setFormStep(3)}
                className={`${styles.navBtn} ${formStep === 3 ? styles.activeNav : ""}`}
              >
                <span className={styles.navNum}>03</span> VISUAL GALLERY
              </button>
            </div>

            {/* THE SEGMENTED PROGRESS BAR */}
            <div className={styles.progressSegments}>
              <div
                className={`${styles.segment} ${formStep >= 1 ? styles.filled : ""}`}
              ></div>
              <div
                className={`${styles.segment} ${formStep >= 2 ? styles.filled : ""}`}
              ></div>
              <div
                className={`${styles.segment} ${formStep >= 3 ? styles.filled : ""}`}
              ></div>
            </div>
          </nav>
        </header>

        <form onSubmit={onSubmit}>
          <div style={{ display: formStep === 1 ? "block" : "none" }}>
            <div className={styles.formDashboard}>
              {/* LEFT COLUMN: VISUALS */}
              <div className={styles.formSidebar}>
                <div>
                  <label className={styles.fieldLabel}>MAIN SPLASH ART</label>
                  <div className={styles.dropZoneContainer}>
                    <div
                      className={styles.dropZone}
                      onClick={() => {
                        if (mainFile) {
                          openExistingInCropper(
                            URL.createObjectURL(mainFile),
                            "main",
                          );
                        } else if (editingChar?.image_url) {
                          openExistingInCropper(editingChar.image_url, "main");
                        } else {
                          document.getElementById("mainFile")?.click();
                        }
                      }}
                    >
                      {!mainFile && !editingChar?.image_url && (
                        <span>CLICK TO UPLOAD</span>
                      )}
                      {(mainFile || editingChar?.image_url) && (
                        <img
                          src={
                            mainFile
                              ? URL.createObjectURL(mainFile)
                              : editingChar?.image_url || "/placeholder-bg.png"
                          }
                          alt="Preview"
                        />
                      )}
                      <input
                        type="file"
                        id="mainFile"
                        hidden
                        onChange={(e) => onFileSelect(e, "main")}
                      />
                    </div>
                    <div className={styles.actionRow}>
                      {(mainFile || editingChar?.image_url) && (
                        <button
                          type="button"
                          className={styles.clearBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage("main");
                          }}
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={styles.fieldLabel}>SYSTEM ICON</label>
                  <div className={styles.dropZoneContainer}>
                    <div
                      className={styles.dropZoneSmall}
                      onClick={() => {
                        if (iconFile) {
                          openExistingInCropper(
                            URL.createObjectURL(iconFile),
                            "icon",
                          );
                        } else if (editingChar?.icon_url) {
                          openExistingInCropper(editingChar.icon_url, "icon");
                        } else {
                          document.getElementById("iconFile")?.click();
                        }
                      }}
                    >
                      {!iconFile && !editingChar?.icon_url && (
                        <span style={{ fontSize: 10 }}>CLICK TO UPLOAD</span>
                      )}
                      {(iconFile || editingChar?.icon_url) && (
                        <img
                          src={
                            iconFile
                              ? URL.createObjectURL(iconFile)
                              : editingChar?.icon_url || "/placeholder-icon.png"
                          }
                          alt="Preview"
                        />
                      )}
                      <input
                        type="file"
                        id="iconFile"
                        hidden
                        onChange={(e) => onFileSelect(e, "icon")}
                      />
                    </div>
                    <div className={styles.actionRow}>
                      {(iconFile || editingChar?.icon_url) && (
                        <button
                          type="button"
                          className={styles.clearBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage("icon");
                          }}
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DATA */}
              <div className={styles.formMain}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel}>SUBJECT NAME</label>
                    <input
                      name="name"
                      defaultValue={editingChar?.name}
                      className={styles.inputField}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className={styles.fieldLabel}>
                      ROLE DESIGNATION
                    </label>
                    <select
                      name="role"
                      defaultValue={editingChar?.role || "0"}
                      className={styles.inputField}
                    >
                      {Object.entries(ROLE_MAP).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className={styles.fieldLabel}>DESIGNATED QUOTE</label>
                <textarea
                  name="quote"
                  defaultValue={editingChar?.quote}
                  className={styles.inputField}
                  rows={2}
                />

                <div className={styles.statsSection}>
                  <h4 className={styles.sectionDivider}>
                    VITAL STATISTICS INITIALIZATION
                  </h4>
                  <div className={styles.statsGrid}>
                    <div>
                      <label className={styles.fieldLabel}>GENDER</label>
                      <select
                        name="gender"
                        defaultValue={editingChar?.stats?.[0]?.gender ?? "0"}
                        className={styles.inputField}
                      >
                        {Object.entries(GENDER_MAP).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={styles.fieldLabel}>SPECIES</label>
                      <input
                        name="species"
                        defaultValue={editingChar?.stats?.[0]?.species}
                        className={styles.inputField}
                      />
                    </div>
                    <div>
                      <label className={styles.fieldLabel}>AGE</label>
                      <input
                        name="age"
                        defaultValue={editingChar?.stats?.[0]?.age}
                        className={styles.inputField}
                      />
                    </div>
                    <div>
                      <label className={styles.fieldLabel}>HEIGHT (CM)</label>
                      <input
                        type="number"
                        name="height"
                        defaultValue={editingChar?.stats?.[0]?.height
                          ?.toString()
                          .replace(/\D/g, "")}
                        placeholder="e.g. 175"
                        className={styles.inputField}
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
                              <label className={styles.fieldLabel}>
                                BIRTHDAY MONTH
                              </label>
                              <select
                                name="birth_month"
                                defaultValue={month}
                                className={styles.inputField}
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
                              <label className={styles.fieldLabel}>DAY</label>
                              <select
                                name="birth_day"
                                defaultValue={day}
                                className={styles.inputField}
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
                      <label className={styles.fieldLabel}>VITAL STATUS</label>
                      <select
                        name="status"
                        defaultValue={editingChar?.stats?.[0]?.status ?? "1"}
                        className={styles.inputField}
                      >
                        {Object.entries(STATUS_MAP).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: formStep === 2 ? "block" : "none" }}>
            <div className={styles.formDashboardPage2}>
              <div className={styles.loreGrid}>
                <div>
                  <label className={styles.fieldLabel}>SUBJECT BIOGRAPHY</label>
                  <textarea
                    name="bio"
                    defaultValue={editingChar?.bio}
                    className={styles.inputField}
                    rows={4}
                  />
                </div>
                <div className={styles.twoColLore}>
                  <div>
                    <label className={styles.fieldLabel}>
                      SPECIAL ABILITIES
                    </label>
                    <div className={styles.tableScrollWrapper}>
                      <table className={styles.loreTable}>
                        <thead>
                          <tr>
                            <th>NAME</th>
                            <th>DESC</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {abilities.map((a, i) => (
                            <tr key={i}>
                              <td>
                                <input
                                  value={a.name}
                                  onChange={(e) =>
                                    updateEntry(
                                      abilities,
                                      setAbilities,
                                      i,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className={styles.tableInput}
                                />
                              </td>
                              <td>
                                <textarea
                                  value={a.desc}
                                  onChange={(e) =>
                                    updateEntry(
                                      abilities,
                                      setAbilities,
                                      i,
                                      "desc",
                                      e.target.value,
                                    )
                                  }
                                  className={styles.tableInput}
                                  rows={1}
                                />
                              </td>
                              <td>
                                <FontAwesomeIcon
                                  className={styles.deleteIcon}
                                  icon={faTrash}
                                  onClick={() =>
                                    setAbilities(
                                      abilities.filter((_, idx) => idx !== i),
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className={styles.addEntryArea}>
                      <input
                        placeholder="Ability Name"
                        value={tempAbility.name}
                        onChange={(e) =>
                          setTempAbility({
                            ...tempAbility,
                            name: e.target.value,
                          })
                        }
                        className={styles.inputField}
                      />
                      <div className={styles.listInputRow}>
                        <textarea
                          placeholder="Ability Description..."
                          value={tempAbility.desc}
                          onChange={(e) =>
                            setTempAbility({
                              ...tempAbility,
                              desc: e.target.value,
                            })
                          }
                          className={styles.inputField}
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={addAbility}
                          className={styles.addListBtn}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={styles.fieldLabel}>RELATIONSHIPS</label>
                    <div className={styles.tableScrollWrapper}>
                      <table className={styles.loreTable}>
                        <thead>
                          <tr>
                            <th>NAME</th>
                            <th>BOND</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {relationships.map((r, i) => (
                            <tr key={i}>
                              <td>
                                <input
                                  value={r.name}
                                  onChange={(e) =>
                                    updateEntry(
                                      relationships,
                                      setRelationships,
                                      i,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className={styles.tableInput}
                                />
                              </td>
                              <td>
                                <textarea
                                  value={r.desc}
                                  onChange={(e) =>
                                    updateEntry(
                                      relationships,
                                      setRelationships,
                                      i,
                                      "desc",
                                      e.target.value,
                                    )
                                  }
                                  className={styles.tableInput}
                                  rows={1}
                                />
                              </td>
                              <td>
                                <FontAwesomeIcon
                                  className={styles.deleteIcon}
                                  icon={faTrash}
                                  onClick={() =>
                                    setRelationships(
                                      relationships.filter(
                                        (_, idx) => idx !== i,
                                      ),
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className={styles.addEntryArea}>
                      <input
                        placeholder="Person"
                        value={tempRel.name}
                        onChange={(e) =>
                          setTempRel({ ...tempRel, name: e.target.value })
                        }
                        className={styles.inputField}
                      />
                      <div className={styles.listInputRow}>
                        <textarea
                          placeholder="Bond Details..."
                          value={tempRel.desc}
                          onChange={(e) =>
                            setTempRel({ ...tempRel, desc: e.target.value })
                          }
                          className={styles.inputField}
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={addRel}
                          className={styles.addListBtn}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={styles.fieldLabel}>DATA TRIVIA</label>
                  <div className={styles.listInputRow}>
                    <input
                      placeholder="Add trivia..."
                      value={tempTrivia}
                      onChange={(e) => setTempTrivia(e.target.value)}
                      className={styles.inputField}
                    />
                    <button
                      type="button"
                      onClick={addTrivia}
                      className={styles.addListBtn}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  <ul className={styles.triviaList}>
                    {trivias.map((t, i) => (
                      <li key={i}>
                        {t}{" "}
                        <FontAwesomeIcon
                          className={styles.deleteIcon}
                          icon={faTrash}
                          onClick={() =>
                            setTrivias(trivias.filter((_, idx) => idx !== i))
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.twoColLore}>
                  <div>
                    <label className={styles.fieldLabel}>LABELS</label>
                    <div className={styles.listInputRow}>
                      <input
                        value={tempLabel}
                        onChange={(e) => setTempLabel(e.target.value)}
                        className={styles.inputField}
                      />
                      <button
                        type="button"
                        onClick={addLabel}
                        className={styles.addListBtn}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                    <div className={styles.chipContainer}>
                      {labels.map((l, i) => (
                        <div key={i} className={styles.loreChip}>
                          {l}{" "}
                          <FontAwesomeIcon
                            className={styles.deleteIcon}
                            icon={faTrash}
                            onClick={() =>
                              setLabels(labels.filter((_, idx) => idx !== i))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: formStep === 3 ? "block" : "none" }}>
            <div className={styles.formDashboardPage3}>
              <div className={styles.loreSectionFull}>
                <label className={styles.fieldLabel}>Galleries</label>
                <div className={styles.galleryUploadBox}>
                  <input
                    type="file"
                    id="galleryInput"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setGalleryFiles((prev) => [...prev, ...newFiles]);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="galleryInput"
                    className={styles.galleryDropzone}
                  >
                    <FontAwesomeIcon icon={faPlus} size="2x" />
                    <span>ADD TO PENDING QUEUE</span>
                  </label>
                </div>
              </div>

              {currentGalleryUrls.length > 0 && (
                <div className={styles.loreSectionFull}>
                  <label className={styles.fieldLabel}>
                    CLOUD ARCHIVE (EXISTING)
                  </label>
                  <div className={styles.galleryPreviewGrid}>
                    {currentGalleryUrls.map((url: string, index: number) => (
                      <div
                        key={`existing-${index}`}
                        className={styles.galleryItem}
                      >
                        <img
                          src={url}
                          alt="Existing"
                          className={styles.galleryImg}
                        />
                        <div className={styles.galleryItemOverlay}>
                          <span className={styles.fileName}>
                            FILE_{index + 1}
                          </span>
                          <button
                            type="button"
                            className={styles.removeImgBtn}
                            onClick={() => {
                              // Just remove it from the local list, don't call the service yet
                              setCurrentGalleryUrls((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.loreSectionFull}>
                <label className={styles.fieldLabel}>
                  PENDING SYNC ({galleryFiles.length})
                </label>
                <div className={styles.galleryPreviewGrid}>
                  {galleryFiles.map((file, index) => (
                    <div key={index} className={styles.galleryItem}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className={styles.galleryImg}
                      />
                      <div className={styles.galleryItemOverlay}>
                        <span className={styles.fileName}>{file.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryFiles(
                              galleryFiles.filter((_, i) => i !== index),
                            )
                          }
                          className={styles.removeImgBtn}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {galleryFiles.length === 0 && (
                    <div className={styles.emptyGalleryMsg}>
                      NO NEW ASSETS SELECTED
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            {formStep === 1 && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.closeBtn}
                >
                  ABORT
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Stop event bubbling
                    setFormStep(2);
                  }}
                >
                  NEXT
                </button>
              </>
            )}

            {formStep === 2 && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.closeBtn}
                >
                  ABORT
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Stop event bubbling
                    setFormStep(3);
                  }}
                >
                  NEXT
                </button>
              </>
            )}

            {formStep === 3 && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.closeBtn}
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isSaving}
                >
                  {isSaving ? "SYNCING..." : "SYNCHRONIZE"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
