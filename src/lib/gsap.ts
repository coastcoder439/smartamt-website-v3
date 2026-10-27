// Zentrale Anmeldung der GSAP-Plugins. Nur aus Client-Komponenten und Effekten importieren.
//
// SplitText und ScrollTrigger sind seit GSAP 3.13 frei nutzbar. Linien und Ringe zeichnen sich
// über `stroke-dashoffset` (pathLength = 1) oder `clip-path` statt über das DrawSVGPlugin: Der
// Zustand steht dadurch schon im Server-HTML und ist dort der Endzustand.
//
// Regeln für alle Bewegung auf dieser Seite (docs/brand/brand-identity.md, „Bewegung“):
//  - nur transform und opacity (Ausnahmen: clip-path und stroke-dashoffset für Linien),
//  - Startzustände setzt erst der Effekt, nie das Server-HTML,
//  - Aufräumen mit `gsap.context().revert()`,
//  - bei prefers-reduced-motion zeigt die Seite sofort die Endzustände.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let angemeldet = false;

export function registerGsap() {
    if (angemeldet || typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    // Die ein- und ausfahrende Adressleiste am Handy darf keine Neuberechnung auslösen.
    ScrollTrigger.config({ ignoreMobileResize: true });
    angemeldet = true;
}

export { gsap, ScrollTrigger, SplitText };

export const REDUZIERT = '(prefers-reduced-motion: reduce)';

export function bewegungReduziert(): boolean {
    return typeof window !== 'undefined' && window.matchMedia(REDUZIERT).matches;
}

/** Maus oder Trackpad (Hover möglich, feiner Zeiger). Am Finger gibt es keine Zeigerbewegung. */
export function feinerZeiger(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}
