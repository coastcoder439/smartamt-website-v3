// Regeln des Kontaktformulars: Felder, Prüfung, Nutzlasten, E-Mail-Weg.
//
// Alles hier ist reine Logik ohne React. Die Feldnamen sind fest, weil Tobis n8n-Ablauf sie für die
// KI-Fortbildung erwartet (docs/packages/01-smartamt-website/design/website-copy-b2-b3.md, „Kontakt“).
// Die Sende-Adressen kommen ausschließlich aus Umgebungsvariablen und werden beim Build eingebaut;
// im Code steht kein Wert (siehe .env.example).

import { KONTAKT } from '@/lib/site';
import { anliegenLabel, type AnliegenWert } from './anliegen';

// ---- Sende-Adressen (Build-Variablen) ---------------------------------------
// `process.env.NEXT_PUBLIC_…` muss wörtlich so geschrieben stehen, sonst baut Next den Wert nicht ein.

const FORM_WEBHOOK_URL = (process.env.NEXT_PUBLIC_FORM_WEBHOOK_URL ?? '').trim();
const CONTACT_WEBHOOK_URL = (process.env.NEXT_PUBLIC_CONTACT_WEBHOOK_URL ?? '').trim();

export type Sendeweg = 'webhook-schulung' | 'webhook-kontakt' | 'mailto';

/**
 * KI-Fortbildung: POST an NEXT_PUBLIC_FORM_WEBHOOK_URL. Alle anderen Anliegen: POST an
 * NEXT_PUBLIC_CONTACT_WEBHOOK_URL. Fehlt die jeweilige Variable, bereitet der Knopf eine E-Mail vor.
 */
export function waehleSendeweg(anliegen: AnliegenWert | null): Sendeweg {
    if (anliegen === 'schulung') return FORM_WEBHOOK_URL ? 'webhook-schulung' : 'mailto';
    return CONTACT_WEBHOOK_URL ? 'webhook-kontakt' : 'mailto';
}

export function sendeAdresse(weg: Exclude<Sendeweg, 'mailto'>): string {
    return weg === 'webhook-schulung' ? FORM_WEBHOOK_URL : CONTACT_WEBHOOK_URL;
}

// ---- Felder -----------------------------------------------------------------

export const ZEITFENSTER = [
    { wert: 'morning', label: 'Vormittag, 08:00–12:00 Uhr' },
    { wert: 'midday', label: 'Mittag, 10:00–14:30 Uhr (inkl. 30 Min. Pause)' },
    { wert: 'afternoon', label: 'Nachmittag, 12:00–16:00 Uhr' },
] as const;

export type Zeitfenster = (typeof ZEITFENSTER)[number]['wert'];

export type FeldName =
    | 'anliegen'
    | 'name'
    | 'organization'
    | 'email'
    | 'phone'
    | 'website'
    | 'address'
    | 'participants'
    | 'date'
    | 'timeSlots'
    | 'message'
    | 'acceptPrivacy';

/** Reihenfolge der Felder auf der Seite; der erste Fehler in dieser Reihenfolge bekommt den Fokus. */
export const FELD_REIHENFOLGE: readonly FeldName[] = [
    'anliegen',
    'name',
    'organization',
    'email',
    'phone',
    'website',
    'address',
    'participants',
    'date',
    'timeSlots',
    'message',
    'acceptPrivacy',
];

export type Werte = {
    name: string;
    organization: string;
    email: string;
    phone: string;
    message: string;
    website: string;
    address: string;
    participants: string;
    date: string; // JJJJ-MM-TT (Wert eines Datumsfelds)
    timeSlots: Zeitfenster[];
    acceptPrivacy: boolean;
    company_url: string; // Honeypot, bleibt leer
};

export type Fehler = Partial<Record<FeldName, string>>;

export const GRENZEN = {
    name: { min: 2, max: 100 },
    organization: { min: 2, max: 200 },
    phone: { min: 6, max: 30 },
    message: { max: 1000 },
    website: { max: 200 },
    address: { min: 3, max: 300 },
    participants: { min: 5, max: 35, vorgabe: '15' },
} as const;

