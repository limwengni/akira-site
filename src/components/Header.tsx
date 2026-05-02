"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../../app/index.module.css";

interface HeaderProps {
  menuItems: { id: string; label: string; href: string }[];
  pathname: string;
}

export const Header = ({ menuItems, pathname }: HeaderProps) => {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setPendingHref(null);
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className={styles.topNav} aria-label="Primary">
        <div className={styles.topNavList}>
          <div className={styles.topNavLogoSlot}>YOUR LOGO</div>
          <button
            type="button"
            className={styles.topNavToggle}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="primary-nav-links"
            aria-label="Toggle navigation menu"
          >
            <span className={styles.topNavToggleBar}></span>
            <span className={styles.topNavToggleBar}></span>
            <span className={styles.topNavToggleBar}></span>
          </button>
          <div
            id="primary-nav-links"
            className={`${styles.topNavLinks} ${menuOpen ? styles.topNavLinksOpen : ""}`}
          >
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.topNavLink} ${
                  pathname === item.href || pendingHref === item.href
                    ? styles.topNavActive
                    : ""
                }`}
                onMouseDown={() => setPendingHref(item.href)}
                onTouchStart={() => setPendingHref(item.href)}
                onClick={() => {
                  setPendingHref(item.href);
                  setMenuOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <header className={styles.mangaHeader}>
      </header>
    </>
  );
};
