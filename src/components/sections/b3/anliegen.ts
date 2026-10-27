// Die Anliegen des Kontaktformulars und ihre Anbindung an die Vorbelegung (lib/kontakt.ts).
//
// lib/kontakt.ts kennt alle vier Werte („website“, „schulung“, „it-schulung“, „sonstiges“). Das Merken
// und Melden dort prüft den Wert nicht, deshalb laufen auch „it-schulung“ und „sonstiges“ über
// denselben Weg.
//
// Website v2 (Entscheidung 9): Das Formular zeigt nur noch „Vorschau anfragen“ (der bisherige Wert „website“,
// früher „Website prüfen lassen“) und „Etwas anderes“. „KI-Fortbildung anfragen“ und „IT-Schulung anfragen“ sind
// ausgeblendet (lib/abschnitte.ts, EINZELNES), die Werte und die Felder dazu bleiben im Code.

import { EINZELNES } from '@/lib/abschnitte';
import { useAnliegen, waehleAnliegen, type Anliegen } from '@/lib/kontakt';

export type AnliegenWert = 'website' | 'schulung' | 'it-schulung' | 'sonstiges';

/** Alle Anliegen mit ihren Beschriftungen, auch die ausgeblendeten (für Betreff und Nutzlast). */
const ALLE_ANLIEGEN: readonly { wert: AnliegenWert; label: string; sichtbar: boolean }[] = [
    { wert: 'website', label: 'Vorschau anfragen', sichtbar: true },
    { wert: 'schulung', label: 'KI-Fortbildung anfragen', sichtbar: EINZELNES.anliegenSchulung },
    { wert: 'it-schulung', label: 'IT-Schulung anfragen', sichtbar: EINZELNES.anliegenItSchulung },
    { wert: 'sonstiges', label: 'Etwas anderes', sichtbar: true },
];

/** Die Anliegen, die das Formular anbietet. */
export const ANLIEGEN: readonly { wert: AnliegenWert; label: string }[] = ALLE_ANLIEGEN.filter((a) => a.sichtbar).map(
    ({ wert, label }) => ({ wert, label }),
);

export function istAnliegenWert(wert: unknown): wert is AnliegenWert {
    return typeof wert === 'string' && ANLIEGEN.some((a) => a.wert === wert);
}

export function anliegenLabel(wert: AnliegenWert): string {
    return ALLE_ANLIEGEN.find((a) => a.wert === wert)?.label ?? wert;
}

/** Merkt das Anliegen und meldet es an den Kontaktabschnitt (Custom-Event aus lib/kontakt.ts). */
export function setzeAnliegen(wert: AnliegenWert | null) {
    waehleAnliegen(wert satisfies Anliegen | null);
}

/** Aktuell gewähltes, angebotenes Anliegen oder null. Serverseitig und beim ersten Rendern immer null. */
export function useAnliegenWert(): AnliegenWert | null {
    const roh: string | null = useAnliegen();
    return istAnliegenWert(roh) ? roh : null;
}
