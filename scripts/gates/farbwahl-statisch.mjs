// Gate Farbwahl (statisch): Prüft die vier Farbvarianten der Marke und den Knopf dazu (components/ui/Farbwahl.tsx).
//  - jede Variante (orange, hellblau, violett, gruen) definiert denselben Satz Tokens, und die Listen der Werte in
//    globals.css, im Skript im Kopf (layout.tsx) und in Farbwahl.tsx stimmen überein
//  - die Kontrastpaare sind in jeder Variante AA (Rechnung unten: WCAG-Verhältnis aus der relativen Luminanz):
//    Text mindestens 4,5:1, große Überschriftwörter und Symbole mindestens 3:1
//  - keine Speicher-APIs (Cookie, localStorage, sessionStorage, IndexedDB) in Farbwahl.tsx und im Skript im Kopf
//  - keine harten Markenwerte (Hex oder rgb) außerhalb von globals.css; Komponenten nehmen Tokens
//  - der Knopf und das Skript hängen am Schalter EINZELNES.farbwahl (bei false steht nichts davon im HTML)
// Ausnahme von der 3:1-Regel für Symbole: Orange --brand (#ff6600) steht auf Weiß bei 2,94 (wie in v1) und gilt nur für
// Linien, Punkte und Ringe; Text und Symbole stehen in --brand-ink. Das Logotyp-Wort „Amt“ ist nach WCAG 1.4.3 vom
// Kontrast befreit (Logotyp). Kontrast im Browser und Tastaturweg prüft die Sichtprüfung.
import { lies, quellen, fertig } from './_lib.mjs';

const fehler = [];

const IDS = ['orange', 'hellblau', 'violett', 'gruen'];
const SATZ = [
  'brand', 'brand-600', 'brand-ink', 'brand-50', 'brand-100', 'brand-rgb', 'brand-hell', 'on-brand',
  'bg-2', 'bg-3', 'bg-warm', 'line', 'line-2', 'night',
];

// ---- Farbrechnung ------------------------------------------------------------------------------------------------
function hex(wert) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(wert).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminanz([r, g, b]) {
  const k = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
}
function verhaeltnis(a, b) {
  const [hell, dunkel] = [luminanz(a), luminanz(b)].sort((x, y) => y - x);
  return (hell + 0.05) / (dunkel + 0.05);
}

// ---- Tokens aus globals.css lesen --------------------------------------------------------------------------------
const css = lies('src/styles/globals.css');
const cssOhneKommentare = css.replace(/\/\*[\s\S]*?\*\//g, '');
const regeln = [...cssOhneKommentare.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ waehler: m[1].trim(), innen: m[2] }));
const deklarationen = (innen) => {
  const aus = {};
  for (const m of innen.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) aus[m[1]] = m[2].trim();
  return aus;
};

const basis = {};
for (const r of regeln) if (/(^|[\s,;]):root\s*(,|$)/.test(r.waehler)) Object.assign(basis, deklarationen(r.innen));

const varianten = {};
for (const id of IDS) {
  varianten[id] = {};
  for (const r of regeln) {
    if (new RegExp(`\\[data-farbe='${id}'\\]\\s*(,|$)`).test(r.waehler)) Object.assign(varianten[id], deklarationen(r.innen));
  }
}
// Alle [data-farbe='…']-Werte, die in globals.css vorkommen, müssen genau die vier bekannten sein.
const imCss = [...new Set([...css.matchAll(/\[data-farbe='([a-z]+)'\]/g)].map((m) => m[1]))].sort();
if (imCss.join() !== [...IDS].sort().join()) fehler.push(`globals.css: Farbvarianten ${imCss.join(', ')} statt ${IDS.join(', ')}`);

// ---- 1. Gleicher Satz in jeder Variante --------------------------------------------------------------------------
for (const id of IDS) {
  for (const t of SATZ) {
    if (!(t in varianten[id])) fehler.push(`globals.css: Variante ${id} definiert --${t} nicht`);
  }
  for (const t of Object.keys(varianten[id])) {
    if (!SATZ.includes(t)) fehler.push(`globals.css: Variante ${id} definiert --${t}, das nicht zum Satz gehört (in alle Varianten und in SATZ dieses Skripts aufnehmen)`);
  }
  const rgb = /^(\d{1,3}) (\d{1,3}) (\d{1,3})$/.exec(varianten[id]['brand-rgb'] ?? '');
  if (!rgb || [rgb[1], rgb[2], rgb[3]].some((n) => Number(n) > 255)) fehler.push(`globals.css: Variante ${id}: --brand-rgb ist keine Kanalfolge „r g b“`);
  for (const t of SATZ.filter((x) => x !== 'brand-rgb')) {
    if (t in varianten[id] && !hex(varianten[id][t])) fehler.push(`globals.css: Variante ${id}: --${t} ist kein 6-stelliger Hex-Wert (${varianten[id][t]})`);
  }
}
for (const id of IDS.slice(1)) {
  // Die Varianten dürfen sich nicht gleichen, sonst wirkt der Knopf nicht.
  if (varianten[id].brand && varianten[id].brand === varianten.orange.brand) fehler.push(`globals.css: Variante ${id} hat dieselbe --brand wie Orange`);
}

