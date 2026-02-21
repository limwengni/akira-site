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
          width: 100%;
          aspect-ratio: 2 / 3;
          transform: skewX(-8deg); 
          border: 4px solid var(--border-dark, #111);
          overflow: hidden;
          background: var(--surface);
          transition: transform 0.2s ease;
          cursor: pointer;
        }

        .trap-card-wrapper:hover {
          transform: skewX(-8deg) translate(-4px, -4px); 
        }

        .trap-actions {
          position: absolute;
          top: 10px;
          right: 15px;
          z-index: 20;
          display: flex;
          gap: 6px;
          transform: skewX(8deg); 
        }

        .trap-btn {
          background: var(--surface, #fff);
          border: 2px solid var(--border-dark, #111);
          color: var(--border-dark, #111);
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .trap-btn:hover { background: #eee; }

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
          object-position: top center; 
          transform-origin: center;
          
          transform: skewX(8deg) scale(1.25); 
          transition: transform 0.5s ease, filter 0.3s ease;
        }

        .trap-card-wrapper:hover .trap-link img {
          transform: skewX(8deg) scale(1.30); 
        }

        .trap-meta {
          position: absolute;
          bottom: 0;
          left: 0;
          transform: skewX(8deg); 
          width: 110%;
          margin-left: -5%;
          /* Reduced top padding so the gradient doesn't go up so high */
          padding: 30px 20px 12px 20px; 
          /* SOFTER GRADIENT: Starts at 70% black and fades out quickly */
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 80%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          pointer-events: none; 
        }

        .trap-name {
          color: #fff;
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
          text-shadow: 1px 1px 0px #000;
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
