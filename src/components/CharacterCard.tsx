import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getRoleLabel } from "../constants/character";

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
    <>
      <style>{`
        .trap-card-wrapper {
          position: relative;
          width: 125%;
          margin-left: -12.5%;
          aspect-ratio: 4 / 7;
          /* Magic cut: Top-Left to Top-Right to Bottom-Right to Bottom-Left */
          clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
          background: var(--surface);
          transition: transform 0.2s ease;
          cursor: pointer;
        }

        .trap-card-wrapper:hover {
          transform: translateY(-8px); 
          z-index: 50;
        }

        .trap-actions {
          position: absolute;
          top: 10px;
          right: 15px;
          z-index: 20;
          display: flex;
          gap: 6px;
        }

        .trap-btn {
          background: var(--surface);
          border: 2px solid var(--border-dark);
          color: var(--border-dark);
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        
        .trap-btn:hover { 
          background: var(--border-dark); 
          color: var(--surface);
        }

        .trap-link {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
        }

        .trap-link img {
          width: 100%; 
          height: 100%;
          object-fit: cover;
          object-position: center; 
          transition: transform 0.5s ease;
        }

        .trap-card-wrapper:hover .trap-link img {
          transform: scale(1.1);
        }

        .trap-meta {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 40px 25% 15px 5%;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none; 
        }

        .trap-name {
          color: var(--surface);
          font-size: 1.25rem;
          font-weight: 900;
          text-transform: uppercase;
          font-style: italic;
          margin: 0 0 2px 0;
          line-height: 1;
        }

        .trap-role {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          text-shadow: 1px 1px 0px var(--text);
        }

        .trap-role-pro { color: var(--info-color, #2563eb); }
        .trap-role-ant { color: var(--error-color, #d00); }
        .trap-role-default { color: #cccccc; }
      `}</style>

      <div className="trap-card-wrapper">
        {isLoggedIn && (
          <div className="trap-actions">
            <button
              className="trap-btn"
              onClick={() => onEdit(char)}
              title="Edit"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="trap-btn"
              onClick={() => onDelete(char.id, char.slug)}
              title="Delete"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        )}

        <Link href={`/characters/${char.slug}`} className="trap-link">
          <img
            src={`${char.image_url}?width=600&height=800&resize=cover`}
            alt={char.name}
            loading="lazy"
          />

          <div className="trap-meta">
            <h3 className="trap-name">{char.name}</h3>
          </div>
        </Link>
      </div>
    </>
  );
};
