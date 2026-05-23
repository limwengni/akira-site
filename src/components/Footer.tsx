"use client";

import styles from "../../app/index.module.css";
import { useState } from "react";

interface FooterProps {
  isLoggedIn: boolean;
  onOpenLogout: () => void;
  onOpenLogin: () => void;
}

export const Footer = ({
  isLoggedIn,
  onOpenLogout,
  onOpenLogin,
}: FooterProps) => {
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const nextCount = clickCount + 1;

    if (nextCount === 3) {
      if (isLoggedIn) {
        onOpenLogout();
      } else {
        onOpenLogin();
      }
      setClickCount(0);
    } else {
      setClickCount(nextCount);
    }
  };

  return (
    <footer className={styles.mangaFooter}>
      <div className={styles.footerBar}>
        <div className={styles.footerMetaTag}>
          <span>Last Updated:</span> 23 May 2026
        </div>
        <div className={styles.copyrightTag} onClick={handleSecretClick}>
          {"Copyright \u00A9 "}
          {new Date().getFullYear()}
          {" Akira"}
        </div>
      </div>
    </footer>
  );
};
