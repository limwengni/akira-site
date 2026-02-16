// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import styles from "../../index.module.css";
// import { MangaPanel } from "@/src/components/MangaPanel";
// import { useCharacters } from "@/src/hooks/useCharacters";
// import { categoryLabels } from "@/src/constants/character";

// export default function CharacterProfile() {
//   const params = useParams();
//   const router = useRouter();
//   const [character, setCharacter] = useState<any>(null);
//   const [notFound, setNotFound] = useState(false);
//   const { charList, loading: charLoading, fetchCharacters } = useCharacters();

//   useEffect(() => {
//     const init = async () => {
//       if (charList.length === 0) {
//         await fetchCharacters();
//       }
//     };
//     init();
//   }, []);

//   useEffect(() => {
//     if (charList.length > 0 && params.slug) {
//       const found = charList.find((c) => c.slug === params.slug);

//       if (found) {
//         setCharacter(found);
//         setNotFound(false);
//       } else {
//         setNotFound(true);
//       }
//     }
//   }, [charList, params.slug]);

//   // Loading State
//   if (charLoading || (charList.length === 0 && !notFound)) {
//     return (
//       <div className={styles.loadingOverlay}>
//         <div className={styles.loaderBox}>
//           <div className={styles.spinner}></div>
//           <p>LOADING CHAPTER...</p>
//         </div>
//       </div>
//     );
//   }

//   // 404 State
//   if (notFound || (!character && !charLoading)) {
//     return (
//       <div className={styles.pagePanel} style={{ textAlign: "center", padding: "50px" }}>
//         <h2 style={{ color: "var(--error-color)" }}>MISSING PAGE</h2>
//         <p>CHARACTER DATA NOT FOUND.</p>
//         <button
//           onClick={() => router.push("/characters")}
//           className={styles.saveBtn}
//           style={{ marginTop: "20px" }}
//         >
//           RETURN TO INDEX
//         </button>
//       </div>
//     );
//   }

//   const roleColor =
//     character.role === 1
//       ? "var(--accent-pro)" // Blue
//       : character.role === 2
//         ? "var(--accent-ant)" // Red
//         : "#333"; // Dark Grey for others

//   return (
//     <section className={styles.mainContent}>
      
//       {/* --- MANGA PAGE CONTAINER --- */}
//       <div
//         style={{
//           maxWidth: "1000px",
//           margin: "0 auto",
//           backgroundColor: "#fff",
//           border: "4px solid #000", // Heavy Manga Border
//           boxShadow: "15px 15px 0px rgba(0,0,0,0.2)", // Hard shadow, not soft
//           position: "relative",
//           minHeight: "800px",
//           overflow: "hidden"
//         }}
//       >
        
//         {/* --- SCREENTONE BACKGROUND EFFECT --- */}
//         <div style={{
//             position: "absolute",
//             top: 0, 
//             left: 0, 
//             width: "100%", 
//             height: "100%", 
//             zIndex: 0,
//             opacity: 0.1,
//             // This creates the "Manga Dots" using CSS only
//             backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
//             backgroundSize: "8px 8px"
//         }}></div>

//         {/* --- HEADER: CHAPTER TITLE --- */}
//         <div style={{
//             borderBottom: "3px solid #000",
//             padding: "15px 30px",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             background: "#fff",
//             position: "relative",
//             zIndex: 10
//         }}>
//             <button
//               onClick={() => router.push("/characters")}
//               style={{
//                 background: "#000",
//                 color: "#fff",
//                 border: "none",
//                 padding: "8px 16px",
//                 fontFamily: "monospace",
//                 fontWeight: "bold",
//                 cursor: "pointer",
//                 fontSize: "0.9rem",
//                 textTransform: "uppercase",
//               }}
//             >
//               ← Index
//             </button>
            
//             <div style={{ fontFamily: "monospace", fontWeight: "bold", letterSpacing: "2px" }}>
//                CHAPTER #{character.id.toString().padStart(3, "0")}
//             </div>
            
//             <div style={{ fontSize: "0.8rem", fontFamily: "monospace", border: "1px solid #000", padding: "2px 6px" }}>
//                PAGE 01
//             </div>
//         </div>


//         {/* --- CONTENT SPREAD --- */}
//         <div style={{ 
//             display: "grid", 
//             gridTemplateColumns: "1fr 1.2fr", // Image Left, Text Right
//             height: "100%",
//             position: "relative",
//             zIndex: 10
//         }}>

//             {/* ====== LEFT PANEL: CHARACTER ART ====== */}
//             <div style={{ 
//                 borderRight: "3px solid #000", 
//                 padding: "0", 
//                 position: "relative",
//                 backgroundColor: "#fff",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 overflow: "hidden"
//             }}>
//                 {/* Background Speedlines (Optional CSS Gradient) */}
//                 <div style={{
//                     position: "absolute",
//                     top: 0, left: 0, width: "100%", height: "100%",
//                     background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)",
//                     zIndex: 0
//                 }}></div>