/** Festpreis der KI-Fortbildung (Eckdaten): netto und brutto mit 19 % MwSt. */
export const PREIS = { netto: 1800, brutto: 2142 } as const;

/** Werktage Vorlauf für den Wunschtermin. */
export const VORLAUF_WERKTAGE = 10;

export function leereWerte(): Werte {
    return {
        name: '',
        organization: '',
        email: '',
        phone: '',
        message: '',
        website: '',
        address: '',
        participants: GRENZEN.participants.vorgabe,
        date: '',
        timeSlots: [],
        acceptPrivacy: false,
        company_url: '',
    };
}

// ---- Datum ------------------------------------------------------------------

function zweistellig(zahl: number) {
    return String(zahl).padStart(2, '0');
}

/** Lokales Datum als JJJJ-MM-TT. */
export function alsIso(datum: Date): string {
    return `${datum.getFullYear()}-${zweistellig(datum.getMonth() + 1)}-${zweistellig(datum.getDate())}`;
}

/** Heutiges Datum als JJJJ-MM-TT (im Browser). */
export function heuteIso(): string {
    return alsIso(new Date());
}

function ausIso(iso: string): Date | null {
    const treffer = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!treffer) return null;
    const jahr = Number(treffer[1]);
    const monat = Number(treffer[2]);
    const tag = Number(treffer[3]);
    const datum = new Date(jahr, monat - 1, tag);
    const stimmt = datum.getFullYear() === jahr && datum.getMonth() === monat - 1 && datum.getDate() === tag;
    return stimmt ? datum : null;
}

/** JJJJ-MM-TT als TT.MM.JJJJ. */
export function deutschesDatum(iso: string): string {
    const treffer = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return treffer ? `${treffer[3]}.${treffer[2]}.${treffer[1]}` : iso;
}

/** Frühester Wunschtermin: 10 Werktage (Montag bis Freitag) nach dem angegebenen Tag. */
export function fruehesterTermin(vonIso: string): string {
    const datum = ausIso(vonIso);
    if (!datum) return '';
    let werktage = 0;
    while (werktage < VORLAUF_WERKTAGE) {
        datum.setDate(datum.getDate() + 1);
        const wochentag = datum.getDay();
        if (wochentag !== 0 && wochentag !== 6) werktage += 1;
    }
    return alsIso(datum);
}

// ---- Prüfung ----------------------------------------------------------------

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFON_MUSTER = /^[0-9 +()/.-]+$/;
const WEBSITE_MUSTER = /^(https?:\/\/)?([a-z0-9äöüß-]+\.)+[a-z]{2,}(\/\S*)?$/i;

function laenge(text: string) {
    return Array.from(text.trim()).length;
}

/** Welche Felder bei welchem Anliegen gelten. */
export function geltendeFelder(anliegen: AnliegenWert | null): FeldName[] {
    const basis: FeldName[] = ['anliegen', 'name', 'organization', 'email', 'phone', 'message', 'acceptPrivacy'];
    if (anliegen === 'website') return [...basis, 'website'];
    if (anliegen === 'schulung') return [...basis, 'address', 'participants', 'date', 'timeSlots'];
    return basis;
}

/**
 * Prüft alle Felder, die beim gewählten Anliegen gelten. Die Meldungen sind verständlich, nennen das
 * Feld und sagen, was zu tun ist. `heute` (JJJJ-MM-TT) ist im Browser gesetzt; auf dem Server leer,
 * dann entfällt nur die Prüfung auf den frühesten Termin.
 */
