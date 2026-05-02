"use client";

import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import styles from "./index.module.css";
import { MangaPanel } from "@/src/components/MangaPanel";

const SystemOverviewPanel = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sidebarContainer = document.getElementById("page-sidebar-slot");
  if (!sidebarContainer) return null;

  return createPortal(
    <MangaPanel title="SYSTEM LOG" collapsible defaultOpen={true}>
      <div className={styles.systemLogStack}>
        <div className={styles.systemLogModule}>
          <div className={`${styles.systemLogRow} ${styles.systemLogRowActive}`}>
            <span>Module: Characters</span>
            <span>100%</span>
          </div>
          <div className={styles.systemLogBar}>
            <div className={styles.systemLogFillActive}></div>
          </div>
        </div>

        <div className={styles.systemLogModule}>
          <div className={`${styles.systemLogRow} ${styles.systemLogRowMuted}`}>
            <span>Module: Artist</span>
            <span>0%</span>
          </div>
          <div className={styles.systemLogBar}>
            <div className={styles.systemLogFillMuted}></div>
          </div>
          <div className={styles.systemLogHint}>Pending initialization.</div>
        </div>

        <div className={styles.systemLogModule}>
          <div className={`${styles.systemLogRow} ${styles.systemLogRowMuted}`}>
            <span>Module: Lore</span>
            <span>0%</span>
          </div>
          <div className={styles.systemLogBar}>
            <div className={styles.systemLogFillMuted}></div>
          </div>
          <div className={styles.systemLogHint}>Data encrypted.</div>
        </div>

        <div className={styles.systemLogMeta}>
          <div className={styles.systemLogMetaRow}>
            <span>Last Update</span>
            <span>2 MAY 2026</span>
          </div>
          <div className={styles.systemLogMetaRow}>
            <span>Version</span>
            <span>v.0.7.0-beta</span>
          </div>
        </div>
      </div>
    </MangaPanel>,
    sidebarContainer
  );
};

export default function Home() {
  return (
    <>
      <SystemOverviewPanel />
      <section className={styles.mainContent}>
        <div
          className={`${styles.pagePanel} ${styles.homePagePanel}`}
          style={{ minHeight: "100px" }}
        >
          <div
            style={{
              padding: "30px 10px",
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              justifyContent: "center",
            }}
          >
            {/* Main Intro */}
            <div className={styles.glitchBox}>
              {/* <h3 className={styles.welcomeHeadingStatic}>
                Welcome to Akira&apos;s Secret Basement
              </h3> */}
              {/*
              Reusable glitch snippet for later:
              <span
                className={styles.secretGlitch}
                data-text="Secret"
                data-glitch-a="秘密"
                data-glitch-b="秘匿"
              >
                Secret
              </span>
              */}
              <p
                style={{
                  lineHeight: "1.8",
                  color: "rgba(255,255,255,0.88)",
                  fontSize: "1.05rem",
                }}
              >
                You have stumbled into the personal archive. This is where I
                keep the blueprints for my characters and the fragments of the
                world they live in. The <strong>World Lore</strong> section is
                currently sealed (I&apos;m still writing it, sorry!). For now,
                feel free to browse the <strong>Character Archives</strong> via
                the tabs above.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
