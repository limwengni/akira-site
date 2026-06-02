"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import styles from "./commissions.module.css";

const emoteRates = [
  { category: "1 Emote", international: "$5", local: "RM20" },
  { category: "5 Emotes", international: "$22", local: "RM85" },
];

const chibiRates = [
  { category: "Headshot", international: "$8", local: "RM30" },
  { category: "Half Body", international: "$12", local: "RM45" },
  { category: "Full Body", international: "$16", local: "RM60" },
];

const addOns = [
  {
    category: "Extra Character/Pet",
    price: "+$5 - $10 USD / +RM20 - RM40",
    note:
      "The final price depends on size and complexity (e.g., small pet is cheaper than a full extra character).",
  },
  {
    category: "Complex Props/Items",
    price: "+$3 - $8 USD / +RM10 - RM30",
    note:
      "Examples: detailed weapons, armor, elaborate food, or complex machinery.",
  },
  {
    category: "Background (Detailed Scene)",
    price: "+$15 USD and up / +RM60 and up",
    note: "For custom scenes, rooms, or landscapes. Contact for precise quote.",
  },
  {
    category: "Commercial Use Rights",
    price: "+50% - 100% of total base price",
    note:
      "Required if the art will be used to make money (e.g., merchandise, paid streams, paid advertisements).",
  },
];

