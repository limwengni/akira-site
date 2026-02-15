"use client";

import styles from "../../app/index.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface MangaPanelProps {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
  collapsible?: boolean;
}

export const MangaPanel = ({
  title,
  children,
  dark = false,
  collapsible = false,
}: MangaPanelProps) => {
  // Start closed. 
  // Mobile/Tablet will see it closed. 
  // Desktop CSS will ignore this and force it open.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className={`${styles.mangaPanel} ${
        dark ? styles.panelDark : styles.panelLight
      }`}
    >
      <div
        className={`${styles.panelHeader} ${
          dark ? styles.headerDark : styles.headerLight
        }`}
        // Only toggle if collapsible is true
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <span>{title}</span>

        {/* Render icon if collapsible is true. 
            CSS will HIDE this on desktop automatically. */}
        {collapsible && (
          <span className={styles.collapseIcon}>
            <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
          </span>
        )}
      </div>

      <div
        className={`${styles.panelContent} ${
          // If collapsible AND closed, add the .closed class
          (collapsible && !isOpen) ? styles.closed : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
};