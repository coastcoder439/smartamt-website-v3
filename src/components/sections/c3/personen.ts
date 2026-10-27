// Die Menschen hinter SmartAmt: eine Quelle für Team (Über uns) und die wechselnde Karte im Kontakt.
// Fotos: public/images/team/ (schwarz-weiß, gleicher Bildschnitt und gleiches Hintergrundlicht).
//
// Website v2 (docs/packages/02-website-v2/design/bauauftrag-v2.md, Entscheidung 8): Tobias Steffen und Leon Pösken.
// Owner 26.10.2026: „Eremia Rifat nimmst du raus und packst mich dafür rein. Vielleicht auch mit so einem
// Schwarz-Weiß-Filter dann.“ Eremiya Rifat bleibt in `ALLE_PERSONEN` erhalten und erscheint wieder, sobald
// `EINZELNES.teamEremiyaRifat` in lib/abschnitte.ts auf `true` steht (ausgeblendet, nicht gelöscht).

import { EINZELNES } from '@/lib/abschnitte';
import { KONTAKT, LEON } from '@/lib/site';

export type Person = {
    name: string;
    rolle: string;
    satz: string;
    foto: string;
    breite: number;
    hoehe: number;
    alt: string;
    telefon?: string;
    telefonHref?: string;
    email?: string;
    /** Eigene Website der Person (öffnet in neuem Tab). */
    link?: { href: string; label: string };
};

const TOBIAS_STEFFEN: Person = {
    name: 'Tobias Steffen',
    rolle: 'Gründer von SmartAmt',
    satz: 'Entwickler aus Leipzig. Löst, woran andere scheitern: seit Jahren für Mittelstand und Verwaltung, mehr als 50 Digitalprojekte.',
    foto: '/images/team/tobias-steffen.webp',
    breite: 1536,
    hoehe: 1527,
    alt: 'Porträt von Tobias Steffen, schwarz-weiß',
    telefon: KONTAKT.telefon,
    telefonHref: KONTAKT.telefonHref,
    link: { href: 'https://www.tobiassteffen.com/', label: 'tobiassteffen.com' },
};

const LEON_POESKEN: Person = {
    name: LEON.name,
    rolle: 'Entwickler',
    satz: 'Kaufmann und NGO-Gründer aus Leipzig. IT aus Überzeugung: bringt Verwaltung und Technik an einen Tisch.',
    foto: '/images/team/leon-poesken.webp',
    breite: 1536,
    hoehe: 1527,
    alt: 'Porträt von Leon Pösken, schwarz-weiß',
    telefon: LEON.telefon,
    telefonHref: LEON.telefonHref,
    email: LEON.email,
};

// Ausgeblendet in v2 (Schulungsleiter KI-Fortbildung); Foto und Text bleiben im Code.
const EREMIYA_RIFAT: Person = {
    name: 'Eremiya Rifat',
    rolle: 'Solution Architect · Schulungsleiter',
    satz: 'Technologie-Enthusiast und Trainer mit Fokus auf praxisnahe KI-Anwendungen für die Verwaltung.',
    foto: '/images/team/eremiya-rifat.webp',
    breite: 360,
    hoehe: 360,
    alt: 'Porträt von Eremiya Rifat, schwarz-weiß',
};

/** Team in der Reihenfolge der Seite „Über uns“: Tobias Steffen, Leon Pösken (Leon an der Stelle von Eremiya). */
export const PERSONEN: readonly Person[] = EINZELNES.teamEremiyaRifat
    ? [TOBIAS_STEFFEN, EREMIYA_RIFAT, LEON_POESKEN]
    : [TOBIAS_STEFFEN, LEON_POESKEN];

/** Ansprechpartner im Kontakt: Leon zuerst (Owner-Vorgabe), dann Tobias. */
export const ANSPRECHPARTNER: readonly Person[] = [LEON_POESKEN, TOBIAS_STEFFEN];
