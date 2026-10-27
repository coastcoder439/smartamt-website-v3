/**
 * Texte des Abschnitts „Problem“ (id ortsausgang), wörtlich aus der bisherigen Ortsausgang.tsx übernommen
 * (Owner 26.10.2026: „das Wording war gut …“). Nur das Erscheinungsbild ändert sich.
 */

// Beleg: php.net, Sicherheitsmeldung vom 21.10.2026 („PHP 8.1 and older no longer receive updates from the
// PHP project.“), docs/research/facts-legal-security.md, Frage 1.
const PHP_SATZ =
    'Im Oktober 2026 wurden zwei kritische PHP-Lücken bekannt; Versionen bis 8.1 erhalten vom PHP-Projekt keine Updates mehr.';

/**
 * Die drei einzeiligen Aussagen unter der Überschrift (Website v2, Nachtrag 1, N7; Owner: „viel zu komplex dargestellt,
 * viel zu viel Text“). Höchstens zehn Wörter je Zeile, Verkäufer-Ton, keine neuen Tatsachen: Jede Aussage steht schon in den
 * Texten der drei Karten unten (PROBLEM_THEMEN) und deckt sich mit den Beispielbefunden unter dem Vorher/Nachher
 * (b2/befunde-daten.ts: Google ohne Einwilligung, Bilder ohne Beschreibung, Zoom, Erklärung).
 */
export const PROBLEM_AUSSAGEN = [
    { id: 'technik', kern: 'Veraltete Technik', rest: 'ohne Sicherheitsupdates' },
    { id: 'barriere', kern: 'Barrierefreiheit mit Lücken', rest: 'dabei ist sie Pflicht' },
    { id: 'recht', kern: 'Vermeidbare Rechtsrisiken', rest: 'durch Google ohne Einwilligung' },
] as const;

export const PROBLEM_EINLEITUNG =
    'Viele Gemeinde-Websites sind über Jahre gewachsen. Was dabei liegen bleibt, sieht man selten – riskant ist es trotzdem.';

export type ProblemThema = {
    /** Kennung der Mini-Ansicht (MiniAnsichten.tsx). */
    id: 'technik' | 'barriere' | 'recht';
    /** Kleines Mono-Label oben links in der Karte. */
    bereich: string;
    titel: string;
    text: readonly string[];
};

export const PROBLEM_THEMEN: readonly ProblemThema[] = [
    {
        id: 'technik',
        bereich: 'Technik',
        titel: 'Veraltete Technik',
        text: [
            'Software ohne Sicherheitsupdates ist eines der häufigsten Einfallstore.',
            PHP_SATZ,
            'Wir bringen Ihre Website auf den Stand der Technik und halten sie dort.',
        ],
    },
    {
        id: 'barriere',
        bereich: 'Barrierefreiheit',
        titel: 'Pflicht zur Barrierefreiheit',
        text: [
            'Öffentliche Stellen müssen ihre Websites barrierefrei gestalten und eine Erklärung zur Barrierefreiheit veröffentlichen.',
            'Wir setzen das um – vom Kontrast bis zur Tastaturbedienung.',
        ],
    },
    {
        id: 'recht',
        bereich: 'Recht',
        titel: 'Vermeidbare Rechtsrisiken',
        text: [
            'Cookies ohne Einwilligung, Schriften von fremden Servern, veraltete Pflichtangaben.',
            'Wir räumen das auf, damit Ihre Website keine Angriffsfläche für Abmahnungen bietet.',
        ],
    },
];
