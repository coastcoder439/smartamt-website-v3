'use client';

import { useSyncExternalStore } from 'react';

const ANFRAGE = '(prefers-reduced-motion: reduce)';

function abonnieren(aufAenderung: () => void) {
    const mq = window.matchMedia(ANFRAGE);
    mq.addEventListener('change', aufAenderung);
    return () => mq.removeEventListener('change', aufAenderung);
}

/**
 * true, sobald die Seite im Browser läuft und keine reduzierte Bewegung gewünscht ist.
 * Im Server-HTML und beim Hydrieren ist der Wert false: Dort steht der Endzustand ohne Bewegung,
 * den auch Besucher ohne JavaScript sehen. Reagiert auf eine Änderung der Systemeinstellung.
 */
export function useBewegungErlaubt(): boolean {
    return useSyncExternalStore(
        abonnieren,
        () => !window.matchMedia(ANFRAGE).matches,
        () => false,
    );
}

export default useBewegungErlaubt;
