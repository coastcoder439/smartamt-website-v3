/**
 * Gemeinsame Klassen der vier Abschnitte Leistungen, Websites, Ablauf und Lage.
 *
 * Anker: Ein Sprung zu einem Abschnitt (Navigation, Knöpfe) setzt dessen Oberkante 8 px unter die feste
 * Kopfzeile (lib/scroll.ts rechnet Kopfzeile + 8 px; die CSS-Regel [id] ebenso). In diesen 8 px sah man bisher
 * einen Streifen des Vorgängers (hellgrau auf Weiß, wie eine Haarlinie). Darum malt jeder Abschnitt über seine
 * eigene Oberkante hinaus 8 px in seiner eigenen Fläche (before, -top-2): Der Streifen gehört dann zum Abschnitt,
 * nie zum Nachbarn. `isolate` hält die negativen Z-Ebenen der Lichtfelder innerhalb des Abschnitts;
 * `scroll-mt` auf genau die Höhe der Kopfzeile gilt für den nativen Sprung (Adresse mit #anker).
 *
 * Abstand: oben 64 bis 104 px, unten 72 bis 120 px (Raster-Vorgabe .section: 80 bis 144 px). Die Überschrift
 * soll am Desktop nicht in 150 px Leerraum stehen; zwischen zwei Abschnitten bleiben trotzdem rund 200 px
 * Weißraum.
 */
const ANKER =
    "relative isolate scroll-mt-[var(--header-h)] before:pointer-events-none before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']";

/** Abschnitt auf weißem Grund. */
// v3 (Owner 27.10.2026: „Da sind noch so viele leere Flächen“): kleinere Abstände; v2: pt clamp(4rem,7vw,6.5rem), pb clamp(4.5rem,8vw,7.5rem).
export const ABSCHNITT_WEISS = `${ANKER} before:bg-white pt-[clamp(3rem,5vw,4.5rem)] pb-[clamp(3.5rem,5.5vw,5rem)]`;

/** Abschnitt auf der ruhigen Fläche (surface-soft). */
// v3: v2 hatte pt clamp(4.5rem,7.5vw,7rem).
export const ABSCHNITT_SOFT = `${ANKER} before:bg-bg-2 pt-[clamp(3.5rem,5.5vw,5rem)] pb-24 lg:pb-14`;

/** Label (Eyebrow) in 13 statt 12 px: auf Weiß und am Handy sicher lesbar (Farbe bleibt brand-ink, 5,2:1). */
export const LABEL_GROSS = 'text-[0.8125rem]';
