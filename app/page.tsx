import styles from "./index.module.css";

export default function Home() {
  return (
    <section className={styles.mainContent}>
      <div className={`${styles.pagePanel} ${styles.homePagePanel}`}>
        <div className={styles.homeShowcaseGrid}>
          <div className={styles.homeIntroCard}>
            <span className={styles.homeIntroEyebrow}>Personal Archive</span>
            <p className={styles.homeIntroText}>
              You have stumbled into the personal archive. This is where I keep
              the blueprints for my characters and the fragments of the world
              they live in. The <strong>World Lore</strong> section is
              currently sealed (I&apos;m still writing it, sorry!). For now,
              feel free to browse the <strong>Character Archives</strong> via
              the tabs above.
            </p>
            <div className={styles.homeIntroMeta}>
              <span className={styles.homeIntroPill}>Character Archives: Open</span>
              <span className={styles.homeIntroPillMuted}>World Lore: Sealed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