export function validiere(anliegen: AnliegenWert | null, werte: Werte, heute: string): Fehler {
    const fehler: Fehler = {};
    const gilt = new Set(geltendeFelder(anliegen));

    if (!anliegen) fehler.anliegen = 'Bitte wählen Sie Ihr Anliegen.';

    const name = werte.name.trim();
    if (laenge(name) < GRENZEN.name.min) fehler.name = 'Bitte geben Sie Ihren Namen an (mindestens 2 Zeichen).';
    else if (laenge(name) > GRENZEN.name.max) fehler.name = 'Der Name darf höchstens 100 Zeichen lang sein.';

    const organisation = werte.organization.trim();
    if (laenge(organisation) < GRENZEN.organization.min) {
        fehler.organization = 'Bitte nennen Sie Ihre Gemeinde oder Behörde (mindestens 2 Zeichen).';
    } else if (laenge(organisation) > GRENZEN.organization.max) {
        fehler.organization = 'Die Angabe darf höchstens 200 Zeichen lang sein.';
    }

    const email = werte.email.trim();
    if (!email) fehler.email = 'Bitte geben Sie Ihre E-Mail-Adresse an.';
    else if (email.length > 254 || !EMAIL_MUSTER.test(email)) {
        fehler.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an, zum Beispiel name@gemeinde.de.';
    }

    const telefon = werte.phone.trim();
    if (!telefon) fehler.phone = 'Bitte geben Sie Ihre Telefonnummer an.';
    else if (!TELEFON_MUSTER.test(telefon)) {
        fehler.phone = 'Bitte nutzen Sie für die Telefonnummer nur Ziffern, Leerzeichen und die Zeichen + - / . ( ).';
    } else if (telefon.length < GRENZEN.phone.min || telefon.length > GRENZEN.phone.max) {
        fehler.phone = 'Die Telefonnummer muss 6 bis 30 Zeichen lang sein.';
    }

    if (laenge(werte.message) > GRENZEN.message.max) {
        fehler.message = 'Die Nachricht darf höchstens 1000 Zeichen lang sein.';
    }

    if (gilt.has('website')) {
        const adresse = werte.website.trim();
        if (!adresse) fehler.website = 'Bitte geben Sie die Adresse Ihrer Website an, zum Beispiel www.gemeinde.de.';
        else if (adresse.length > GRENZEN.website.max || !WEBSITE_MUSTER.test(adresse)) {
            fehler.website = 'Bitte geben Sie die Adresse in der Form www.gemeinde.de an.';
        }
    }

    if (gilt.has('address')) {
        const ort = werte.address.trim();
        if (laenge(ort) < GRENZEN.address.min) fehler.address = 'Bitte nennen Sie den Schulungsort (mindestens 3 Zeichen).';
        else if (laenge(ort) > GRENZEN.address.max) fehler.address = 'Der Schulungsort darf höchstens 300 Zeichen lang sein.';
    }

    if (gilt.has('participants')) {
        const anzahl = werte.participants.trim();
        const zahl = Number(anzahl);
        const ganz = /^\d+$/.test(anzahl) && Number.isInteger(zahl);
        if (!ganz || zahl < GRENZEN.participants.min || zahl > GRENZEN.participants.max) {
            fehler.participants = 'Bitte geben Sie eine Teilnehmerzahl von 5 bis 35 an.';
        }
    }

    if (gilt.has('date')) {
        const datum = ausIso(werte.date);
        if (!werte.date) fehler.date = 'Bitte wählen Sie Ihren Wunschtermin.';
        else if (!datum) fehler.date = 'Bitte wählen Sie ein gültiges Datum.';
        else if (datum.getDay() === 0 || datum.getDay() === 6) {
            fehler.date = 'Bitte wählen Sie einen Werktag, Montag bis Freitag.';
        } else if (heute) {
            const frueh = fruehesterTermin(heute);
            if (frueh && werte.date < frueh) {
                fehler.date = `Der früheste Wunschtermin ist der ${deutschesDatum(frueh)} (10 Werktage Vorlauf).`;
            }
        }
    }

    if (gilt.has('timeSlots') && werte.timeSlots.length === 0) {
        fehler.timeSlots = 'Bitte wählen Sie mindestens ein Zeitfenster.';
    }

    if (!werte.acceptPrivacy) {
        fehler.acceptPrivacy = 'Bitte bestätigen Sie, dass Sie die Datenschutzerklärung gelesen haben.';
    }

    return fehler;
}

// ---- Nutzlasten ---------------------------------------------------------------

