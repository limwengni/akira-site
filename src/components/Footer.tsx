"use client";

import styles from "../../app/index.module.css";
import { useState, useEffect } from "react";

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
      <div className={styles.footerLeft}>
        <div className={styles.theEnd}>完。</div>
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
        <div className={styles.copyrightTag} onClick={handleSecretClick}>
          Copyright © {new Date().getFullYear()} Akira
        </div>
      </div>
    </footer>
  );
};
