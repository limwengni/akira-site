"use client";

import Link from "next/link";
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
    <MangaPanel title="CURRENT UPDATES" dark>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* ITEM 1: COMPLETE */}
        <div style={{ borderLeft: "3px solid #00d26a", paddingLeft: "12px" }}>
          <div style={{ color: "#00d26a", fontSize: "0.75rem", fontWeight: "bold", letterSpacing: "1px", marginBottom: "4px" }}>
            COMPLETE
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>
            Characters List
          </div>
        </div>

        {/* ITEM 2: IN PROGRESS */}
        <div style={{ borderLeft: "3px solid #fca311", paddingLeft: "12px" }}>
          <div style={{ color: "#fca311", fontSize: "0.75rem", fontWeight: "bold", letterSpacing: "1px", marginBottom: "4px" }}>
            IN PROGRESS
          </div>
          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.9rem", fontWeight: "600", lineHeight: "1.6" }}>
            <li>Character Profile</li>
            <li>About Artist Page</li>
            <li>World Lore</li>
          </ul>
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
        <div className={styles.pagePanel} style={{ minHeight: "100px", maxWidth: "800px", margin: "0 auto" }}>
          <div className={styles.diagonalOverlay}></div>

          <div
            style={{
              padding: "50px 40px",
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              justifyContent: "center",
            }}
          >
            {/* Main Intro */}
            <div className={styles.glitchBox}>
              <h3
                style={{
                  marginBottom: "20px",
                  color: "#333",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontSize: "1.5rem",
                  borderBottom: "2px solid #000",
                  display: "inline-block",
                  paddingBottom: "5px"
                }}
              >
                Welcome to Akira's Secret Basement
              </h3>
              <p
                style={{
                  lineHeight: "1.8",
                  marginBottom: "1.5rem",
                  color: "#444",
                  fontSize: "1.05rem"
                }}
              >
                You have stumbled into the personal archive. This is where I
                keep the blueprints for my characters and the fragments of the
                world they live in.
              </p>
              <p style={{ lineHeight: "1.8", color: "#444", fontSize: "1.05rem" }}>
                The <strong>World Lore</strong> section is currently sealed (I'm
                still writing it, sorry!). For now, feel free to browse the{" "}
                <strong>Character Archives</strong> via the menu on the left.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}