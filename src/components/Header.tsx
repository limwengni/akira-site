"use client";

import styles from "../../app/index.module.css";

export const Header = () => {
  return (
    <header className={styles.mangaHeader}>
      <div className={styles.volTag}>VOL. 01 // 2024</div>
      <h1 className={styles.mangaTitle}>AKIRA'S SECRET BASEMENT</h1>
      <div className={styles.headerDecor}>
        <span className={styles.decorLine}></span>
        <span className={styles.decorText}>Directory</span>
        <span className={styles.decorLine}></span>
      </div>
    </header>
  );
};