// ---- 2. Kontrastpaare (AA) ---------------------------------------------------------------------------------------
const feste = {
  weiss: '#ffffff',
  ink: basis.ink,
  'ink-2': basis['ink-2'],
  'ink-3': basis['ink-3'],
  bg: basis.bg,
  'nacht-text': '#c9c9cf', // Fließtext auf .surface-night (globals.css)
  'nacht-titel': '#fafafa', // Überschriften und Logo auf .surface-night
};
for (const [k, v] of Object.entries(feste)) if (!hex(v)) fehler.push(`globals.css: Basis-Token ${k} nicht lesbar (${v})`);

function paar(id, vordergrund, hintergrund, mindest, wofuer) {
  const v = varianten[id];
  const hol = (n) => hex(feste[n] ?? v[n]);
  const a = hol(vordergrund);
  const b = hol(hintergrund);
  if (!a || !b) return null;
  const r = verhaeltnis(a, b);
  if (r < mindest) {
    fehler.push(`Kontrast ${id}: ${wofuer} (${vordergrund} auf ${hintergrund}) ${r.toFixed(2)}:1, nötig ${mindest}:1`);
  }
  return r;
}

export const TABELLE = {};
for (const id of IDS) {
  if (SATZ.some((t) => !(t in varianten[id]))) continue;
  const z = {};
  // Hauptknopf: Schrift auf Marke und beim Überfahren
  z['Schrift auf Knopf'] = paar(id, 'on-brand', 'brand', 4.5, 'Schrift auf dem Hauptknopf');
  z['Schrift auf Knopf (Hover)'] = paar(id, 'on-brand', 'brand-600', 4.5, 'Schrift auf dem Hauptknopf beim Überfahren');
  // Markenfarbe als Text und als Fokusring auf den hellen Flächen
  z['Marke als Text auf Weiß'] = paar(id, 'brand-ink', 'weiss', 4.5, 'Markentext auf Weiß');
  for (const f of ['brand-50', 'bg-2', 'bg-warm']) paar(id, 'brand-ink', f, 4.5, `Markentext auf ${f}`);
  paar(id, 'ink', 'brand-100', 4.5, 'Tinte auf der Auswahlfarbe (::selection)');
  // große Überschriftwörter (ab 24 px) und Symbole
  z['Überschriftwort (brand-600) auf Weiß'] = paar(id, 'brand-600', 'weiss', 3, 'großes Überschriftwort');
  paar(id, 'brand-600', 'bg-2', 3, 'großes Überschriftwort auf bg-2');
  paar(id, 'brand-ink', 'weiss', 3, 'Fokusring und Symbole');
  // Marke als Fläche, Linie, Punkt: Orange ist die benannte Ausnahme (siehe Kopf)
  if (id !== 'orange') z['Marke als Fläche auf Weiß'] = paar(id, 'brand', 'weiss', 3, 'Marke als Fläche, Linie oder Symbol');
  else z['Marke als Fläche auf Weiß'] = verhaeltnis(hex(varianten.orange.brand), hex('#ffffff'));
  // Dunkle Flächen: helle Marke als Text und Fokus, Fließtext und Titel
  z['Marke hell auf Nacht'] = paar(id, 'brand-hell', 'night', 4.5, 'helle Marke als Text auf .surface-night');
  paar(id, 'nacht-text', 'night', 4.5, 'Fließtext auf .surface-night');
  paar(id, 'nacht-titel', 'night', 4.5, 'Überschrift auf .surface-night');
  // Fließtext auf den getönten Flächen
  for (const f of ['bg-2', 'bg-warm', 'brand-50']) {
    paar(id, 'ink', f, 4.5, `Tinte auf ${f}`);
    paar(id, 'ink-2', f, 4.5, `Fließtext auf ${f}`);
    paar(id, 'ink-3', f, 4.5, `Nebentext auf ${f}`);
  }
  TABELLE[id] = z;
}
// bg-3 trägt keinen Text (nur Platzhalter hinter Fotos, Balkenspuren, die aria-hidden-404); ink-3 auf bg-3 bliebe unter 4,5:1.
// Die Prüfung dazu steht unten: ein Element mit bg-bg-3 darf keine eigene Textfarbe außer text-bg-3 tragen.

