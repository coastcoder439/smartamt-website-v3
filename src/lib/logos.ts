/**
 * Logo-Wahl: die Logos zur Auswahl und ihre Varianten (Werkzeug wie die Farbwahl, keine Funktion für Besucher).
 *
 * Owner 27.10.2026: „Ich will jetzt auch, dass man das Logo auswählen kann“; „es soll nicht gleich alle Logos angezeigt
 * werden. Es soll somit hier Logo und dann Varianten“. Darum zwei Stufen: erst das Logo, dann seine Variante; die erste
 * Variante ist die Hauptvariante und wird beim Wechsel des Logos gewählt.
 *
 * Eine Liste für alles: Farbwahl.tsx (Bedienung), Logo.tsx (Anzeige), LogoSprite.tsx (Symbole und Sichtbarkeit) und das
 * Skript im Kopf von layout.tsx (?logo=…) lesen sie. Die Zeichen selbst übernimmt scripts/erzeuge-logo-zeichen.mjs aus
 * docs/brand/logo-entwuerfe/ nach components/ui/logo-zeichen.ts (Schlüssel = Varianten-ID).
 */
export type LogoVariante = { id: string; name: string };
export type LogoKlasse = { id: string; name: string; hinweis: string; varianten: ReadonlyArray<LogoVariante> };

/** Die bisherige Wortmarke mit Signalpunkt (ohne Zeichen); bleibt wählbar. */
export const LOGO_HEUTE = 'heute';

/**
 * Ohne Wahl gilt die WLAN-Birne in Schwarz-Rot-Gold (R7-W2). Owner 27.10.2026: „Mal bitte standardmäßig ein anderes Logo
 * als diesen Punkt. Das sieht super langweilig aus.“; Hauptvariante: „Und als Hauptvariante möchte ich … Einmal L7 W2.“
 */
export const LOGO_STANDARD = 'wlan-srg';

export const LOGO_KLASSEN: ReadonlyArray<LogoKlasse> = [
    {
        id: 'wlan',
        name: 'WLAN-Birne',
        hinweis: 'Das Amt sendet',
        varianten: [
            { id: 'wlan-srg', name: 'Schwarz-Rot-Gold' },
            { id: 'wlan', name: 'Einfarbig' },
            { id: 'wlan-kraeftig', name: 'Kräftige Wellen' },
        ],
    },
    {
        id: 'funk',
        name: 'Funk-Birne',
        hinweis: 'Die Idee sendet aus dem Glas',
        varianten: [
            { id: 'funk-srg', name: 'Schwarz-Rot-Gold' },
            { id: 'funk-zwei', name: 'Zwei Wellen' },
            { id: 'funk', name: 'Einfarbig' },
        ],
    },
    {
        id: 'stempel',
        name: 'Stempel-Birne',
        hinweis: 'Amtsstempel mit Birnen-Griff',
        varianten: [
            { id: 'stempel-striche', name: 'Drei Striche' },
            { id: 'stempel-saeulen', name: 'Farbige Säulen' },
            { id: 'stempel-schichten', name: 'Geschichtet' },
            { id: 'stempel', name: 'Einfarbig' },
        ],
    },
    { id: 'saeulen', name: 'Säulen-Birne', hinweis: 'Säulen bilden die Birne', varianten: [{ id: 'saeulen', name: 'Schwarz-Rot-Gold' }] },
    {
        id: 'klammer',
        name: 'Büroklammer-Amt',
        hinweis: 'Das Amt hält die Akten zusammen',
        varianten: [
            { id: 'klammer', name: 'Einfarbig' },
            { id: 'klammer-srg', name: 'Schwarz-Rot-Gold' },
        ],
    },
    { id: 'heute', name: 'Wortmarke', hinweis: 'Signalpunkt und Wortmarke, ohne Zeichen', varianten: [{ id: LOGO_HEUTE, name: 'Wortmarke' }] },
];

/** Alle Varianten mit Zeichen (ohne die Wortmarke mit Signalpunkt). */
export const LOGO_ZEICHEN_IDS: ReadonlyArray<string> = LOGO_KLASSEN.flatMap((k) => k.varianten.map((v) => v.id)).filter(
    (id) => id !== LOGO_HEUTE,
);

/** Alle gültigen Werte für ?logo=… und data-logo. */
export const LOGO_IDS: ReadonlyArray<string> = [...LOGO_ZEICHEN_IDS, LOGO_HEUTE];

export function klasseVon(variante: string): LogoKlasse {
    return LOGO_KLASSEN.find((k) => k.varianten.some((v) => v.id === variante)) ?? klasseVon(LOGO_STANDARD);
}
