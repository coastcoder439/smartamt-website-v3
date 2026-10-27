// Gate Barrierefreiheit (statischer Teil). Prüft im Quelltext, was sich ohne Browser prüfen lässt:
//  - lang="de", Sprunglink auf #inhalt, <main id="inhalt">
//  - jede Grafik mit role="img" trägt ein aria-label
//  - Fokus: :focus-visible mit 3 px Rahmen; kein outline:none außer für programmatisch fokussierte Ziele
//  - prefers-reduced-motion ist behandelt (CSS und Script im Kopf)
//  - Zoom bleibt erlaubt (kein maximumScale, kein userScalable)
//  - Menü-Knopf mit aria-expanded und aria-controls
//  - kein @theme-Block (Tailwind-v4-Syntax in einem Tailwind-3-Projekt)
//  - Farbwahl (Werkzeug für Tobi): Schalter mit aria-expanded/aria-controls und Beschriftung, Auswahl als beschriftete
//    Radiogruppe, geschlossenes Feld nicht fokussierbar (visibility), Schrift auf Marke über das Token on-brand, helle
//    Marke auf dunklen Flächen über brand-hell, Fokusfarbe auf dunklen Flächen aus der Rampe
// Kontrast, Tastaturweg und Screenreader-Verhalten sind damit NICHT geprüft; dafür braucht es den Browser.
import { lies, quellen, fertig } from './_lib.mjs';

const fehler = [];

const layout = lies('src/app/layout.tsx');
if (!/<html\b[^>]*\blang="de"/.test(layout)) fehler.push('layout.tsx: <html> ohne lang="de"');
if (!/href="#inhalt"/.test(layout)) fehler.push('layout.tsx: kein Sprunglink auf #inhalt');
if (!/<main\b[^>]*\bid="inhalt"/.test(layout)) fehler.push('layout.tsx: <main> ohne id="inhalt"');
if (/maximumScale|maximum-scale|userScalable|user-scalable/.test(layout)) fehler.push('layout.tsx: Zoom ist eingeschränkt (maximumScale oder userScalable)');
if (!/prefers-reduced-motion/.test(layout)) fehler.push('layout.tsx: das Skript im Kopf beachtet prefers-reduced-motion nicht');

for (const rel of quellen().filter((r) => r.endsWith('.tsx'))) {
  const text = lies(rel);
  for (const m of text.matchAll(/<(svg|div|span)\b[^>]*\brole="img"[^>]*>/g)) {
    if (!/aria-label/.test(m[0]) && !/aria-labelledby/.test(m[0])) fehler.push(`${rel}: role="img" ohne aria-label: ${m[0].slice(0, 60)}…`);
  }
}

const css = lies('src/styles/globals.css');
if (/@theme\b/.test(css)) fehler.push('globals.css: enthält einen @theme-Block (Tailwind-v4-Syntax)');
if (!/:focus-visible/.test(css)) fehler.push('globals.css: keine :focus-visible-Regel');
if (!/outline:\s*3px solid/.test(css)) fehler.push('globals.css: Fokusrahmen ist nicht 3 px');
if (!/@media \(prefers-reduced-motion: reduce\)/.test(css)) fehler.push('globals.css: kein prefers-reduced-motion-Block');
for (const m of css.matchAll(/([^{}]+)\{[^{}]*outline:\s*(none|0)\b[^{}]*\}/g)) {
  const waehler = m[1].trim();
  if (!/\[tabindex='-1'\]:focus/.test(waehler)) fehler.push(`globals.css: outline entfernt bei "${waehler.slice(0, 60)}"`);
}

const kopf = lies('src/components/layout/Header.tsx');
if (!/aria-expanded=/.test(kopf)) fehler.push('Header.tsx: Menü-Knopf ohne aria-expanded');
if (!/aria-controls=/.test(kopf)) fehler.push('Header.tsx: Menü-Knopf ohne aria-controls');

// Farbwahl und die Rampen der Markenfarbe. Die Rechnung der Kontraste je Variante steht in farbwahl-statisch.mjs.
const fw = lies('src/components/ui/Farbwahl.tsx');
if (!/aria-expanded=\{offen\}/.test(fw)) fehler.push('Farbwahl.tsx: Schalter ohne aria-expanded');
if (!/aria-controls="farbwahl-feld"/.test(fw) || !/id="farbwahl-feld"/.test(fw)) fehler.push('Farbwahl.tsx: aria-controls zeigt auf kein Feld');
if (!/<fieldset>[\s\S]*<legend/.test(fw) || !/type="radio"/.test(fw) || !/<label\s[^>]*htmlFor=/.test(fw)) fehler.push('Farbwahl.tsx: Auswahl ist keine beschriftete Radiogruppe');
if (!/peer-focus-visible:outline/.test(fw)) fehler.push('Farbwahl.tsx: kein sichtbarer Fokus auf den Radiofeldern');
if (!/\.farbwahl-panel\s*\{[^{}]*visibility:\s*hidden/.test(css)) fehler.push('globals.css: geschlossenes Farbfeld bleibt per Tastatur erreichbar (visibility: hidden fehlt)');
if (!/\.btn-primary\s*\{[^{}]*color:\s*var\(--on-brand\)/.test(css)) fehler.push('globals.css: Schrift des Hauptknopfs nicht über --on-brand (Kontrast je Rampe)');
if (!/\.surface-night\s*\{[^{}]*--focus:\s*var\(--brand-hell\)/.test(css)) fehler.push('globals.css: Fokusfarbe auf dunklen Flächen nicht aus --brand-hell');
if (!/\.surface-night \.label\s*\{[^{}]*color:\s*var\(--brand-hell\)/.test(css)) fehler.push('globals.css: Label auf dunklen Flächen nicht in --brand-hell');
for (const id of ['orange', 'hellblau', 'violett', 'gruen']) {
  if (!new RegExp(String.raw`\[data-farbe='${id}'\]`).test(css)) fehler.push(`globals.css: Farbvariante ${id} fehlt`);
}

fertig('A11Y-STATISCH', fehler);
