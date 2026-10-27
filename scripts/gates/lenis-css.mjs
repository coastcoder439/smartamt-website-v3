// Gate L2: Die von der Lenis-README empfohlene lenis.css ist eingebunden, und Lenis bleibt
// am Finger und bei reduzierter Bewegung aus (gemessene Entscheidung vom 07.09.2026, siehe
// SmoothScrollProvider.tsx). Zusätzlich: Lenis hängt am GSAP-Ticker und meldet Scrolls an ScrollTrigger.
import { lies, quellen, fertig } from './_lib.mjs';

const fehler = [];
const treffer = quellen().filter((rel) => /lenis\/dist\/lenis(\.min)?\.css/.test(lies(rel)));
if (!treffer.length) fehler.push("keine Datei in src/ bindet 'lenis/dist/lenis.css' ein");

const provider = lies('src/providers/SmoothScrollProvider.tsx');
if (!/\(pointer:\s*coarse\)/.test(provider)) fehler.push("SmoothScrollProvider startet Lenis nicht mehr ohne '(pointer: coarse)'-Weiche (am Finger muss es aus bleiben)");
if (!/prefers-reduced-motion:\s*reduce/.test(provider)) fehler.push("SmoothScrollProvider startet Lenis trotz 'prefers-reduced-motion: reduce'");
if (/syncTouch\s*:\s*true/.test(provider)) fehler.push('syncTouch: true ist verboten (bremst das Scrollen am Finger)');
if (!/gsap\.ticker\.add/.test(provider)) fehler.push('SmoothScrollProvider hängt Lenis nicht an den GSAP-Ticker');
if (!/on\('scroll',\s*ScrollTrigger\.update\)/.test(provider)) fehler.push('SmoothScrollProvider meldet Lenis-Scrolls nicht an ScrollTrigger.update');

fertig('LENIS-CSS', fehler);
