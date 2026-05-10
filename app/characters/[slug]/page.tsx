"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "../../index.module.css";
import { useCharacters } from "@/src/hooks/useCharacters";
import {
  STATUS_MAP,
  GENDER_MAP,
  getRoleLabel,
} from "@/src/constants/character";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CharacterProfile() {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { charList, loading: charLoading } = useCharacters();

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
    const [, monthStr, dayStr] = dateString.split("-");
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

  if (charLoading || (!character && !notFound)) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loaderBox}>
          <div className={styles.spinner}></div>
          <p>ACCESSING RECORDS...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.profileError}>
        <h2>ERROR 404</h2>
        <p>FILE NOT FOUND</p>
        <button onClick={() => router.push("/characters")}>
          RETURN TO ARCHIVE
        </button>
      </div>
    );
  }

  const charStats = character?.stats?.[0] || {};

  // Determine available pages
  const pages = [
    { num: 1, label: "BIO", available: true },
    { num: 2, label: "ABILITIES", available: !!character.abilities },
    { num: 3, label: "RELATIONSHIPS", available: !!character.relationships },
    { num: 4, label: "TRIVIA", available: !!character.trivias },
  ].filter((page) => page.available);

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.profileContainer}>
            <aside className={styles.profileLeft}>
              <div className={styles.profileMediaFrame}>
                <img
                  src={
                    character.image_url ||
                    character.icon_url ||
                    "/placeholder.png"
                  }
                  alt={character.name}
                />
              </div>

              <div className={styles.profileMediaCaption}>
                <span className={styles.profileMediaLabel}>Character File</span>
                <strong>{character.name}</strong>
              </div>
            </aside>

            <section className={styles.profileRight}>
              <button
                className={styles.profileCloseBtn}
                onClick={() => router.push("/characters")}
                aria-label="Return to character archive"
              >
                <FontAwesomeIcon icon={faClose} />
              </button>

              <div className={styles.profilePage}>
                <div className={styles.profileHeader}>
                  <div className={styles.nameRoleBox}>
                    <span className={styles.profileKicker}>Character Record</span>
                    <h1>{character.name}</h1>
                    <div className={styles.profileRole}>
                      {getRoleLabel(character.role)}
                    </div>
                  </div>

                  {character.quote && (
                    <div className={styles.profileQuote}>
                      &ldquo;{character.quote}&rdquo;
                    </div>
                  )}
                </div>

                <div className={styles.profileTop}>
                  <div className={styles.profileImageBox}>
                    <img
                      src={
                        character.icon_url ||
                        character.image_url ||
                        "/placeholder.png"
                      }
                      alt={character.name}
                    />
                  </div>

                  <div className={styles.profileQuickStats}>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>STATUS</span>
                      <span className={styles.statValue}>
                        {STATUS_MAP[charStats.status] || "UNKNOWN"}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>GENDER</span>
                      <span className={styles.statValue}>
                        {GENDER_MAP[charStats.gender] || "UNKNOWN"}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>BIRTHDAY</span>
                      <span className={styles.statValue}>
                        {formatBirthday(charStats.birthday)}
                      </span>
                    </div>
                    <div className={styles.profileSecondaryStats}>
                      <div className={styles.statBox2}>
                        <div className={styles.statBoxLabel}>AGE</div>
                        <div className={styles.statBoxValue}>
                          {charStats.age || "???"}
                        </div>
                      </div>
                      <div className={styles.statBox2}>
                        <div className={styles.statBoxLabel}>HEIGHT</div>
                        <div className={styles.statBoxValue}>
                          {charStats.height ? `${charStats.height}cm` : "???"}
                        </div>
                      </div>
                      <div className={styles.statBox2}>
                        <div className={styles.statBoxLabel}>SPECIES</div>
                        <div className={styles.statBoxValue}>
                          {charStats.species || "UNKNOWN"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {currentPage === 1 && (
                  <div className={styles.profileSection}>
                    <h3>BIO</h3>
                    {character.bio ? (
                      <div dangerouslySetInnerHTML={renderHTML(character.bio)} />
                    ) : (
                      <p className={styles.noData}>[NO RECORDS FOUND]</p>
                    )}
                  </div>
                )}

                {currentPage === 2 && (
                  <div className={styles.profileSection}>
                    <h3>ABILITIES</h3>
                    {character.abilities ? (
                      <div
                        dangerouslySetInnerHTML={renderHTML(character.abilities)}
                      />
                    ) : (
                      <p className={styles.noData}>[NO RECORDS FOUND]</p>
                    )}
                  </div>
                )}

                {currentPage === 3 && (
                  <div className={styles.profileSection}>
                    <h3>RELATIONSHIPS</h3>
                    {character.relationships ? (
                      <div
                        dangerouslySetInnerHTML={renderHTML(
                          character.relationships,
                        )}
                      />
                    ) : (
                      <p className={styles.noData}>[NO RECORDS FOUND]</p>
                    )}
                  </div>
                )}

                {currentPage === 4 && (
                  <div className={styles.profileSection}>
                    <h3>TRIVIA</h3>
                    {character.trivias ? (
                      <div dangerouslySetInnerHTML={renderHTML(character.trivias)} />
                    ) : (
                      <p className={styles.noData}>[NO RECORDS FOUND]</p>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.profileNav}>
                {pages.map((page) => (
                  <button
                    key={page.num}
                    className={`${styles.profileNavBtn} ${currentPage === page.num ? styles.active : ""}`}
                    onClick={() => setCurrentPage(page.num)}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
