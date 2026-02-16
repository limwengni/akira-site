"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "../../index.module.css";
import { useCharacters } from "@/src/hooks/useCharacters";
import { STATUS_MAP, GENDER_MAP } from "@/src/constants/character";

export default function CharacterProfile() {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("bio");
  const { charList, loading: charLoading, fetchCharacters } = useCharacters();

  useEffect(() => {
    const init = async () => {
      if (charList.length === 0) await fetchCharacters();
    };
    init();
  }, []);

  useEffect(() => {
    if (charList.length > 0 && params.slug) {
      const found = charList.find((c) => c.slug === params.slug);
      if (found) {
        setCharacter(found);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    }
  }, [charList, params.slug]);

  const renderHTML = (content: string) => ({ __html: content || "" });

  const formatBirthday = (dateString: string) => {
    if (!dateString || dateString === "0000-00-00") return "UNKNOWN";
    const [_, monthStr, dayStr] = dateString.split("-");
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    return `${months[parseInt(monthStr) - 1]} ${parseInt(dayStr)}`;
  };

  if (charLoading || (charList.length === 0 && !notFound)) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loaderBox}>
          <div className={styles.spinner}></div>
          <p>ACCESSING RECORDS...</p>
        </div>
      </div>
    );
  }

  if (notFound || (!character && !charLoading)) {
    return (
      <div
        className={styles.pagePanel}
        style={{ textAlign: "center", padding: "50px" }}
      >
        ERROR: FILE MISSING
      </div>
    );
  }

  const charStats = character?.stats?.[0] || {};
  const roleColor =
    character.role === 2 ? "var(--error-color)" : "var(--accent-pro)";

  const tabs = [
    { id: "bio", label: "I", color: "var(--warn-color)", show: true },
    {
      id: "abilities",
      label: "II",
      color: "var(--error-color)",
      show: !!character.abilities,
    },
    {
      id: "relationships",
      label: "III",
      color: "var(--info-color)",
      show: !!character.relationships,
    },
    {
      id: "trivias",
      label: "IV",
      color: "var(--screentone-grey)",
      show: !!character.trivias,
    },
  ].filter((tab) => tab.show);

  return (
    <>
      <section
        className={styles.mainContent}
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        <div className={styles.folderContainer}>
          <div className={styles.leftColumn}>
            {/* ====== LEFT SIDE: ACTION SHOTS & ART ====== */}
            {/* <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "rgba(255,255,255,0.2)",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              [IMAGE DATA PENDING]
            </div> */}
          </div>

          <div className={styles.rightColumn}>
            {/* ====== RIGHT SIDE: NOTEBOOK DATA PAGE ====== */}
            {/* Notebook Binder Holes (Left Side) */}
            <div
              style={{
                position: "absolute",
                left: "20px",
                top: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "35px",
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "#333",
                  }}
                ></div>
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                left: "20px",
                bottom: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "35px",
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "#333",
                  }}
                ></div>
              ))}
            </div>
            <div
              style={{ position: "relative", padding: "50px 30px 100px 40px" }}
            >
              {/* === CONTENT: TAB 1 (BIO PAGE) === */}
              {activeTab === "bio" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      gap: "25px",
                      marginBottom: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "140px",
                        height: "180px",
                        border: "3px solid #000",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={character.icon_url || "/placeholder.png"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        alt="icon"
                      />
                    </div>

                    <div style={{ flex: 1, fontFamily: "monospace" }}>
                      <h1
                        style={{
                          fontSize: "2rem",
                          color: "#000",
                          textTransform: "uppercase",
                          lineHeight: "1",
                          textAlign: "right",
                          marginBottom: "15px",
                        }}
                      >
                        {character.name}
                      </h1>
                      {[
                        {
                          label: "STATUS",
                          value: STATUS_MAP[charStats.status] || "UNKNOWN",
                          color:
                            charStats.status === 2
                              ? "var(--error-color)"
                              : "var(--accent-pro)",
                        },
                        {
                          label: "GENDER",
                          value: GENDER_MAP[charStats.gender] || "UNKNOWN",
                        },
                        {
                          label: "BIRTHDAY",
                          value: formatBirthday(charStats.birthday),
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderBottom: "1px dashed #ccc",
                            padding: "6px 0",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            {item.label}:
                          </span>
                          <span style={{ color: item.color || "inherit" }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECONDARY STATS BAR */}
                  <div
                    style={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      padding: "15px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      marginBottom: "20px",
                      border: "1px solid #ddd",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          color: "#888",
                          display: "block",
                          fontSize: "0.7rem",
                        }}
                      >
                        AGE
                      </span>
                      <b>{charStats.age || "???"}</b>
                    </div>
                    <div>
                      <span
                        style={{
                          color: "#888",
                          display: "block",
                          fontSize: "0.7rem",
                        }}
                      >
                        HEIGHT
                      </span>
                      <b>
                        {charStats.height ? `${charStats.height}cm` : "???cm"}
                      </b>
                    </div>
                    <div>
                      <span
                        style={{
                          color: "#888",
                          display: "block",
                          fontSize: "0.7rem",
                        }}
                      >
                        SPECIES
                      </span>
                      <b>{charStats.species || "UNKNOWN"}</b>
                    </div>
                  </div>

                  {/* MAIN CONTENT SECTIONS */}
                  <div
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                      color: "#1a1a1a",
                    }}
                  >
                    <div style={{ marginBottom: "30px" }}>
                      <h3
                        style={{
                          borderBottom: "2px solid #000",
                          display: "inline-block",
                          marginBottom: "10px",
                          fontSize: "1rem",
                        }}
                      >
                        BIOGRAPHY
                      </h3>
                      {character.bio ? (
                        <div
                          dangerouslySetInnerHTML={renderHTML(character.bio)}
                        />
                      ) : (
                        <div
                          style={{
                            fontStyle: "italic",
                            color: "#888",
                            fontFamily: "monospace",
                          }}
                        >
                          [NO RECORDS FOUND]
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* === CONTENT: TAB 2 (ABILITIES) === */}
              {activeTab === "abilities" && (
                <div
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    color: "#1a1a1a",
                    animation: "fadeIn 0.3s",
                  }}
                >
                  {character.abilities && (
                    <div style={{ marginBottom: "30px" }}>
                      <h3
                        style={{
                          borderBottom: "2px solid #000",
                          display: "inline-block",
                          marginBottom: "10px",
                          fontSize: "1rem",
                        }}
                      >
                        ABILITIES
                      </h3>
                      <div
                        dangerouslySetInnerHTML={renderHTML(
                          character.abilities,
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* === CONTENT: TAB 3 (RELATIONSHIPS) === */}
              {activeTab === "relationships" && (
                <div
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    color: "#1a1a1a",
                    animation: "fadeIn 0.3s",
                  }}
                >
                  {character.relationships && (
                    <div style={{ marginBottom: "30px" }}>
                      <h3
                        style={{
                          borderBottom: "2px solid #000",
                          display: "inline-block",
                          marginBottom: "10px",
                          fontSize: "1rem",
                        }}
                      >
                        RELATIONSHIPS
                      </h3>
                      <div
                        dangerouslySetInnerHTML={renderHTML(
                          character.relationships,
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* === CONTENT: TAB 4 (TRIVIAS) === */}
              {activeTab === "trivias" && (
                <div
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    color: "#1a1a1a",
                    animation: "fadeIn 0.3s",
                  }}
                >
                  {character.trivias && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        background: "#fff9c4",
                        padding: "20px",
                        transform: "rotate(1deg)",
                        border: "1px solid #e6db55",
                        boxShadow: "5px 5px 0 rgba(0,0,0,0.05)",
                        fontFamily: "'Courier New', Courier, monospace",
                        color: "#5d4037",
                        marginTop: "20px",
                      }}
                    >
                      <b
                        style={{
                          color: "#333",
                          display: "block",
                          marginBottom: "5px",
                          textDecoration: "underline",
                        }}
                      >
                        FIELD NOTES / TRIVIA:
                      </b>
                      <div
                        className={styles.triviaContent}
                        dangerouslySetInnerHTML={renderHTML(character.trivias)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* === BOOKMARK STICKERS (Right Side) === */}
          <div className={styles.tabsContainer}>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={styles.bookmark}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: activeTab === tab.id ? "55px" : "40px",
                  height: "45px",
                  backgroundColor: tab.color,
                  borderRadius: "4px", // Simple radius for both orientations
                  boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(0,0,0,0.3)",
                  fontWeight: "bold",
                }}
              >
                {activeTab === tab.id && tab.label}
              </div>
            ))}
          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={() => router.push("/characters")}
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              background: "#000",
              color: "#fff",
              border: "none",
              padding: "10px 25px",
              cursor: "pointer",
              fontWeight: "bold",
              zIndex: 20
            }}
          >
            CLOSE
          </button>
        </div>
      </section>
    </>
  );
}
