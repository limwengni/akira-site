"use client";

import React, { useState } from "react";
import styles from "./index.module.css";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { MangaPanel } from "@/src/components/MangaPanel";
import { useAuth } from "@/src/hooks/useAuth";
import Link from "next/link";

export default function RootLayout({
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

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className={styles.outerViewport}>
          <div id="mangaPage" className={styles.pageContainer}>
            <div className={styles.halftoneBg}></div>
            <div className={styles.contentWrapper}>
              {!isCharacterProfile && <Header />}

              <main className={isCharacterProfile ? "" : styles.mainGrid}>
                {!isCharacterProfile && (
                  <aside className={styles.sidebar}>
                    <MangaPanel
                      title="CONTENTS"
                      dark
                      collapsible={true}
                      defaultOpen={true}
                    >
                      <nav className={styles.navLinks}>
                        {menuItems.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={`${styles.navItem} ${
                              pathname === item.href ? styles.activeNavItem : ""
                            }`}
                          >
                            <span>
                              {item.id}. {item.label}
                            </span>
                          </Link>
                        ))}
                      </nav>
                    </MangaPanel>

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
            <div className={styles.modalContent}>
              <header className={styles.modalHeader}>
                <h3>ADMIN ACCESS</h3>
              </header>
              <form onSubmit={onLoginSubmit}>
                <input
                  type="email"
                  placeholder="Admin Email"
                  className={styles.inputField}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div style={{ paddingBottom: "15px" }}></div>
                <input
                  type="password"
                  placeholder="Password"
                  className={styles.inputField}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className={styles.modalActions}>
                  <button type="submit" className={styles.saveBtn}>
                    Unlock
                  </button>
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={() => setShowLogin(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Logout Modal */}
        {showLogout && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <header className={styles.modalHeader}>
                <h3>CONFIRM LOGOUT</h3>
              </header>
              <p>Are you sure you want to logout?</p>
              <div className={styles.modalActions}>
                <button className={styles.saveBtn} onClick={onLogoutSubmit}>
                  Confirm
                </button>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowLogout(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
