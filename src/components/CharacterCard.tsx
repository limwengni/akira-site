import Link from "next/link";
import Image from "next/image";
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
          aspect-ratio: 4 / 7;
          border: 3px solid var(--border-dark, #000);
          background: var(--surface);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          overflow: hidden;
        }

        .trap-card-wrapper:hover {
          transform: translateY(-4px); 
          z-index: 50;
        }

        .trap-actions {
          position: absolute;
          top: 10px;
          right: 10px;
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
          transform: scale(1.05);
        }

        .trap-meta {
          position: absolute;
          bottom: -1px;
          left: -1px;
          right: -1px;
          padding: 25px 15px 10px 15px;
          clip-path: polygon(0 25%, 100% 0, 100% 100%, 0% 100%);
          background: var(--border-dark, #000); 
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          pointer-events: none; 
        }

        .trap-name {
          color: var(--surface, #fff);
          font-size: 1.25rem;
          font-weight: 900;
          text-transform: uppercase;
          font-style: italic;
          margin: 0;
          line-height: 1;
          text-shadow: none;
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
          <Image
            src={`${char.image_url}?width=600&height=800&resize=cover`}
            alt={char.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          <div className="trap-meta">
            <h3 className="trap-name">{char.name}</h3>
          </div>
        </Link>
      </div>
    </>
  );
};

export const CharacterCardSkeleton = () => {
  return (
    <>
      <style>{`
        .trap-skeleton-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 7;
          border: 3px solid var(--border-dark, #000);
          background: #e0e0e0; /* Base light grey */
          overflow: hidden;
        }

        /* The badass pulsing animation */
        .trap-skeleton-pulse {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 50%, #e0e0e0 100%);
          background-size: 200% 100%;
          animation: pulse-anim 1.5s infinite linear;
        }

        @keyframes pulse-anim {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .trap-skeleton-meta {
          position: absolute;
          bottom: -1px; left: -1px; right: -1px;
          height: 60px; /* Roughly the height of your name banner */
          clip-path: polygon(0 25%, 100% 0, 100% 100%, 0% 100%);
          background: #333; /* Darker grey to mimic the black banner */
        }
      `}</style>

      <div className="trap-skeleton-wrapper">
        <div className="trap-skeleton-pulse"></div>
        <div className="trap-skeleton-meta"></div>
      </div>
    </>
  );
};