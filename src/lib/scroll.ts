// Ein einziger Weg, auf dieser Seite zu einem Abschnitt zu springen (übernommen aus
// neubau-v4-text und angepasst).
//
// Warum eigener Code: Die Seite läuft bei Maus und Trackpad unter Lenis (weiches Scrollen
// für das ganze Dokument). Lenis fängt `window.scrollTo({behavior:'smooth'})` ab, das Ziel
// wird also nie erreicht. Der Provider meldet seine Instanz hier an; ohne Lenis (Touch,
// reduzierte Bewegung) greift der native Sprung.

type LenisLike = {
    scrollTo: (target: number | string | HTMLElement, opts?: Record<string, unknown>) => void;
};

let lenis: LenisLike | null = null;
let rohInstanz: unknown = null;

export function registerLenis(instance: unknown) {
    rohInstanz = instance ?? null;
    lenis = instance && typeof (instance as LenisLike).scrollTo === 'function' ? (instance as LenisLike) : null;
}

/** Die laufende Lenis-Instanz selbst, für Erweiterungen. */
export function getLenis(): unknown {
    return rohInstanz;
}

/**
 * Höhe der festen Kopfzeile (CSS-Variable --header-h) in Pixeln, plus etwas Luft. --header-h steht in rem (Breitbild: wächst mit
 * der Wurzelschrift), darum wird sie über einen unsichtbaren Messkörper aufgelöst und nicht mit parseFloat gelesen.
 */
function kopfAbstand(): number {
    const messer = document.createElement('div');
    messer.setAttribute('aria-hidden', 'true');
    messer.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0;height:var(--header-h)';
    document.body.appendChild(messer);
    const hoehe = messer.getBoundingClientRect().height;
    messer.remove();
    return (hoehe > 0 ? hoehe : 76) + 8;
}

function bewegungReduziert(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export type SprungOptionen = {
    /** Ohne Animation springen (zum Beispiel beim Laden mit Anker in der Adresse). */
    sofort?: boolean;
};

export function scrollToId(id: string, optionen: SprungOptionen = {}) {
    if (typeof window === 'undefined') return;
    const sofort = optionen.sofort === true || bewegungReduziert();

    if (!id) {
        if (lenis) lenis.scrollTo(0, sofort ? { immediate: true } : { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: sofort ? 'auto' : 'smooth' });
        return;
    }

    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - kopfAbstand();
    if (lenis) lenis.scrollTo(y, sofort ? { immediate: true } : { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: sofort ? 'auto' : 'smooth' });

    // Für Tastatur und Screenreader: Der Fokus folgt dem Sprung (ohne zu scrollen).
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
}

/** Für Anker-Links: verhindert den Standardsprung und scrollt weich. Gibt true zurück, wenn gesprungen wurde. */
export function handleAnchorClick(e: { preventDefault: () => void }, id: string): boolean {
    if (typeof window === 'undefined' || window.location.pathname !== '/') return false;
    if (id && !document.getElementById(id)) return false;
    e.preventDefault();
    scrollToId(id);
    return true;
}