//                 {/* THE CHARACTER IMAGE */}
//                 <div style={{ 
//                     width: "100%", 
//                     height: "100%", 
//                     backgroundImage: `url(${character.image_url || "/placeholder.png"})`,
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                     filter: "grayscale(100%) contrast(120%)", // Force Black & White Manga Look
//                     zIndex: 1
//                 }}></div>

//                 {/* VERTICAL NAME (Japanese Manga Style) */}
//                 <div style={{
//                     position: "absolute",
//                     top: "30px",
//                     right: "20px",
//                     writingMode: "vertical-rl", // Makes text vertical
//                     textOrientation: "upright",
//                     backgroundColor: "#fff",
//                     border: "3px solid #000",
//                     padding: "20px 10px",
//                     fontSize: "2rem",
//                     fontWeight: "900",
//                     color: "#000",
//                     boxShadow: "-8px 8px 0px rgba(0,0,0,0.2)",
//                     zIndex: 5,
//                     letterSpacing: "5px"
//                 }}>
//                     {character.name.toUpperCase()}
//                 </div>

//                 {/* ROLE TAG (Floating) */}
//                 <div style={{
//                     position: "absolute",
//                     bottom: "30px",
//                     left: "30px",
//                     background: roleColor, // Keep the one pop of color? Or make it black?
//                     color: "#fff",
//                     padding: "5px 15px",
//                     border: "2px solid #000",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                     fontSize: "0.9rem",
//                     zIndex: 5,
//                     boxShadow: "4px 4px 0 #000"
//                 }}>
//                     {categoryLabels[character.role] || "UNKNOWN"}
//                 </div>
//             </div>


//             {/* ====== RIGHT PANEL: DATA & LORE ====== */}
//             <div style={{ padding: "40px", backgroundColor: "#fff" }}>
                
//                 {/* STATS PANEL */}
//                 <div style={{ marginBottom: "30px" }}>
//                     <div style={{ 
//                         background: "#000", 
//                         color: "#fff", 
//                         display: "inline-block", 
//                         padding: "5px 15px", 
//                         fontWeight: "bold",
//                         marginBottom: "-3px", // Connects to the border below
//                         position: "relative",
//                         zIndex: 2
//                     }}>
//                         DATA LOG
//                     </div>
//                     <div style={{ border: "3px solid #000", padding: "20px" }}>
//                         <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: "1rem" }}>
//                              <tbody>
//                                 <tr style={{ borderBottom: "2px dashed #000" }}>
//                                     <td style={{ padding: "10px 0", fontWeight: "bold" }}>AGE</td>
//                                     <td style={{ padding: "10px 0", textAlign: "right" }}>{character.age || "??"}</td>
//                                 </tr>
//                                 <tr style={{ borderBottom: "2px dashed #000" }}>
//                                     <td style={{ padding: "10px 0", fontWeight: "bold" }}>GENDER</td>
//                                     <td style={{ padding: "10px 0", textAlign: "right" }}>{character.gender || "??"}</td>
//                                 </tr>
//                                 <tr>
//                                     <td style={{ padding: "10px 0", fontWeight: "bold" }}>ORIGIN</td>
//                                     <td style={{ padding: "10px 0", textAlign: "right" }}>SECTOR 04</td>
//                                 </tr>
//                              </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* DESCRIPTION PANEL */}
//                 <MangaPanel title="CHARACTER PROFILE" dark={false}>
//                     <div style={{ 
//                         padding: "10px", 
//                         lineHeight: "1.8", 
//                         fontSize: "0.95rem",
//                         fontFamily: "'Courier New', monospace",
//                         textAlign: "justify"
//                     }}>
//                         <p>
//                             {character.description || "No data available."}
//                         </p>
//                     </div>
//                 </MangaPanel>

//                 {/* DIALOGUE BUBBLE (Visual Decoration) */}
//                 <div style={{ 
//                     marginTop: "40px", 
//                     border: "3px solid #000", 
//                     borderRadius: "50%", 
//                     padding: "30px", 
//                     textAlign: "center",
//                     position: "relative",
//                     background: "#fff",
//                     width: "80%",
//                     marginLeft: "auto",
//                     marginRight: "auto"
//                 }}>
//                     <div style={{ fontStyle: "italic", fontWeight: "bold" }}>
//                         "System Initialized. Viewing records for subject {character.name}."
//                     </div>
//                     {/* The bubble tail */}
//                     <div style={{
//                         position: "absolute",
//                         bottom: "-15px",
//                         left: "20px",
//                         width: "30px",
//                         height: "30px",
//                         background: "#fff",
//                         borderBottom: "3px solid #000",
//                         borderRight: "3px solid #000",
//                         transform: "rotate(45deg)"
//                     }}></div>
//                 </div>

//             </div>
//         </div>

//         {/* --- BOTTOM BAR --- */}
//         <div style={{ 
//             borderTop: "3px solid #000", 
//             padding: "10px 30px", 
//             textAlign: "right",
//             fontFamily: "monospace",
//             fontSize: "0.8rem",
//             background: "#eee"
//         }}>
//              © AKIRA ARCHIVES 2026 // END OF FILE
//         </div>

//       </div>
//     </section>
//   );
// }