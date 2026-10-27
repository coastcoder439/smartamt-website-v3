// Eine Quelle für Adresse, Absender und Kontaktdaten der Seite.

import { abschnittSichtbar } from '@/lib/abschnitte';

// Kanonische Adresse. Die Seite ist ein statischer Export und kennt ihre Adresse nicht von
// selbst; NEXT_PUBLIC_SITE_URL überschreibt sie (zum Beispiel für eine Vorschau-Domain).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.smartamt.de';

export const SITE_NAME = 'SmartAmt';

export const SITE_TITLE = 'SmartAmt – Sichere Websites für Gemeinden';

export const SITE_DESCRIPTION =
    'SmartAmt baut Websites für Gemeinden, Ämter und Behörden: sicher, barrierefrei und rechtskonform. Kostenlose Vorschau mit Ihren Inhalten, etwa zwei Wochen bis live, fester Jahresbetrag. Ein Projekt der NX7.AGENCY aus Leipzig.';

export const ABSENDER = {
    name: 'NX7.AGENCY',
    url: 'https://www.nx7.agency',
    zeile: 'Ein Projekt der NX7.AGENCY',
} as const;

/** Anschrift und Kontakt des Unternehmens (Impressum, Datenschutz, Formular-Adresse, strukturierte Daten). */
export const KONTAKT = {
    telefon: '0341 97853441',
    telefonHref: 'tel:+4934197853441',
    telefonInternational: '+49 341 97853441',
    email: 'mail@smartamt.de',
    strasse: 'Nikolaistraße 28–32',
    plz: '04109',
    ort: 'Leipzig',
} as const;

/**
 * Leon Pösken: erster Ansprechpartner auf der Seite (Hero, Kopfzeile, Fragen, Kontakt, Fuß).
 * Owner 26.10.2026: „Meine Firmennummer steht auch auf der neuen Smartamt-Seite und die E-Mail auch.“
 */
export const LEON = {
    name: 'Leon Pösken',
    telefon: '01556 6579408',
    telefonHref: 'tel:+4915566579408',
    telefonInternational: '+49 1556 6579408',
    email: 'leon@smartamt.de',
} as const;

/** Tobias Steffen: Technik, Angebot, Vertrag. Die Nummer ist die Nummer des Unternehmens (KONTAKT). */
export const TOBIAS = {
    name: 'Tobias Steffen',
    telefon: KONTAKT.telefon,
    telefonHref: KONTAKT.telefonHref,
} as const;

/** Ein Menüpunkt: ein Abschnitt der Startseite (Anker `id`) oder eine eigene Seite (`href`). */
export type MenuePunkt = { label: string; id: string; href?: string };

/**
 * Alle Menüpunkte in Reihenfolge. Anker (ohne `href`) erscheinen nur, wenn ihr Abschnitt in lib/abschnitte.ts an ist;
 * Seiten (mit `href`) stehen immer da. Website v3: Angebot · Ablauf · Kontakt · Über uns · Fragen (Plan 03-website-v3,
 * Punkt 4). Die Anker „Websites“ und „Referenzen“ stehen in v3 nicht im Menü (die Abschnitte bleiben auf der Startseite).
 */
const MENUE_ALLE: readonly MenuePunkt[] = [
    { label: 'Angebot', id: 'angebot' },
    { label: 'Ablauf', id: 'ablauf' },
    { label: 'Schulungen', id: 'schulungen' },
    { label: 'Recht & Sicherheit', id: 'recht' },
    { label: 'Kontakt', id: 'kontakt' },
    { label: 'Über uns', id: 'seite-ueber-uns', href: '/ueber-uns/' },
    { label: 'Fragen', id: 'seite-fragen', href: '/fragen/' },
];

/** Hauptmenü v3: Angebot · Ablauf · Kontakt · Über uns · Fragen. */
export const MENUE: readonly MenuePunkt[] = MENUE_ALLE.filter((m) => m.href !== undefined || abschnittSichtbar(m.id));

/** Unterseiten der Website v3 (Fuß; im Menü stehen sie über MENUE). */
export const UNTERSEITEN = [
    { label: 'Über uns', href: '/ueber-uns/' },
    { label: 'Häufige Fragen', href: '/fragen/' },
] as const;

export const RECHTSSEITEN = [
    { label: 'Impressum', href: '/impressum/' },
    { label: 'Datenschutz', href: '/datenschutz/' },
    { label: 'Barrierefreiheit', href: '/barrierefreiheit/' },
] as const;
