// Vorbelegung des Anliegens im Kontaktabschnitt.
//
// Der Hauptknopf im Hero springt zu #kontakt und setzt dort das Anliegen „Website“.
// Das geht auf zwei Wegen, die dieselbe Quelle nutzen:
//   1. Klick auf einen Knopf: `waehleAnliegen('website')` merkt sich den Wert und meldet ihn
//      per Custom-Event (`ANLIEGEN_EVENT`) an alle, die schon zuhören.
//   2. Adresse von außen: `/#kontakt?anliegen=website` (zum Beispiel aus einer E-Mail).
//      `HashSprung` liest sie beim Laden, ruft `waehleAnliegen` und springt zum Abschnitt.
//
// Der Kontaktabschnitt liest den Wert mit `useAnliegen()` (reagiert auf Änderungen und hat
// beim ersten Rendern schon den gemerkten Wert) und trägt ihn ins Formular ein.

import { useSyncExternalStore } from 'react';

/** Mögliche Anliegen. Der Kontaktabschnitt darf die Liste erweitern. */
export type Anliegen = 'website' | 'schulung' | 'it-schulung' | 'sonstiges';

const GUELTIG: readonly string[] = ['website', 'schulung', 'it-schulung', 'sonstiges'];

export const ANLIEGEN_EVENT = 'smartamt:anliegen';

let gemerkt: Anliegen | null = null;

export function istAnliegen(wert: string | null | undefined): wert is Anliegen {
    return typeof wert === 'string' && GUELTIG.includes(wert);
}

export function leseAnliegen(): Anliegen | null {
    return gemerkt;
}

export function waehleAnliegen(anliegen: Anliegen | null) {
    gemerkt = anliegen;
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent<Anliegen | null>(ANLIEGEN_EVENT, { detail: anliegen }));
    }
}

function abonnieren(aufAenderung: () => void) {
    window.addEventListener(ANLIEGEN_EVENT, aufAenderung);
    return () => window.removeEventListener(ANLIEGEN_EVENT, aufAenderung);
}

/** Aktuelles Anliegen (oder null). Serverseitig immer null. */
export function useAnliegen(): Anliegen | null {
    return useSyncExternalStore(abonnieren, leseAnliegen, () => null);
}

/**
 * Zerlegt einen Adress-Anker wie `#kontakt?anliegen=website&ort=Musterbach`.
 * `id` ist der Abschnitt, `parameter` die Werte hinter dem Fragezeichen.
 */
export function zerlegeHash(hash: string): { id: string; parameter: URLSearchParams } {
    const ohneRaute = hash.startsWith('#') ? hash.slice(1) : hash;
    const frage = ohneRaute.indexOf('?');
    const roh = frage === -1 ? ohneRaute : ohneRaute.slice(0, frage);
    const rest = frage === -1 ? '' : ohneRaute.slice(frage + 1);
    let id = roh;
    try {
        id = decodeURIComponent(roh);
    } catch {
        // kaputte Prozentkodierung: Rohwert verwenden
    }
    return { id, parameter: new URLSearchParams(rest) };
}
