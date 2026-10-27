'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
    const mql = window.matchMedia(QUERY);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
}

function getSnapshot() {
    return window.matchMedia(QUERY).matches;
}

// Server und erster Hydrierungsdurchlauf liefern false, damit das Markup mit dem
// Server-HTML übereinstimmt. Erst danach kommt der echte Wert.
function getServerSnapshot() {
    return false;
}

export function useSafeReducedMotion(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