// ---- 3. Listen der Werte stimmen überein -------------------------------------------------------------------------
const layout = lies('src/app/layout.tsx');
const farbwahl = lies('src/components/ui/Farbwahl.tsx');
const imSkript = /\[('(?:orange|hellblau|violett|gruen)'(?:,'(?:orange|hellblau|violett|gruen)')*)\]\.indexOf/.exec(layout);
if (!imSkript) fehler.push('layout.tsx: die Liste der Farbwerte im Skript im Kopf fehlt');
else if ([...imSkript[1].matchAll(/'([a-z]+)'/g)].map((m) => m[1]).join() !== IDS.join()) fehler.push(`layout.tsx: Farbwerte im Skript ${imSkript[1]} statt ${IDS.join(', ')}`);
const imKnopf = [...farbwahl.matchAll(/\{ id: '([a-z]+)', name:/g)].map((m) => m[1]);
if (imKnopf.join() !== IDS.join()) fehler.push(`Farbwahl.tsx: FARBEN ${imKnopf.join(', ')} statt ${IDS.join(', ')}`);
if (!/\?farbe=|farbe=/.test(layout)) fehler.push("layout.tsx: das Skript liest den Parameter 'farbe' nicht");
if (!/:\s*'orange'\)|\?f:'orange'/.test(layout) && !/'orange'\);\}catch/.test(layout)) fehler.push('layout.tsx: unbekannte Werte ergeben nicht Orange');
if (!/history\.replaceState/.test(farbwahl)) fehler.push('Farbwahl.tsx: schreibt die Wahl nicht mit history.replaceState in die Adresse');

