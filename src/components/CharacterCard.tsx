import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getRoleLabel } from "../constants/character";
import styles from "../../app/index.module.css";

interface CharacterCardProps {
  char: any;
  isLoggedIn: boolean;
  onEdit: (char: any) => void;
  onDelete: (id: number, slug: string) => void;
}

export const CharacterCard = ({
  char,
  isLoggedIn,
  onEdit,
  onDelete,
}: CharacterCardProps) => {
  return (
    <div className={styles.teyanCard}>
      {/* EDIT ICON - Only visible when logged in */}
      {isLoggedIn && (
        <div className={styles.actionStack}>
          <button
            className={styles.editBtn}
            onClick={() => onEdit(char)}
            title="Edit Character"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(char.id, char.slug)}
            title="Delete Character"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      <div className={styles.imgWrapContainer}>
        <Link href={`/profile/${char.slug}`} className={styles.imgWrap}>
          <img
            src={`${char.image_url}?width=600&height=900&resize=cover`}
            alt={char.name}
            loading="lazy"
            className={styles.charImage}
          />
        </Link>
        <div className={styles.avatarBox}>
          <img src={char.icon_url || char.image_url || null} alt="icon" />
        </div>
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.metaHeader}>
          <div className={styles.nameBox}>
            <h3 className={styles.charName}>{char.name}</h3>
            <span
              className={
                char.role === 1
                  ? styles.charRolePro
                  : char.role === 2
                    ? styles.charRoleAnt
                    : styles.charRole
              }
              data-role={char.role}
            >
              {getRoleLabel(char.role)}
            </span>
          </div>
        </div>
        <div className={styles.charQuote}>{char.quote}</div>
      </div>
    </div>
  );
};
