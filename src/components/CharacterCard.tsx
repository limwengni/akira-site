import Link from "next/link";
import Image from "next/image";
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
  const roleLabel = getRoleLabel(char.role);
  const roleClassName =
    roleLabel === "Protagonist"
      ? styles.characterCardRolePro
      : roleLabel === "Antagonist"
        ? styles.characterCardRoleAnt
        : styles.characterCardRoleDefault;

  return (
      <article className={styles.characterCard}>
        {isLoggedIn && (
          <div className={styles.characterCardActions}>
            <button
              className={styles.characterCardActionBtn}
              onClick={() => onEdit(char)}
              title="Edit"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className={styles.characterCardActionBtn}
              onClick={() => onDelete(char.id, char.slug)}
              title="Delete"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        )}

        <Link href={`/characters/${char.slug}`} className={styles.characterCardLink}>
          <Image
            src={`${char.image_url}?width=600&height=800&resize=cover`}
            alt={char.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.characterCardImage}
          />

          <div className={styles.characterCardMeta}>
            <span className={`${styles.characterCardRole} ${roleClassName}`}>
              {roleLabel}
            </span>
            <h3 className={styles.characterCardName}>{char.name}</h3>
          </div>
        </Link>
      </article>
  );
};

export const CharacterCardSkeleton = () => {
  return (
    <div className={styles.characterCardSkeleton}>
      <div className={styles.characterCardSkeletonPulse}></div>
      <div className={styles.characterCardSkeletonMeta}>
        <div className={styles.characterCardSkeletonTag}></div>
        <div className={styles.characterCardSkeletonName}></div>
      </div>
    </div>
  );
};
