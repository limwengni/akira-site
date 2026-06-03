import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { getRoleLabel } from "../constants/character";
import styles from "../../app/index.module.css";
import type { Character } from "@/src/types/character";

interface CharacterCardProps {
  char: Character;
  isLoggedIn: boolean;
  onEdit: (char: Character) => void;
  onDelete: (id: number, slug: string, name: string) => void;
}

export const CharacterCard = ({
  char,
  isLoggedIn,
  onEdit,
  onDelete,
}: CharacterCardProps) => {
  const imageUrl = char.image_url || char.icon_url || "/placeholder-bg.png";
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
              className={`${styles.characterCardActionBtn} ${styles.characterCardDeleteBtn}`}
              onClick={() => onDelete(char.id, char.slug, char.name)}
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </div>
        )}

        <Link href={`/characters/${char.slug}`} className={styles.characterCardLink}>
          <Image
            src={`${imageUrl}?width=600&height=800&resize=cover`}
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
