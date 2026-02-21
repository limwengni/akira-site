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
    <MangaPanel title="SYSTEM LOG" dark>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.8rem", color: "var(--success-color)", fontWeight: "bold" }}>
             <span>MODULE: CHARACTERS</span>
             <span>100%</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "#333", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", background: "var(--success-color)" }}></div>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.8rem", color: "#666", fontWeight: "bold" }}>
             <span>MODULE: ARTIST</span>
             <span>0%</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "#333", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: "0%", height: "100%", background: "#666" }}></div>
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "4px" }}>
             Pending initialization.
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.8rem", color: "#666", fontWeight: "bold" }}>
             <span>MODULE: LORE</span>
             <span>0%</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "#333", borderRadius: "3px", overflow: "hidden" }}>
             <div style={{ width: "0%", height: "100%", background: "#666" }}></div>
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "4px" }}>
             Data encrypted.
          </div>
        </div>

        <div style={{ borderTop: "1px dashed #444", paddingTop: "10px", marginTop: "5px" }}>
           <div style={{ fontSize: "0.7rem", color: "#666", display: "flex", justifyContent: "space-between" }}>
              <span>LAST UPDATE:</span>
              <span>21 FEB 2026</span>
           </div>
           <div style={{ fontSize: "0.7rem", color: "#666", display: "flex", justifyContent: "space-between" }}>
              <span>VERSION:</span>
              <span>v.0.6.0-beta</span>
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
          className={styles.pagePanel}
          style={{ minHeight: "100px", maxWidth: "800px", margin: "0 auto" }}
        >
          <div className={styles.diagonalOverlay}></div>

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
              <h3
                style={{
                  marginBottom: "20px",
                  color: "#333",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontSize: "1.5rem",
                  borderBottom: "2px solid #000",
                  display: "inline-block",
                  paddingBottom: "5px",
                }}
              >
                Welcome to Akira's Secret Basement
              </h3>
              <p
                style={{
                  lineHeight: "1.8",
                  marginBottom: "1.5rem",
                  color: "#444",
                  fontSize: "1.05rem",
                }}
              >
                You have stumbled into the personal archive. This is where I
                keep the blueprints for my characters and the fragments of the
                world they live in.
              </p>
              <p
                style={{
                  lineHeight: "1.8",
                  color: "#444",
                  fontSize: "1.05rem",
                }}
              >
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