/** Zeitfenster in der festen Reihenfolge des Formulars, nicht in der Klickreihenfolge. */
function geordneteZeitfenster(auswahl: Zeitfenster[]): Zeitfenster[] {
    return ZEITFENSTER.map((z) => z.wert).filter((wert) => auswahl.includes(wert));
}

/**
 * KI-Fortbildung: genau die Felder, die Tobis Ablauf erwartet, in dieser Reihenfolge.
 * `date` ist das ISO-Datum (JJJJ-MM-TT), `distance` bleibt null, die Preise sind fest.
 */
export function baueSchulungNutzlast(werte: Werte) {
    return {
        name: werte.name.trim(),
        organization: werte.organization.trim(),
        email: werte.email.trim(),
        phone: werte.phone.trim(),
        address: werte.address.trim(),
        message: werte.message.trim(),
        timeSlots: geordneteZeitfenster(werte.timeSlots),
        participants: Number(werte.participants),
        acceptPrivacy: true,
        date: werte.date,
        distance: null,
        priceNet: PREIS.netto,
        priceGross: PREIS.brutto,
    };
}

/** Alle anderen Anliegen: alle sichtbaren Felder plus `anliegen`. */
export function baueKontaktNutzlast(anliegen: AnliegenWert, werte: Werte) {
    const basis = {
        anliegen,
        name: werte.name.trim(),
        organization: werte.organization.trim(),
        email: werte.email.trim(),
        phone: werte.phone.trim(),
        message: werte.message.trim(),
        acceptPrivacy: true,
    };
    if (anliegen === 'website') return { ...basis, website: werte.website.trim() };
    return basis;
}

/**
 * Der vorbereitete E-Mail-Weg: `mailto:` an mail@smartamt.de mit Betreff „Anfrage SmartAmt: <Anliegen> –
 * <Gemeinde>“ und allen Angaben im Text. Gesendet wird erst im E-Mail-Programm der Person.
 */
export function baueMailto(anliegen: AnliegenWert, werte: Werte): string {
    const label = anliegenLabel(anliegen);
    const betreff = `Anfrage SmartAmt: ${label} – ${werte.organization.trim()}`;

    const zeilen: string[] = [
        `Anliegen: ${label}`,
        `Name: ${werte.name.trim()}`,
        `Gemeinde oder Behörde: ${werte.organization.trim()}`,
        `E-Mail: ${werte.email.trim()}`,
        `Telefon: ${werte.phone.trim()}`,
    ];
    if (anliegen === 'website') zeilen.push(`Adresse der Website: ${werte.website.trim()}`);
    if (anliegen === 'schulung') {
        const fenster = geordneteZeitfenster(werte.timeSlots)
            .map((wert) => ZEITFENSTER.find((z) => z.wert === wert)?.label ?? wert)
            .join('; ');
        zeilen.push(
            `Schulungsort: ${werte.address.trim()}`,
            `Teilnehmende: ${werte.participants.trim()}`,
            `Wunschtermin: ${deutschesDatum(werte.date)}`,
            `Zeitfenster: ${fenster}`,
        );
    }
    const nachricht = werte.message.trim();
    if (nachricht) zeilen.push('', 'Nachricht:', nachricht);
    zeilen.push('', 'Datenschutzerklärung gelesen und einverstanden: ja');

    const betreffKodiert = encodeURIComponent(betreff);
    const textKodiert = encodeURIComponent(zeilen.join('\r\n'));
    return `mailto:${KONTAKT.email}?subject=${betreffKodiert}&body=${textKodiert}`;
}

// ---- Senden -----------------------------------------------------------------

/** Schickt JSON an die Adresse. Wirft bei Netzfehler, Zeitüberschreitung (20 s) und Status außerhalb 200–299. */
export async function sendeJson(adresse: string, nutzlast: unknown): Promise<void> {
    const abbruch = new AbortController();
    const frist = window.setTimeout(() => abbruch.abort(), 20000);
    try {
        const antwort = await fetch(adresse, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nutzlast),
            credentials: 'omit',
            signal: abbruch.signal,
        });
        if (!antwort.ok) throw new Error(`Status ${antwort.status}`);
    } finally {
        window.clearTimeout(frist);
    }
}
