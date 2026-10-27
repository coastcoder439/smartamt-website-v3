/**
 * Kundenlogos der NX7.AGENCY für das Laufband (Abschnitt „Kunden“, Freigabe laut Owner 26.10.2026:
 * „du kannst ALLES übernehmen von nx7 die ganzen kunden“). Reihenfolge und Namen laut
 * website-spec-v3.md, Quelle der Dateien: docs/research/current-sites.md, Kundenlogo-Slider von nx7.agency.
 *
 * `breite` und `hoehe` sind die echten Pixelmaße der Datei (für das Seitenverhältnis), `anzeige` die
 * Darstellungshöhe in px. Die Höhen sind je Logo optisch ausgeglichen: Wortmarken mit viel Leerraum um
 * die Zeichen (Ortrand, HLPB, Erinnerungsort) stehen höher als breite Schriftzüge (NMKR, Exonym); Logos mit
 * Kleinschrift (HLPB, Erinnerungsort) stehen so groß, dass auch die kleine Zeile lesbar bleibt.
 * `deckkraft` stimmt das Gewicht im Band ab: dünne, helle Wortmarken bekommen mehr als die Grundstufe 0,7,
 * damit sie auf Weiß nicht verschwinden (Stadt Ortrand, Starz Elektrotechnik, Landeszentrale, Exonym,
 * Purple); der fette Schriftzug NMKR bekommt weniger, damit er die feinen Wortmarken nicht überstrahlt.
 */
export type KundenLogo = {
    name: string;
    datei: string;
    breite: number;
    hoehe: number;
    anzeige: number;
    deckkraft?: number;
};

/**
 * Ausgeblendet, nicht gelöscht: Owner 26.10.2026: „amt ortsrand muss raus, das gibt es nicht“ (gemeint ist der Eintrag
 * „Amt Ortrand“ im Laufband). Datei public/images/kunden/stadt-ortrand.png bleibt liegen; zum Einblenden diesen Eintrag
 * wieder in KUNDEN_LOGOS aufnehmen.
 */
export const KUNDEN_LOGOS_AUSGEBLENDET: readonly KundenLogo[] = [
    { name: 'Stadt Ortrand', datei: 'stadt-ortrand.png', breite: 895, hoehe: 286, anzeige: 58, deckkraft: 0.92 },
];

export const KUNDEN_LOGOS: readonly KundenLogo[] = [
    { name: 'Hessische Landeszentrale für politische Bildung', datei: 'hlpb.png', breite: 1200, hoehe: 437, anzeige: 74, deckkraft: 0.88 },
    { name: 'Erinnerungsort Fürstenfeldbruck', datei: 'erinnerungsort-ffb.png', breite: 500, hoehe: 159, anzeige: 62, deckkraft: 0.8 },
    { name: 'Loesche', datei: 'loesche.png', breite: 538, hoehe: 140, anzeige: 40, deckkraft: 0.74 },
    { name: 'INC Innovation Center', datei: 'inc.png', breite: 500, hoehe: 260, anzeige: 52 },
    { name: 'NMKR', datei: 'nmkr.png', breite: 509, hoehe: 92, anzeige: 30, deckkraft: 0.6 },
    { name: 'Ruhfus', datei: 'ruhfus.png', breite: 500, hoehe: 127, anzeige: 47 },
    { name: 'Starz Elektrotechnik', datei: 'starz.png', breite: 500, hoehe: 120, anzeige: 50, deckkraft: 0.85 },
    { name: 'HCR Automated', datei: 'hcr.png', breite: 488, hoehe: 233, anzeige: 57, deckkraft: 0.74 },
    { name: 'Exonym', datei: 'exonym.png', breite: 1500, hoehe: 302, anzeige: 42, deckkraft: 0.78 },
    { name: 'Purple', datei: 'purple.svg', breite: 78, hoehe: 25, anzeige: 42, deckkraft: 0.8 },
];

/** Zweite Spur am Handy: gleiche Logos, andere Reihenfolge (ab der Mitte), damit die Reihen nicht parallel wirken. */
export const KUNDEN_LOGOS_SPUR_2: readonly KundenLogo[] = [
    ...KUNDEN_LOGOS.slice(6),
    ...KUNDEN_LOGOS.slice(0, 6),
];