// ---- 4. Keine Speicher-APIs --------------------------------------------------------------------------------------
const SPEICHER = /document\.cookie|localStorage|sessionStorage|indexedDB|caches\.open|navigator\.storage|cookieStore/i;
for (const [name, text] of [['Farbwahl.tsx', farbwahl], ['layout.tsx (Skript im Kopf)', layout]]) {
  // Kommentare dürfen die Wörter nennen („kein Cookie“), der Code nicht.
  const ohneKommentare = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  if (SPEICHER.test(ohneKommentare)) fehler.push(`${name}: Speicher im Browser (Cookie, localStorage, sessionStorage oder IndexedDB); die Wahl steht nur in der Adresse`);
}
if (/fetch\(|XMLHttpRequest|sendBeacon/.test(farbwahl)) fehler.push('Farbwahl.tsx: Aufruf nach außen');

// ---- 5. Keine harten Markenwerte außerhalb von globals.css -------------------------------------------------------
const markenwerte = new Set();
for (const id of IDS) {
  for (const t of ['brand', 'brand-600', 'brand-ink', 'brand-50', 'brand-100', 'brand-hell']) {
    const w = varianten[id][t];
    if (w && hex(w)) markenwerte.add(w.toLowerCase());
  }
}
const rgbMuster = [];
for (const id of IDS) {
  const w = varianten[id]['brand-rgb'];
  if (w) rgbMuster.push(w.trim().split(/\s+/).join('[ ,]+'));
}
const HART_RGB = new RegExp(`rgba?\\(\\s*(?:${[...new Set(rgbMuster)].join('|')})(?=[ ,)/])`, 'i');
for (const rel of quellen()) {
  if (rel === 'src/styles/globals.css') continue;
  const text = lies(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/^\s*\*.*$/gm, '');
  for (const w of markenwerte) {
    if (text.toLowerCase().includes(w)) fehler.push(`${rel}: harter Markenwert ${w} statt Token (brand, brand-ink, … oder var(--brand…))`);
  }
  if (HART_RGB.test(text)) fehler.push(`${rel}: harter Markenwert als rgb(…) statt color-mix(in srgb, var(--brand) …) oder rgb(var(--brand-rgb) / …)`);
  // Schrift auf Marke: nie Tinte oder Weiß fest, sondern text-on-brand (Orange Tinte, sonst Weiß)
  for (const m of text.matchAll(/(?:^|[\s'"`])bg-brand(?:-600)?(?=[\s'"`])[^'"`\n]*?(?:text-ink(?![-\w])|text-white(?![-\w]))/g)) {
    fehler.push(`${rel}: Schrift fest auf bg-brand (${m[0].trim().slice(0, 60)}) statt text-on-brand`);
  }
  // bg-3 trägt keinen Text
  for (const m of text.matchAll(/className="[^"]*\bbg-bg-3\b[^"]*"/g)) {
    if (/\btext-(?!bg-3\b)(?:ink|brand|\[)/.test(m[0])) fehler.push(`${rel}: Fläche bg-bg-3 mit Textfarbe (ink-3 auf bg-3 bleibt unter 4,5:1): ${m[0].slice(0, 70)}`);
  }
}

// ---- 6. Knopf und Skript hängen am Schalter ----------------------------------------------------------------------
const abschnitte = lies('src/lib/abschnitte.ts');
if (!/\bfarbwahl:\s*(true|false)\b/.test(abschnitte)) fehler.push('abschnitte.ts: Schalter EINZELNES.farbwahl fehlt');
if (!/\{EINZELNES\.farbwahl \? <Farbwahl \/> : null\}/.test(layout)) fehler.push('layout.tsx: <Farbwahl /> hängt nicht an EINZELNES.farbwahl');
if (!/EINZELNES\.farbwahl \? SKRIPT_FARBE : ''/.test(layout)) fehler.push('layout.tsx: das Farbskript im Kopf hängt nicht an EINZELNES.farbwahl');
const andereEinbindungen = quellen().filter((rel) => rel !== 'src/app/layout.tsx' && /<Farbwahl\b/.test(lies(rel)) && rel !== 'src/components/ui/Farbwahl.tsx');
for (const rel of andereEinbindungen) fehler.push(`${rel}: bindet <Farbwahl /> an anderer Stelle ein (nur layout.tsx, am Schalter)`);

// ---- 7. Bedienung des Knopfes ------------------------------------------------------------------------------------
for (const [muster, was] of [
  [/aria-expanded=/, 'aria-expanded am Schalter'],
  [/aria-controls=/, 'aria-controls am Schalter'],
  [/<fieldset>[\s\S]*<legend/, 'Radiogruppe mit Beschriftung (fieldset und legend)'],
  [/type="radio"/, 'Radiogruppe (type="radio")'],
  [/e\.key === 'Escape'/, 'Escape schließt'],
  [/knopfRef\.current\?\.focus\(\)/, 'Escape gibt den Fokus an den Schalter zurück'],
  [/pointerdown/, 'Klick daneben schließt'],
  [/sr-only">Farben</, 'Beschriftung „Farben“ für Hilfstechnik'],
  [/Palette/, 'Palette-Symbol aus lucide-react'],
]) {
  if (!muster.test(farbwahl)) fehler.push(`Farbwahl.tsx: fehlt ${was}`);
}
// Bewegung im Feld nur mit transform und opacity (Übergänge der Farbwahl in globals.css)
const farbCss = css.slice(css.indexOf('Farbwahl (Werkzeug'));
for (const m of farbCss.matchAll(/transition:\s*([^;]+);/g)) {
  const eigenschaften = m[1].split(',').map((t) => t.trim().split(/\s+/)[0]);
  const falsch = eigenschaften.filter((e) => !['opacity', 'transform', 'visibility', 'none', 'all'].includes(e));
  if (falsch.length || eigenschaften.includes('all')) fehler.push(`globals.css (Farbwahl): Übergang auf ${falsch.concat(eigenschaften.includes('all') ? ['all'] : []).join(', ')} statt nur transform und opacity`);
}
if (!/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.farbwahl-panel/.test(farbCss)) fehler.push('globals.css (Farbwahl): Bewegung nicht für „reduzierte Bewegung“ abgeschaltet');
if (!/\bz-40\b/.test(farbwahl)) fehler.push('Farbwahl.tsx: liegt nicht auf z-40 (über dem Inhalt, unter der Kopfzeile z-50)');

if (process.argv.includes('--tabelle') && !fehler.length) {
  console.log('Variante   | Knopf | Marke Text | Wort 600 | Fläche | Hell/Nacht');
  for (const id of IDS) {
    const z = TABELLE[id];
    console.log(
      `${id.padEnd(10)} | ${z['Schrift auf Knopf'].toFixed(2)} | ${z['Marke als Text auf Weiß'].toFixed(2)} | ${z['Überschriftwort (brand-600) auf Weiß'].toFixed(2)} | ${z['Marke als Fläche auf Weiß'].toFixed(2)} | ${z['Marke hell auf Nacht'].toFixed(2)}`,
    );
  }
}

fertig('FARBWAHL-STATISCH', fehler);
