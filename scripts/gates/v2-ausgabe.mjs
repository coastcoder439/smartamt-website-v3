// Gate Website v2 (gebauter Export): Was der Besucher sieht, ist das, was der Owner wollte. Liest `out/index.html` (nach
// `npm run build`), braucht keinen Server und kein Netz.
//
//   node scripts/gates/v2-ausgabe.mjs [out/index.html]
//
//  - Titel und Beschreibung ohne KI.
//  - Sichtbarer Text ohne KI, Schulung, Fortbildung, Eremiya Rifat; „Eine Website, die Ihre Gemeinde gut vertritt.“ bleibt.
//  - Nie zweimal „sicher“: kein „rechtssicher“, kein „sicher“ gefolgt von „sicher“ innerhalb von drei Wörtern.
//  - Reihenfolge der Abschnitte (Entscheidung 4); ausgeblendete Abschnitte und Links auf sie fehlen.
//  - Angebot (Entscheidung 6), Ablauf in vier Schritten (7), Team und Kontakt mit Leon (8, 9), sechs Fragen (10).
//  - Aufgeräumt nach Prüfrunde 1: kein Preishinweis ohne Preis, kein zweiter Terminknopf, keine Beraterkarte,
//    „Hosting in Deutschland“ im Angebot genau einmal, Datenschutz ohne Schulungsfelder.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, fertig } from './_lib.mjs';

const datei = path.resolve(ROOT, process.argv[2] ?? 'out/index.html');
if (!fs.existsSync(datei)) {
  console.error(`V2-AUSGABE FEHLGESCHLAGEN\n - ${datei} fehlt: zuerst npm run build`);
  process.exit(1);
}
const html = fs.readFileSync(datei, 'utf8');
const fehler = [];

const ohneSkript = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
const sichtbar = ohneSkript
  .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#x27;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&[a-z#0-9]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();
// Texte für Hilfstechnik (aria-label, alt, title) zählen auch: Der Besucher kann sie hören.
const attribute = [...html.matchAll(/\b(?:aria-label|alt|title)="([^"]*)"/g)].map((m) => m[1]).join(' ');
const alles = `${sichtbar} ${attribute}`;

