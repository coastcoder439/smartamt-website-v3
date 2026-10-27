// Gate Gestaltung (CI v3): Prüft im Quelltext die harten Regeln aus docs/brand/brand-identity.md (Corporate Identity v3):
//  - keine Schilder (Komponente Ortsschild, Schild-Tokens, Altnamen aus CI v1/v2)
//  - kein aggressives Rot, kein Gelb: Rot nur als Token `bad` (Formularfehler, klein), Gelb nirgends
//  - Verläufe nur als weiches Licht (radial) oder als Maske/Ausblendung in Weiß, nie als farbige Fläche
//  - Schatten nur über die Tokens (shadow-sm/md/lg) oder als feiner Ring; kein text-shadow/drop-shadow
//  - Glas (backdrop) nur in der Kopfzeile, keine Emojis
//  - Farbwerte stehen genau einmal (globals.css: :root und die vier Farbvarianten der Farbwahl); sonst nur Verweise darauf
//  - Orange bleibt der Standard (CI v3): die Marke steht in `:root, [data-farbe='orange']`; die Rampen Hellblau, Violett und
//    Grün liefern denselben Satz (die Rechnung der Kontraste steht in farbwahl-statisch.mjs)
// Orange als Akzent (nie große Fläche) und Rot-Anteile im Bild prüft die Sichtprüfung, nicht dieses Skript.
import { lies, quellen, fertig } from './_lib.mjs';

const fehler = [];

const ALTNAMEN = /ortsschild|ortsgelb|schildschwarz|schildrot|schild-rand|font-schild|font-haus|font-akte|\b(?:bg|text|border|fill|stroke)-(?:asphalt|kreide|nebel|textgrau|linie)\b|surface-(?:nebel|schwarz)|karte-nebel/i;
const ROT_GELB_TAILWIND = /\b(?:bg|text|border|fill|stroke|ring|from|via|to)-(?:red|rose|amber|yellow|orange)-\d+/;
const ROT_GELB_HEX = /#(?:f5c400|c8102e|dc2626|ff0000|e53935|ffd600|fdd835|facc15|eab308)\b/i;
// Emoji-Bereiche; © und Pfeile bleiben erlaubt.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const css = lies('src/styles/globals.css');
// Die Rampen der Farbwahl (Block „Markenfarbe“ in globals.css, ohne Kommentare): ihre Markenwerte gelten wie die
// des Standards als Markenfarben und stehen nur dort.
const RAMPEN = css.slice(css.indexOf(":root,\n[data-farbe='orange']"), css.indexOf('@layer base')).replace(/\/\*[\s\S]*?\*\//g, '');
const RAMPEN_HEX = [
  ...new Set(
    [...RAMPEN.matchAll(/--(?:brand|brand-600|brand-ink|brand-50|brand-100|brand-hell|night)\s*:\s*#([0-9a-f]{6})\b/gi)].map((m) => m[1].toLowerCase()),
  ),
];
const MARKEN_HEX = new RegExp(`#(?:ff6600|e85d04|c2410c|0f0f10|9a5b00|15803d|${RAMPEN_HEX.join('|')})\\b`, 'i');

/** Text einer Verlaufsfunktion von „gradient(“ bis zur schließenden Klammer. */
function verlaufsText(text, ab) {
  let tiefe = 0;
  for (let i = ab; i < text.length; i++) {
    if (text[i] === '(') tiefe++;
    else if (text[i] === ')' && --tiefe === 0) return text.slice(ab, i + 1);
  }
  return text.slice(ab, ab + 120);
}

for (const rel of quellen()) {
  const text = lies(rel);
  const istRoot = rel === 'src/styles/globals.css';

  if (ALTNAMEN.test(text)) fehler.push(`${rel}: Schild oder Altname aus CI v1/v2 (${text.match(ALTNAMEN)[0]})`);
  if (ROT_GELB_TAILWIND.test(text)) fehler.push(`${rel}: Tailwind-Rot/Gelb/Orange-Palette (nur Tokens brand, warn, ok, bad)`);
  if (!istRoot && ROT_GELB_HEX.test(text)) fehler.push(`${rel}: Rot- oder Gelbwert (${text.match(ROT_GELB_HEX)[0]}) statt Token`);
  if (EMOJI.test(text)) fehler.push(`${rel}: Emoji`);
  if (/text-shadow|drop-shadow|\[filter:drop/i.test(text)) fehler.push(`${rel}: text-shadow oder drop-shadow`);
  if (/conic-gradient\s*\(/i.test(text)) fehler.push(`${rel}: conic-gradient`);
  if (!rel.endsWith('layout/Header.tsx') && /backdrop-(filter|blur)/i.test(text)) fehler.push(`${rel}: Glas (backdrop) nur in der Kopfzeile`);
  if (!istRoot && MARKEN_HEX.test(text)) {
    // Markenfarben als Hex-Wert nur in :root; überall sonst Token (Tailwind-Klasse oder var(--…)).
    fehler.push(`${rel}: Markenfarbe als Hex-Wert (${text.match(MARKEN_HEX)[0]}) statt Token`);
  }

  for (const m of text.matchAll(/linear-gradient\s*\(/gi)) {
    const g = verlaufsText(text, m.index);
    const davor = text.slice(Math.max(0, m.index - 40), m.index);
    const istMaske = /mask/i.test(davor);
    const neutral = !/#(?!fff\b|000\b)[0-9a-f]{3,8}\b|var\(--(?:brand|warn|ok|bad)/i.test(g.replace(/#(?:fff|000)\b/gi, ''));
    if (!istMaske && !neutral) fehler.push(`${rel}: farbiger linear-gradient (nur Maske oder Weiß-Ausblendung erlaubt)`);
  }
}

const cssKlein = css.toLowerCase();
for (const wert of ['#ff6600', '#e85d04', '#c2410c', '#0f0f10', '#ffffff', '#f6f6f7', '#e7e7ea', '#0a0a0a', '#9a5b00', '#fff4e5', '#15803d', '#eef8f1']) {
  if (!cssKlein.includes(wert)) fehler.push(`globals.css: CI-v3-Farbe ${wert} fehlt in :root`);
}
for (const klasse of ['.label', '.karte', '.btn', '.feld', '.dot-grid', '.surface-night']) {
  if (!cssKlein.includes(klasse)) fehler.push(`globals.css: Klasse ${klasse} fehlt`);
}
if (!RAMPEN_HEX.length || !/:root,\s*\[data-farbe='orange'\]\s*\{[^{}]*--brand:\s*#ff6600/i.test(css)) fehler.push("globals.css: Orange (#ff6600) ist nicht der Standard in ':root, [data-farbe=orange]'");
for (const id of ['hellblau', 'violett', 'gruen']) {
  if (!new RegExp(String.raw`\[data-farbe='${id}'\]\s*\{`).test(css)) fehler.push(`globals.css: Farbvariante ${id} fehlt`);
}

fertig('CI-STATISCH', fehler);
