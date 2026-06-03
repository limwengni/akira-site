"use client";

import { useState, useEffect } from "react";
import styles from "../index.module.css";
import { useAuth } from "@/src/hooks/useAuth";
import { useCharacters } from "@/src/hooks/useCharacters";
import type { Character } from "@/src/types/character";

export default function VotingPage() {
  const { checkAuthStatus } = useAuth();
  const { charList, fetchCharacters } = useCharacters();
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const load = async () => {
      await fetchCharacters();
      await checkAuthStatus();
    };
    load();
  }, []);

  useEffect(() => {
    const mockVotes: Record<string, number> = {};
    charList.forEach((char) => {
      mockVotes[char.slug] = Math.floor(Math.random() * 8000000) + 1000000;
    });
    setVotes(mockVotes);
  }, [charList]);

  const handleVote = async (slug: string) => {
    setIsVoting(true);
    setVotes((prev) => ({ ...prev, [slug]: prev[slug] + 1 }));
    setTimeout(() => setIsVoting(false), 400);
  };

  const sortedChars = [...charList].sort(
    (a, b) => (votes[b.slug] || 0) - (votes[a.slug] || 0),
  );

  const getVotingImageUrl = (character: Character) =>
    character.icon_url || character.image_url || "/placeholder-icon.png";

  return (
    <>
      <style>{`
        .poll-wrapper {
          padding: 60px 10px;
          display: flex;
          flex-direction: column;
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .vote-row {
          position: relative;
          display: flex;
          align-items: center;
          height: 100px; 
          gap: 10px;
          overflow: visible; 
          z-index: 5;
        }

        /* --- GOLD TIER (Rank 1-3) --- */
        .portrait-wing {
          position: relative;
          width: 160px;
          height: 100%;
          flex-shrink: 0;
          overflow: visible;
        }

        .clipped-base {
          position: absolute;
          inset: 0;
          background: #1a1a1a;
          clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%);
          z-index: 1;
          overflow: hidden;
        }

        /* The actual shape background */
        .portrait-bg {
          position: absolute;
          inset: 0;
          background: #1a1a1a;
          clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%);
          z-index: 1;
        }

        .data-wing-gold {
          position: relative;
          flex-grow: 1;
          height: 100%;
          background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 100%);
          clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%);
          z-index: 1;
          display: flex;
          align-items: center;
          padding-left: 30px;
          padding-right: 25px;
        }

        /* --- NORMAL TIER (Rank 4+) --- */
        .normal-box {
          position: relative;
          width: 100%;
          height: 100%;
          background: #111;
          display: flex;
          align-items: center;
          padding-left: 110px;
          padding-right: 25px;
        }

        /* --- POP OUT LOGIC --- */
          /* --- TRAPPED INSIDE THE TRAPEZIUM --- */
          .char-pop-out {
            position: absolute;
            inset: 0; /* Locks it to the exact bounds of .portrait-wing */
            width: 100%;
            height: 100%; /* Back to 100px tall so it doesn't escape */
            z-index: 10;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            pointer-events: none;
            
            /* The exact same trapezium shape as your .portrait-bg */
            clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%);
          }

        .char-img {
          width: 100%;
          height: 100%; 
          object-fit: cover; /* 'cover' ensures the image fills the shape without stretching */
          /* I removed the mask-image gradient here so you get a clean cut at the bottom, 
            but you can add it back if you still want the fade out! */
        }

        .normal-char-box {
          position: absolute;
          left: 10px;
          bottom: 0;
          width: 90px;
          height: 100px;
          z-index: 10;
          display: flex;
          align-items: flex-end;
        }

        /* TEXT STYLING */
        .rank-num {
          font-size: 3rem;
          font-weight: 900;
          font-style: italic;
          color: #fff;
          margin-right: 15px;
          line-height: 1;
        }
        .tier-gold .rank-num { color: #c49b4a; }

        .char-info { display: flex; flex-direction: column; }
        .char-name { font-size: 1.6rem; font-weight: 800; color: #fff; text-transform: uppercase; }

        .vote-stats { font-family: monospace; color: #888; font-size: 0.85rem; margin-top: 4px; }
        .vote-stats b { color: #c49b4a; }

        .support-btn {
          margin-left: auto;
          background: #c49b4a;
          color: #000;
          border: none;
          padding: 10px 25px;
          font-weight: 900;
          clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%);
          cursor: pointer;
        }
        .tier-normal .support-btn { background: #333; color: #fff; }
      `}</style>

      <section className={styles.mainContent}>
        <div className={styles.pagePanel}>
          <div className={styles.diagonalOverlay}></div>
          <div className="poll-wrapper">
            {sortedChars.map((char, index) => {
              const rank = index + 1;
              const isGold = rank <= 3;
              const voteCount = votes[char.slug] || 0;

              return (
                <div key={char.id} className={`vote-row ${isGold ? "tier-gold" : "tier-normal"}`}>
                  {isGold ? (
                    <>
                      <div className="portrait-wing">
                        <div className="portrait-bg" />
                        <div className="char-pop-out">
                          <img src={getVotingImageUrl(char)} className="char-img" alt={char.name} />
                        </div>
                      </div>
                      <div className="data-wing-gold">
                        <div className="rank-num">{rank}</div>
                        <div className="char-info">
                          <span className="char-name">{char.name}</span>
                          <div className="vote-stats">TRUST VALUE // <b>{voteCount.toLocaleString()}</b></div>
                        </div>
                        <button className="support-btn" onClick={() => handleVote(char.slug)} disabled={isVoting}>
                          {isVoting ? "..." : "SUPPORT ≫"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="normal-box">
                      <div className="normal-char-box">
                        <img src={getVotingImageUrl(char)} style={{ width: "100%", height: "auto" }} alt={char.name} />
                      </div>
                      <div className="rank-num" style={{ fontSize: '2.5rem' }}>{rank}</div>
                      <div className="char-info">
                        <span className="char-name" style={{ fontSize: '1.3rem' }}>{char.name}</span>
                        <div className="vote-stats">TRUST VALUE // <b>{voteCount.toLocaleString()}</b></div>
                      </div>
                      <button className="support-btn" onClick={() => handleVote(char.slug)} disabled={isVoting}>
                        {isVoting ? "..." : "SUPPORT ≫"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
