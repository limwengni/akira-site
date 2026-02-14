import styles from "../../app/index.module.css";

export const MangaPanel = ({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) => (
  <section
    className={`${styles.mangaPanel} ${dark ? styles.panelDark : styles.panelLight}`}
  >
    <div
      className={`${styles.panelHeader} ${dark ? styles.headerDark : styles.headerLight}`}
    >
      {title}
    </div>
    <div className={styles.panelContent}>{children}</div>
  </section>
);