function PriceTable({
  rows,
  columns,
}: {
  rows: Array<Record<string, string>>;
  columns: Array<{ key: string; label: string }>;
}) {
  return (
    <div className={styles.commissionTableWrap}>
      <table className={styles.commissionTable}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[columns[0].key]}>
              {columns.map((column) => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CommissionsPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 280);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <main className={styles.commissionRoute}>
        <section className={styles.commissionShell}>
        <div className={styles.commissionHero}>
          <div className={styles.commissionIntro}>
            <p className={styles.commissionEyebrow}>Welcome To My Commissions</p>

            <div className={styles.commissionQuickLinks}>
              <a href="#tos" className={styles.commissionChip}>
                TOS
              </a>
              <a href="#vouches" className={styles.commissionChip}>
                Vouches
              </a>
              <a href="#faq" className={styles.commissionChip}>
                FAQ
              </a>
            </div>

            <p className={styles.commissionAlert}>
              Local rates (MYR) are strictly for TNG/Local Bank transfers only.
              International clients must use USD/PayPal rates.
            </p>
          </div>
        </div>

        <section className={styles.commissionSection}>
          <h2 className={styles.commissionSectionTitle}>
            Emote Packages (Per Character)
          </h2>

          <PriceTable
            rows={emoteRates}
            columns={[
              { key: "category", label: "Category" },
              { key: "international", label: "International (USD)" },
              { key: "local", label: "Local (MYR)" },
            ]}
          />

          <div className={styles.commissionEmoteGallery}>
            <button
              type="button"
              className={`${styles.commissionSampleButton} ${styles.commissionSamplePrimary}`}
              onClick={() =>
                setSelectedImage({
                  src: "https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_a.jpg",
                  alt: "Emote commission sample A",
                })
              }
            >
              <img
                src="https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_a.jpg"
                alt="Emote commission sample A"
                className={`${styles.commissionSampleImage} ${styles.commissionSampleHalf}`}
              />
            </button>
            <button
              type="button"
              className={`${styles.commissionSampleButton} ${styles.commissionSampleSecondary}`}
              onClick={() =>
                setSelectedImage({
                  src: "https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_b.jpg",
                  alt: "Emote commission sample B",
                })
              }
            >
              <img
                src="https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_b.jpg"
                alt="Emote commission sample B"
                className={styles.commissionSampleImage}
              />
            </button>
            <button
              type="button"
              className={`${styles.commissionSampleButton} ${styles.commissionSampleRectangle}`}
              onClick={() =>
                setSelectedImage({
                  src: "https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_c.jpg",
                  alt: "Emote commission sample C",
                })
              }
            >
              <img
                src="https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_c.jpg"
                alt="Emote commission sample C"
                className={styles.commissionSampleImage}
              />
            </button>
          </div>
        </section>

        <section className={styles.commissionSection}>
          <h2 className={styles.commissionSectionTitle}>
            Chibi Drawing (Per Character)
          </h2>

          <PriceTable
            rows={chibiRates}
            columns={[
              { key: "category", label: "Category" },
              { key: "international", label: "International (USD)" },
              { key: "local", label: "Local (MYR)" },
            ]}
          />

          <div
            className={`${styles.commissionEmoteGallery} ${styles.commissionChibiGallery}`}
          >
            <button
              type="button"
              className={styles.commissionSampleButton}
              onClick={() =>
                setSelectedImage({
                  src: "https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_d.png",
                  alt: "Chibi commission sample D",
                })
              }
            >
              <img
                src="https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_d.png"
                alt="Chibi commission sample D"
                className={`${styles.commissionSampleImage} ${styles.commissionChibiSample}`}
              />
            </button>
            <button
              type="button"
              className={styles.commissionSampleButton}
              onClick={() =>
                setSelectedImage({
                  src: "https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_e.jpg",
                  alt: "Chibi commission sample E",
                })
              }
            >
              <img
                src="https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_e.jpg"
                alt="Chibi commission sample E"
                className={`${styles.commissionSampleImage} ${styles.commissionChibiSample}`}
              />
            </button>
            <button
              type="button"
              className={styles.commissionSampleButton}
              onClick={() =>
                setSelectedImage({
                  src: "https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_f.jpg",
                  alt: "Chibi commission sample F",
                })
              }
            >
              <img
                src="https://ebgysbqoofuqyqoypnhi.supabase.co/storage/v1/object/public/page-assets/Commissions/sample_f.jpg"
                alt="Chibi commission sample F"
                className={`${styles.commissionSampleImage} ${styles.commissionChibiSample}`}
              />
            </button>
          </div>
        </section>

        <section className={styles.commissionSection}>
          <h2 className={styles.commissionSectionTitle}>Add Ons</h2>

          <PriceTable
            rows={addOns}
            columns={[
              { key: "category", label: "Category" },
              { key: "price", label: "Price" },
              { key: "note", label: "Note" },
            ]}
          />
        </section>

        <section className={styles.commissionSection}>
          <h2 className={styles.commissionSectionTitle}>Note</h2>

          <ul className={styles.commissionNotes}>
            <li>
              <strong>Consultation:</strong> If your request includes complex
              armor, weaponry, or intricate backgrounds, please consult me via
              DM before placing your order for an accurate quote.
            </li>
            <li>
              <strong>Simplification:</strong> Heavily detailed elements will
              be artistically simplified to fit the chibi style. Key features
              will be kept, but details will be streamlined for clarity and
              aesthetic.
            </li>
          </ul>
        </section>

        <section id="tos" className={styles.commissionSection}>
          <h2 className={styles.commissionSectionTitle}>TOS</h2>

          <div className={styles.commissionPolicyGroup}>
            <h3 className={styles.commissionPolicyTitle}>Payment Policy</h3>
            <ul className={styles.commissionNotes}>
              <li>
                <strong>Full Payment Upfront:</strong> All commissions require
                100% full payment upfront before any work begins (including
                sketching).
              </li>
              <li>
                <strong>Payment Methods:</strong> I currently accept payments
                via <span className={styles.commissionAccent}>PayPal (USD)</span>{" "}
                for international clients and{" "}
                <span className={styles.commissionAccent}>
                  TNG eWallet / Bank Transfer
                </span>{" "}
                for local clients.
              </li>
              <li>
                <strong>Refunds:</strong> Refunds are only available if I have
                not started the sketch yet. <em>No refunds are available once line art or coloring has begun.</em>
              </li>
            </ul>
          </div>

          <div className={styles.commissionPolicyGroup}>
            <h3 className={styles.commissionPolicyTitle}>Revision Policy</h3>
            <ul className={styles.commissionNotes}>
              <li>
                <strong>Sketch Phase:</strong> You are allowed{" "}
                <em>2 rounds of minor revisions</em> during the initial sketch
                phase (e.g., small pose changes, expression tweaks). Major
                changes (e.g., character swap, completely new pose) will incur
                a fee (to be agreed upon before proceeding).
              </li>
              <li>
                <strong>Final Art:</strong> Once line art and coloring are
                complete, <em>only minor color or detail corrections</em> are
                allowed. Changes requiring redrawing of line art will incur a
                fee based on the time required.
              </li>
            </ul>
          </div>

          <div className={styles.commissionPolicyGroup}>
            <h3 className={styles.commissionPolicyTitle}>Turnaround Time</h3>
            <ul className={styles.commissionNotes}>
              <li>
                The estimated turnaround time is <strong>2 to 4 weeks</strong>{" "}
                per commission slot, depending on complexity and my current
                queue.
              </li>
              <li>
                I will notify you if the estimated time changes. Please let me
                know upfront if you have a strict deadline.
              </li>
            </ul>
          </div>

          <div className={styles.commissionPolicyGroup}>
            <h3 className={styles.commissionPolicyTitle}>
              Usage Rights Policy
            </h3>
            <ul className={styles.commissionNotes}>
              <li>
                <strong>Personal Use (Standard Price):</strong> The base price
                covers <strong>Personal Use only</strong>. This means you can
                use the artwork for <strong>non-profit purposes</strong> (e.g.,
                social media icons, profile banners, personal desktop
                wallpaper, use in non-monetized streaming/videos).
              </li>
              <li>
                <strong>Commercial Use (Extra Fee):</strong> If the artwork is
                used to generate income (e.g., merchandise, selling prints, used
                in a monetized stream/video, branding for a business), a{" "}
                <strong>Commercial Fee (50% - 100% of the base price)</strong>{" "}
                must be paid.
              </li>
              <li>
                <strong>Credit (Encouraged):</strong> While not strictly
                mandatory for personal use, I kindly request credit be given
                whenever the artwork is posted online (e.g., in the caption or
                description). Please feel free to ask me for my preferred social
                media links (e.g., Instagram/Youtube handle) when you receive
                the finished piece. Your credit is greatly appreciated for
                exposure ^^!
              </li>
              <li>
                <strong>Artist Rights:</strong> As the artist, I retain all
                copyright to the artwork and reserve the right to use the image
                for my own self-promotion, portfolio, and social media posts.
              </li>
            </ul>
          </div>
        </section>

        <section id="vouches" className={styles.commissionSection}>
          <h2 className={styles.commissionSectionTitle}>Vouches</h2>
          <ul className={styles.commissionNotes}>
            <li>
              &quot;Really good artwork. Seller was very patient and super
              helpful. Will buy again!!!&quot;
            </li>
            <li>
              &quot;Lukisan yang comel dan servis yg pantas. Recommended
              (^-^)☆&quot;
            </li>
            <li>
              &quot;Very cute and cheap, good quality, excellent service by
              seller~&quot;
            </li>
            <li>
              &quot;It was a really fun commissioning you -&gt; all the results
              turned out just like I described. Definitely worth it!!&quot;
            </li>
            <li>
              &quot;Extremely in love with the emotes &amp; badges designed by
              Akira. Speedy response. Would definitely recommend Akira to other
              future customers!&quot;
            </li>
            <li>
              &quot;Akira is amazing! Super quick on work. And eventho when I
              didnt check msgs on shopee, seller still managed to contact me via
              insta. Truly salute u for ur amazing dedication, high quality
              artwork and amazing service! You are amazing! Thank u and all the
              best to ur art and business! Keep it up! 😍&quot;
            </li>
          </ul>
        </section>

        <section id="faq" className={styles.commissionSection}>
          <h2 className={styles.commissionSectionTitle}>FAQ</h2>
          <div className={styles.commissionFaqList}>
            <div className={styles.commissionFaqItem}>
              <p className={styles.commissionFaqQuestion}>
                Q: What payment methods do you accept?
              </p>
              <div className={styles.commissionFaqAnswer}>
                <p>A: Payment is 100% full upfront.</p>
                <p>
                  1. International Clients: I accept{" "}
                  <span className={styles.commissionAccent}>PayPal (USD)</span>.
                </p>
                <p>
                  2. Local Clients: I accept{" "}
                  <span className={styles.commissionAccent}>
                    TNG eWallet / Bank Transfer
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className={styles.commissionFaqItem}>
              <p className={styles.commissionFaqQuestion}>
                Q: How will I receive the final artwork?
              </p>
              <div className={styles.commissionFaqAnswer}>
                <p>
                  A: All Chibi illustrations will be delivered as a single
                  high-resolution PNG file via email or secure link.
                </p>
                <p>
                  <span className={styles.commissionAccentStrong}>
                    Emote commissions
                  </span>{" "}
                  will be delivered as transparent PNGs in the original
                  high-resolution file plus the necessary resized versions for
                  platforms like Twitch and Discord.
                </p>
              </div>
            </div>

            <div className={styles.commissionFaqItem}>
              <p className={styles.commissionFaqQuestion}>
                Q: Do I get to see the sketch before you finish it?
              </p>
              <div className={styles.commissionFaqAnswer}>
                <p>
                  A: Yes! You are allowed 2 rounds of minor revisions during
                  the initial sketch phase.{" "}
                  <span className={styles.commissionWarning}>
                    Major changes after sketch approval will incur a fee.
                  </span>
                </p>
              </div>
            </div>

            <div className={styles.commissionFaqItem}>
              <p className={styles.commissionFaqQuestion}>
                Q: Do you draw NSFW, Furry, or Mecha?
              </p>
              <div className={styles.commissionFaqAnswer}>
                <p>
                  A: I focus on SFW (Safe For Work) content.{" "}
                  <span className={styles.commissionWarning}>
                    I do not accept
                  </span>{" "}
                  commissions for explicit NSFW content or intricate Mecha/robot
                  designs. Simple furry/Kemonomimi designs are usually okay
                  —please consult me first!
                </p>
              </div>
            </div>

            <div className={styles.commissionFaqItem}>
              <p className={styles.commissionFaqQuestion}>
                Q: Do you offer rush orders?
              </p>
              <div className={styles.commissionFaqAnswer}>
                <p>
                  A: Normal turnaround is 2 to 4 weeks, depending on my
                  schedule and queue size.{" "}
                  <span className={styles.commissionWarning}>
                    I do not guarantee rush orders,
                  </span>{" "}
                  but I may accept them{" "}
                  <span className={styles.commissionWarning}>
                    for an additional Rush Fee (50% of total price)
                  </span>{" "}
                  only if my current schedule allows. Please inquire first if
                  you have a strict deadline.
                </p>
              </div>
            </div>

            <div className={styles.commissionFaqItem}>
              <p className={styles.commissionFaqQuestion}>
                Q: Can I use the artwork on my monetized stream/channel?
              </p>
              <div className={styles.commissionFaqAnswer}>
                <p>
                  A: The base price covers Personal Use (non-monetized
                  platforms). If the artwork is used to generate income
                  (including monetized streams), the{" "}
                  <span className={styles.commissionWarning}>
                    Commercial Fee must be paid.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

          <div className={styles.commissionActions}>
            <a
              href="https://discord.com/users/710838990638678057"
              className={styles.commissionActionButton}
            >
              Order Via Discord
            </a>
            <Link href="/card" className={styles.commissionActionButton}>
              Back To Home
            </Link>
          </div>
        </section>
      </main>

      {showBackToTop && (
        <button
          type="button"
          className={styles.commissionBackToTop}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <FontAwesomeIcon icon={faChevronUp} />
        </button>
      )}

      {selectedImage && (
        <button
          type="button"
          className={styles.commissionLightbox}
          onClick={() => setSelectedImage(null)}
          aria-label="Close image preview"
        >
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className={styles.commissionLightboxImage}
          />
        </button>
      )}
    </>
  );
}
