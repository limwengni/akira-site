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
  const { isLoggedIn, login, logout } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const menuItems = [
    { id: "01", label: "Introduction", href: "/" },
    { id: "02", label: "Characters", href: "/characters" },
    // { id: "03", label: "World Lore", href: "/world-lore" },
    // { id: "04", label: "Archive", href: "/archive" },
    // { id: "05", label: "About the Artist", href: "/about" },
  ];

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) setShowLogin(false);
  };

  const onLogoutSubmit = async () => {
    await logout();
    setShowLogout(false);
  };

  return (
    <html lang="en">
      <body>
        <div className={styles.outerViewport}>
          <div id="mangaPage" className={styles.pageContainer}>
            <div className={styles.halftoneBg}></div>
            <div className={styles.contentWrapper}>
              <Header />

              <main className={styles.mainGrid}>
                {/* SHARED SIDEBAR */}
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

                {/* PAGE-SPECIFIC CONTENT */}
                {children}
              </main>

              <Footer
                isLoggedIn={isLoggedIn}
                onOpenLogout={() => setShowLogout(true)}
                onOpenLogin={() => setShowLogin(true)}
              />
            </div>
          </div>
        </div>

        {/* Login Modal */}
        {showLogin && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <h3>Admin Login</h3>
              <form onSubmit={onLoginSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
                <button type="button" onClick={() => setShowLogin(false)}>
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Logout Modal */}
        {showLogout && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <h3>Confirm Logout</h3>
              <button onClick={onLogoutSubmit}>Logout</button>
              <button onClick={() => setShowLogout(false)}>Cancel</button>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