// ---- Titel und Beschreibung ------------------------------------------------------------------------------
const titel = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
if (titel !== 'SmartAmt – Sichere Websites für Gemeinden') fehler.push(`title ist „${titel}“`);
const beschreibung = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
if (!beschreibung || /\bKI\b|Schulung|Fortbildung|schult/.test(beschreibung)) fehler.push('meta description fehlt oder nennt KI oder Schulung');
if (/KI-Schulung|\bKI\b/.test(html.match(/<meta property="og:[^>]*>/g)?.join(' ') ?? '')) fehler.push('Open-Graph-Angaben nennen KI');

// ---- Verbotenes im sichtbaren Text -------------------------------------------------------------------------
for (const [muster, was] of [
  [/\bKI\b|KI-/, 'KI'],
  [/Schulung|Fortbildung|Schulungsleiter/i, 'Schulung oder Fortbildung'],
  [/Eremiya|Rifat/, 'Eremiya Rifat'],
  [/UN-Ranking|E-Government-Ranking/i, 'Lage (UN-Ranking)'],
  [/Missionstext|Unsere Vision/i, 'Vision'],
  [/Beispielgemeinde Musterbach\s*\(erfunden\)\s*grau/i, 'Platzhalter'],
  [/Alle Preise zzgl/i, 'Preishinweis, obwohl die Seite keinen Preis nennt'],
  [/Kennenlerntermin buchen/, 'zweiten Terminknopf (derselbe Termin wie „Erstgespräch buchen“)'],
  [/(?:Pösken|Steffen) zeigen/, 'Beraterkarte (Tobias und Leon stehen schon im Team)'],
  // Hero und Vorher/Nachher beruhigt (Owner 26.10.2026: „dieses Ding mit www.musterbach.de, das ist komplett überfordernd“;
  // „diese Dinger noch abgehen, das packen wir alles schön wie bei Tobi gebündelt unter diese vorher nacher schieber“)
  [/www\.musterbach\.de/, 'Adresse www.musterbach.de (Browser-Leiste)'],
  [/Art\. 32 DSGVO|WCAG 2\.1 AA/, 'Hinweiskästchen der alten Hero-Karte'],
  [/von 5 erfüllt|Alles erfüllt|Prüfung läuft/, 'Prüfliste der alten Hero-Karte („5 von 5 erfüllt“)'],
  [/PHP 8\.4 – aktuell|Schriften vom eigenen Server|Kontrast geprüft/, 'verstreute Marken um das Vorher/Nachher (stehen in der Befund-Liste)'],
  // Kein Widerspruch zu Befund 3 („Barrierefreiheits-Erklärung fremd: vom Hersteller, aus 2021“) am selben Musterbach
  [/Erklärung zur Barrierefreiheit\s+(?:fehlt|vorhanden)|Keine Erklärung zur Barrierefreiheit/, 'Aussage zur Erklärung, die Befund 3 am selben Musterbach widerspricht'],
  [/aus einer echten Prüfung/i, '„aus einer echten Prüfung“ (die Befunde sind eine Demo)'],
  [/Ortrand|Ortsrand/, 'Eintrag „Amt Ortrand“ im Laufband der Kunden (Owner: „amt ortsrand muss raus, das gibt es nicht“)'],
]) {
  const treffer = alles.match(muster);
  if (treffer) fehler.push(`sichtbarer Text enthält ${was} („${treffer[0]}“)`);
}
for (const id of ['leistungen', 'schulungen', 'lage', 'recht', 'vision']) {
  if (new RegExp(`id="${id}"`).test(html)) fehler.push(`Abschnitt #${id} steht im HTML (muss ausgeblendet sein)`);
  if (new RegExp(`href="/?#${id}"`).test(html)) fehler.push(`Link auf den ausgeblendeten Abschnitt #${id}`);
}

// ---- Nie zweimal „sicher“ ----------------------------------------------------------------------------------------
if (/rechtssicher/i.test(alles)) fehler.push('„rechtssicher“ steht auf der Seite');
for (const m of alles.matchAll(/\bsicher(?:e|en|er|es)?\b(?:\W+\w+){0,2}?\W+\bsicher(?:e|en|er|es)?\b/gi)) {
  fehler.push(`zweimal „sicher“ dicht hintereinander: „${m[0]}“`);
}

// ---- Inhalte und Reihenfolge ---------------------------------------------------------------------------------------
const pflicht = [
  'Ihr digitales Ortseingangsschild',
  'Websites für Gemeinden, Ämter und Behörden',
  'Die Website ist das Erste, was Bürgerinnen, Bürger und Unternehmen von Ihrer Gemeinde sehen. Wir machen Ihre Website sicher, barrierefrei und rechtskonform.',
  'Kostenlose Vorschau anfragen',
  'Eine Website, die Ihre Gemeinde gut vertritt.',
  'Was Ihre Gemeinde hinter sich lässt.',
  'Rechtskonform',
  // Vorher/Nachher
  'Offizielle Homepage der Gemeinde',
  'Herzlich Willkommen auf der Homepage der Gemeinde Musterbach',
  'Aktuelle Mitteilungen',
  'Google Maps lädt sofort',
  'optimiert für 1024×768',
  'Vollsperrung der Bachstraße ab Montag',
  'Willkommen im Rathaus: kurze Wege, alles Wichtige auf einer Seite.',
  'Wonach suchen Sie?',
  'Rathaus anrufen',
  'Beispielgemeinde Musterbach',
  // Problem (drei Aussagen) und Befund-Liste unter dem Vorher/Nachher (Beispielbefunde, Demo)
  'Veraltete Technik',
  'Barrierefreiheit mit Lücken',
  'Vermeidbare Rechtsrisiken',
  'Befunde an der Beispielgemeinde',
  '0 von 6 Befunden offen',
  'Google-Karten ohne Einwilligung',
  'Datenschutzerklärung unvollständig',
  'Barrierefreiheits-Erklärung fremd',
  'Bilder ohne Beschreibung',
  'Zoomen am Handy gesperrt',
  'Kein Sprung zum Inhalt',
  'Alle sechs Punkte sind gesetzliche Vorgaben für öffentliche Stellen.',
  'Beispielbefunde an der Beispielgemeinde Musterbach (erfunden)',
  // Angebot
  'Das Angebot',
  'Ihre neue Website ist fertig, bevor Sie Ja sagen.',
  'Vorschau mit Ihren eigenen Inhalten',
  'Etwa zwei Wochen bis live',
  'Fester Jahresbetrag, vorher bekannt',
  'Technik, Updates und Hosting in Deutschland',
  'Übliches Projekt',
  'Pflichtenheft und Angebote einholen',
  'Mehrere Monate Umbau',
  'Offen, mit Nachträgen',
  'Wartung extra beauftragen',
  'Technik, Updates und Sicherheit inklusive',
  'Ohne Cookies und Tracking',
  'Barrierefrei nach BITV 2.0, mit eigener Erklärung',
  'Redaktion für das ganze Rathaus',
  'In den Farben Ihres Wappens',
  'Ihre Inhalte ziehen mit um',
  'Alte Links funktionieren weiter',
  'Preis auf Anfrage.',
  'Ihr Angebot kommt mit der Vorschau.',
  // Ablauf
  'Vom Brief zur neuen Website.',
  'Vorschau mit Ihren Inhalten',
  'Erst dann gibt es einen Vertrag.',
  'Etwa zwei Wochen nach der Freigabe',
  // Team und Kontakt
  'Tobias Steffen',
  'Gründer von SmartAmt',
  'Entwickler aus Leipzig. Löst, woran andere scheitern: seit Jahren für Mittelstand und Verwaltung, mehr als 50 Digitalprojekte.',
  'tobiassteffen.com',
  'Leon Pösken',
  'Kaufmann und NGO-Gründer aus Leipzig. IT aus Überzeugung: bringt Verwaltung und Technik an einen Tisch.',
  '01556 6579408',
  'leon@smartamt.de',
  '0341 97853441',
  'Vorschau anfragen',
  'Etwas anderes',
];
for (const text of pflicht) if (!alles.includes(text)) fehler.push(`„${text}“ fehlt auf der Seite`);

const ids = ['start', 'kunden', 'ortsausgang', 'websites', 'angebot', 'ablauf', 'referenzen', 'ueber-uns', 'faq', 'kontakt'];
let letzte = -1;
for (const id of ids) {
  const stelle = html.indexOf(`id="${id}"`);
  if (stelle < 0) fehler.push(`Abschnitt #${id} fehlt`);
  else if (stelle < letzte) fehler.push(`Abschnitt #${id} steht an der falschen Stelle (Reihenfolge: ${ids.join(' → ')})`);
  else letzte = stelle;
}

// Menü: Websites · Angebot · Ablauf · Referenzen · Über uns · Kontakt
const menue = [...(html.match(/<nav aria-label="Hauptnavigation"[\s\S]*?<\/nav>/)?.[0] ?? '').matchAll(/<a [^>]*>([^<]*)<\/a>/g)].map((m) => m[1]);
if (menue.join('|') !== 'Websites|Angebot|Ablauf|Referenzen|Über uns|Kontakt') fehler.push(`Menü ist „${menue.join(' · ')}“`);

// Fragen: genau sechs, ohne KI und Schulung
const fragen = (html.match(/<details\b/g) ?? []).length;
if (fragen !== 6) fehler.push(`erwartet 6 Fragen, gefunden ${fragen}`);
for (const frage of [
  'Was kostet die Website?',
  'Müssen wir das ausschreiben?',
  'Was passiert mit unseren Inhalten?',
  'Wem gehören Inhalte und Domain?',
  'Wie lange binden wir uns?',
  'Wer kümmert sich nach dem Livegang?',
]) {
  if (!alles.includes(frage)) fehler.push(`Frage „${frage}“ fehlt`);
}

// Ablauf: vier Schritte
const schritte = (html.match(/data-schritt/g) ?? []).length;
if (schritte !== 4) fehler.push(`Ablauf: erwartet 4 Schritte, gefunden ${schritte}`);

// Team: genau zwei Personen mit Foto
for (const foto of ['tobias-steffen.webp', 'leon-poesken.webp']) if (!html.includes(foto)) fehler.push(`Foto ${foto} fehlt im HTML`);
if (html.includes('eremiya-rifat')) fehler.push('Foto von Eremiya Rifat steht im HTML');
// Tobias’ Link: tobiassteffen.com, neuer Tab, noopener; die alten Rollen stehen nicht mehr auf der Seite
if (!/<a [^>]*href="https:\/\/www\.tobiassteffen\.com\/"[^>]*target="_blank"[^>]*rel="noopener"|<a [^>]*href="https:\/\/www\.tobiassteffen\.com\/"[^>]*rel="noopener"[^>]*target="_blank"/.test(html)) fehler.push('Link auf tobiassteffen.com (neuer Tab, noopener) fehlt');
if (html.includes('leonposken.vercel.app')) fehler.push('Link auf leonposken.vercel.app ist raus (Owner 27.10.2026)');
if (/Ihr Ansprechpartner|Technik, Angebot, Vertrag|Ruft Sie an, beantwortet/.test(alles)) fehler.push('alte Rolle oder alter Satz („Ihr Ansprechpartner“, „Technik, Angebot, Vertrag“, „Ruft Sie an …“) steht auf der Seite');

// Formular: nur „Vorschau anfragen“ und „Etwas anderes“
const optionen = [...html.matchAll(/<input[^>]*name="anliegen"[^>]*>/g)].length;
if (optionen !== 2) fehler.push(`Formular: erwartet 2 Anliegen, gefunden ${optionen}`);

// Websites: Wisch UND sechs Befund-Karten stehen im selben Bild (Owner: „Das ist mit dem Scroll verbunden, aber kein Mensch, es
// kann gar keiner sehen, weil es in der nächsten Sektion sitzt“; so wie bei Tobi). Ein Regler (role="slider"), sechs Karten,
// die Leiste „Vorher | n von 6 Befunden offen | Nachher“ und keine zweite Befund-Tabelle.
{
  const websites = html.slice(html.indexOf('id="websites"'), html.indexOf('id="angebot"'));
  const regler = (websites.match(/role="slider"/g) ?? []).length;
  if (regler !== 1) fehler.push(`Websites: erwartet 1 Regler (role="slider"), gefunden ${regler}`);
  const karten = (websites.match(/data-befund="true"/g) ?? []).length;
  if (karten !== 6) fehler.push(`Websites: erwartet 6 Befund-Karten, gefunden ${karten}`);
  const reglerPos = websites.indexOf('role="slider"');
  const kartenPos = websites.indexOf('data-befund="true"');
  const gruppe = websites.indexOf('aria-labelledby="befunde-karten-titel"');
  const gruppeEnde = websites.indexOf('musterbach-unterschrift');
  if (gruppe < 0 || reglerPos < gruppe || kartenPos < reglerPos || kartenPos > gruppeEnde) fehler.push('Websites: Regler und Befund-Karten stehen nicht im selben Bild');
  if (/id="befunde-titel"/.test(websites)) fehler.push('Websites: die frühere Befund-Tabelle steht noch im HTML (Schalter befundTabelle muss false sein)');
}

// Angebot: „Hosting in Deutschland“ genau einmal (Punkt 04), nicht noch einmal bei den Merkmalen
const angebot = html.slice(html.indexOf('id="angebot"'), html.indexOf('id="ablauf"'));
const hosting = angebot.split('Hosting in Deutschland').length - 1;
if (hosting !== 1) fehler.push(`Angebot: „Hosting in Deutschland“ steht ${hosting}-mal, erwartet einmal`);

// Datenschutz: nennt nur Felder, die das Formular abfragt (die Schulungs-Anliegen sind ausgeblendet)
const datenschutz = path.join(path.dirname(datei), 'datenschutz', 'index.html');
if (!fs.existsSync(datenschutz)) fehler.push(`${datenschutz} fehlt`);
else if (/Schulungsort|Teilnehmerzahl/.test(fs.readFileSync(datenschutz, 'utf8'))) {
  fehler.push('Datenschutz nennt Schulungsfelder, die das Formular nicht mehr abfragt');
}

fertig('V2-AUSGABE', fehler);
