"use client";

import React, { useState } from "react";
import styles from "./index.module.css";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { useAuth } from "@/src/hooks/useAuth";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCharacterProfile =
    pathname?.startsWith("/characters/") && pathname !== "/characters";

  const { isLoggedIn, login, logout } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const menuItems = [
    { id: "01", label: "Introduction", href: "/" },
    { id: "02", label: "Characters", href: "/characters" },
    // { id: "03", label: "World Lore", href: "/world-lore" },
    // { id: "04", label: "About the Artist", href: "/about" },
    // { id: "05", label: "Archive", href: "/archive" },
  ];

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    const result = await login(email, password);
    if (result.success) setShowLogin(false);
  };

  const onLogoutSubmit = async () => {
    await logout();
    setShowLogout(false);
  };

  if (isCharacterProfile) {
    return <>{children}</>;
  }

  return (
    <>
      <div className={styles.outerViewport}>
        <div id="mangaPage" className={styles.pageContainer}>
          <div className={styles.halftoneBg}></div>
          <div className={styles.contentWrapper}>
            {!isCharacterProfile && (
              <Header menuItems={menuItems} pathname={pathname ?? ""} />
            )}

            <main className={isCharacterProfile ? "" : styles.mainGrid}>
              {!isCharacterProfile && (
                <aside className={styles.sidebar}>
                  <div id="page-sidebar-slot"></div>
                </aside>
              )}

              {/* PAGE-SPECIFIC CONTENT */}
              {children}
            </main>

            {!isCharacterProfile && (
              <Footer
                isLoggedIn={isLoggedIn}
                onOpenLogout={() => setShowLogout(true)}
                onOpenLogin={() => setShowLogin(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.authModalContent}`}>
            <button
              type="button"
              className={styles.authModalClose}
              onClick={() => setShowLogin(false)}
              aria-label="Close login dialog"
            >
              ×
            </button>
            <header className={styles.modalHeader}>
              <h3 className={styles.authModalTitle}>ADMIN LOGIN</h3>
            </header>
            <form onSubmit={onLoginSubmit}>
              <div className={styles.authInputShell}>
                <span className={styles.authInputLabel}>Username/Email</span>
                <input
                  type="email"
                  placeholder=""
                  className={`${styles.inputField} ${styles.authModalInput}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div style={{ paddingBottom: "12px" }}></div>
              <div className={styles.authInputShell}>
                <span className={styles.authInputLabel}>Password</span>
                <input
                  type="password"
                  placeholder=""
                  className={`${styles.inputField} ${styles.authModalInput}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className={`${styles.modalActions} ${styles.authModalActions}`}>
                <button type="submit" className={`${styles.saveBtn} ${styles.authPrimaryBtn}`}>
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogout && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.authModalContent} ${styles.authModalNoClose}`}>
            <button
              type="button"
              className={styles.authModalClose}
              onClick={() => setShowLogout(false)}
              aria-label="Close logout dialog"
            >
              ×
            </button>
            <header className={styles.modalHeader}>
              <h3 className={styles.authModalTitle}>CONFIRM LOGOUT</h3>
            </header>
            <p className={styles.authModalText}>
              Are you sure you want to log out of admin mode?
            </p>
            <div className={`${styles.modalActions} ${styles.authModalActions}`}>
              <button className={`${styles.saveBtn} ${styles.authPrimaryBtn}`} onClick={onLogoutSubmit}>
                Confirm
              </button>
              <button
                className={`${styles.closeBtn} ${styles.authSecondaryBtn}`}
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
