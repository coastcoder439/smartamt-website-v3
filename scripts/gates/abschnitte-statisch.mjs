// Gate Website v2 und v3 (Quelltext): Ausgeblendet heißt nicht gelöscht, und die sichtbare Seite hält die Owner-Vorgaben.
// v3 (docs/packages/03-website-v3): Team und Fragen stehen nicht mehr auf der Startseite, sondern auf /ueber-uns und /fragen
// (Schalter ueber-uns und faq auf false, die Seiten müssen die Komponenten zeigen); das Menü nennt Angebot, Ablauf, Kontakt
// und die beiden Seiten; Recht & Sicherheit ist auf /fragen sichtbar und unterliegt darum auch der Regel „nie rechtssicher“.
// Geprüft wird im Quelltext (kein Browser, kein Build nötig); das Ergebnis im gebauten Export prüft v2-ausgabe.mjs.
//
//  1. Schalter (src/lib/abschnitte.ts): Leistungen, Schulungen, Lage, Recht, Vision und die Einzelteile (Hero-Knopf
//     „KI-Fortbildung ansehen“, Ablaufschritt Schulung, Eremiya Rifat, Anliegen KI-Fortbildung und IT-Schulung, FAQ zu
//     Schulungen) stehen auf false; Angebot, Ablauf, Websites, Referenzen, Über uns, Fragen und Kontakt auf true.
//  2. Nichts gelöscht: die Komponenten, Bilder und Texte der ausgeblendeten Teile liegen weiter im Code; page.tsx bindet sie
//     über die Schalter ein (nicht entfernt).
//  3. Menü, Sprungleiste und Fuß kommen aus den Schaltern (kein fest verdrahteter Link auf einen ausgeblendeten Abschnitt).
//  4. Nie zweimal „sicher“ (Owner: „nicht zweimal sicher hintereinander“): „rechtssicher“ steht in keiner Datei der sichtbaren
//     Seite; das Band heißt „Sicher. Funktional. Rechtskonform.“.
//  5. Leon Pösken: Nummer 01556 6579408, E-Mail leon@smartamt.de, Foto vorhanden, steht an der Stelle von Eremiya Rifat.
//  6. Vorher/Nachher ohne Platzhalter: die gezeichneten Seiten tragen die Bausteine aus Entscheidung 5.
import { existiert, lies, quellen, fertig } from './_lib.mjs';

const fehler = [];

// ---- 1. Schalter -------------------------------------------------------------------------------
const schalter = lies('src/lib/abschnitte.ts');
const wert = (name) => {
  const m = schalter.match(new RegExp(`['"]?${name}['"]?\\s*:\\s*(true|false)`));
  return m ? m[1] : null;
};
for (const id of ['leistungen', 'schulungen', 'lage', 'recht', 'vision']) {
  if (wert(id) !== 'false') fehler.push(`abschnitte.ts: Abschnitt ${id} muss ausgeblendet sein (false), ist ${wert(id)}`);
}
for (const id of ['websites', 'angebot', 'ablauf', 'referenzen', 'kontakt']) {
  if (wert(id) !== 'true') fehler.push(`abschnitte.ts: Abschnitt ${id} muss sichtbar sein (true), ist ${wert(id)}`);
}
// v3: Team und Fragen auf den Unterseiten, nicht auf der Startseite
for (const id of ['ueber-uns', 'faq']) {
  if (wert(id) !== 'false') fehler.push(`abschnitte.ts: Abschnitt ${id} steht in v3 auf einer Unterseite (false auf der Startseite), ist ${wert(id)}`);
}
for (const name of ['heroKnopfSchulung', 'ablaufSchrittSchulung', 'teamEremiyaRifat', 'anliegenSchulung', 'anliegenItSchulung', 'faqSchulung', 'problemKarten', 'problemBandSatz', 'heroWebsiteCheck',
  // v3: kurze Startseite (Plan 03-website-v3, Punkt 1), alles nur ausgeblendet
  'ablaufEigenerAbschnitt', 'heroErsterSatz', 'kundenUnterHero', 'kundenZweiteSpur', 'referenzenBand', 'angebotVergleich', 'angebotMerkmale', 'angebotSchlusskarte', 'websitesPruefliste', 'kontaktErstgespraechBand', 'lageSchulungen', 'rechtKi', 'heroSprungzeile']) {
  if (wert(name) !== 'false') fehler.push(`abschnitte.ts: ${name} muss ausgeblendet sein (false), ist ${wert(name)}`);
}
if (!/Die kannst du ja alle quasi ausblenden, archivieren/.test(schalter)) fehler.push('abschnitte.ts: Owner-Zitat zum Ausblenden fehlt im Kommentar');

// ---- 2. Nichts gelöscht --------------------------------------------------------------------------
const AUSGEBLENDET = [
  'src/components/sections/Leistungen.tsx',
  'src/components/sections/Schulungen.tsx',
  'src/components/sections/Lage.tsx',
  'src/components/sections/Recht.tsx',
  'src/components/sections/Vision.tsx',
  'src/components/sections/c2/MiniBrowser.tsx',
  'src/components/sections/c2/kurs-schreibtisch.webp',
  'src/components/sections/b2/Rangliste.tsx',
  // ausgeblendet über Schalter in EINZELNES (Nachtrag 1: Problem-Abschnitt gekürzt, Hero-Karte beruhigt)
  'src/components/sections/c1/ProblemKarten.tsx',
  'src/components/sections/c1/MiniAnsichten.tsx',
  'src/components/sections/hero/WebsiteCheck.tsx',
  'src/components/sections/c3/Akkordeon.tsx',
  'public/images/team/eremiya-rifat.webp',
  'public/images/schulung/karte-arbeitsalltag.webp',
  'public/images/schulung/modul-grundlagen.png',
  // v3: auf der Startseite ausgeblendet oder auf Unterseiten umgezogen
  'src/components/sections/Ablauf.tsx',
  'src/components/sections/Referenzen.tsx',
  'src/components/sections/c3/ReferenzBand.tsx',
  'src/components/sections/b2/Pruefliste.tsx',
  'src/components/sections/c2/BriefBild.tsx',
  'src/components/sections/Team.tsx',
  'src/components/sections/Faq.tsx',
];
for (const rel of AUSGEBLENDET) if (!existiert(rel)) fehler.push(`${rel}: Datei fehlt (ausgeblendet heißt nicht gelöscht)`);

const seite = lies('src/app/page.tsx');
for (const [komponente, id] of [
  ['Leistungen', 'leistungen'],
  ['Schulungen', 'schulungen'],
  ['Lage', 'lage'],
  ['Recht', 'recht'],
  ['Vision', 'vision'],
]) {
  if (!new RegExp(`import ${komponente} from '@/components/sections/${komponente}'`).test(seite)) fehler.push(`page.tsx: ${komponente} nicht mehr eingebunden (nur ausblenden, nicht entfernen)`);
  if (!new RegExp(`ABSCHNITTE\\.${id}\\s*\\?\\s*<${komponente} />`).test(seite)) fehler.push(`page.tsx: ${komponente} hängt nicht am Schalter ABSCHNITTE.${id}`);
}
if (!/ABSCHNITTE\.angebot\s*\?\s*<Angebot \/>/.test(seite)) fehler.push('page.tsx: Angebot hängt nicht am Schalter ABSCHNITTE.angebot');
// v3: die früheren Startseiten-Teile hängen weiter an ihren Schaltern (nicht entfernt)
for (const [muster, was] of [
  [/ABSCHNITTE\.ablauf && EINZELNES\.ablaufEigenerAbschnitt \? <Ablauf \/>/, 'Ablauf am Schalter ablaufEigenerAbschnitt'],
  [/EINZELNES\.referenzenBand \? <Referenzen \/> : <Stimmen \/>/, 'Referenzen-Band am Schalter referenzenBand'],
  [/ABSCHNITTE\['ueber-uns'\] \? <Team \/>/, 'Team am Schalter ueber-uns'],
  [/ABSCHNITTE\.faq \? <Faq \/>/, 'Fragen am Schalter faq'],
  [/EINZELNES\.kundenUnterHero \? <Kunden \/>/, 'Kunden am Schalter kundenUnterHero'],
]) {
  if (!muster.test(seite)) fehler.push(`page.tsx: ${was} fehlt (nur ausblenden, nicht entfernen)`);
}
// v3: die Unterseiten zeigen, was von der Startseite umgezogen ist (Plan 03-website-v3, Punkt 2 und 3)
for (const [rel, komponenten] of [
  ['src/app/ueber-uns/page.tsx', ['Leitbild', 'Vision', 'Lage', 'Team']],
  ['src/app/fragen/page.tsx', ['Faq', 'Recht']],
]) {
  if (!existiert(rel)) {
    fehler.push(`${rel} fehlt`);
    continue;
  }
  const text = lies(rel);
  for (const k of komponenten) if (!new RegExp(`<${k}(?: [^>]*)? />`).test(text)) fehler.push(`${rel}: <${k} /> fehlt`);
}
const angebotQuelle = lies('src/components/sections/Angebot.tsx');
for (const name of ['angebotVergleich', 'angebotMerkmale', 'angebotSchlusskarte', 'ablaufEigenerAbschnitt']) {
  if (!new RegExp(`EINZELNES\.${name}`).test(angebotQuelle)) fehler.push(`Angebot.tsx: Teil am Schalter ${name} fehlt (nur ausblenden)`);
}
for (const text of ['Übliches Projekt', 'Ohne Cookies und Tracking', 'Preis auf Anfrage.']) {
  if (!angebotQuelle.includes(text)) fehler.push(`Angebot.tsx: „${text}“ ist aus dem Code verschwunden (nur ausblenden)`);
}

const personen = lies('src/components/sections/c3/personen.ts');
if (!/Eremiya Rifat/.test(personen) || !/eremiya-rifat\.webp/.test(personen)) fehler.push('personen.ts: Eremiya Rifat ist aus dem Code verschwunden (nur ausblenden)');

const ablauf = lies('src/components/sections/Ablauf.tsx');
if (!/titel: 'Schulung'/.test(ablauf)) fehler.push('Ablauf.tsx: der Schritt „Schulung“ ist aus dem Code verschwunden (nur ausblenden)');
const faq = lies('src/components/sections/Faq.tsx');
if (!/Was kostet die KI-Fortbildung\?/.test(faq)) fehler.push('Faq.tsx: die Fragen zu KI und Schulungen sind aus dem Code verschwunden (nur ausblenden)');
const anliegen = lies('src/components/sections/b3/anliegen.ts');
for (const text of ['KI-Fortbildung anfragen', 'IT-Schulung anfragen']) {
  if (!anliegen.includes(text)) fehler.push(`anliegen.ts: Anliegen „${text}“ ist aus dem Code verschwunden (nur ausblenden)`);
}

// ---- 3. Menü, Sprungleiste, Fuß aus den Schaltern --------------------------------------------------
const site = lies('src/lib/site.ts');
if (!/MENUE[^=]*=\s*MENUE_ALLE\.filter\(\(m\)\s*=>\s*m\.href !== undefined \|\| abschnittSichtbar\(m\.id\)\)/.test(site)) fehler.push('site.ts: MENUE wird nicht aus den Schaltern gefiltert');
const sprung = lies('src/components/layout/leistungen.ts');
if (!/ALLE\.filter\(\(l\)\s*=>\s*abschnittSichtbar\(l\.id\)\)/.test(sprung)) fehler.push('leistungen.ts: die Sprungziele werden nicht aus den Schaltern gefiltert');
const menueIds = [...site.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
for (const id of ['angebot', 'ablauf', 'kontakt']) {
  if (!menueIds.includes(id)) fehler.push(`site.ts: Menüpunkt ${id} fehlt`);
}
for (const href of ['/ueber-uns/', '/fragen/']) {
  if (!site.includes(`href: '${href}'`)) fehler.push(`site.ts: Menüpunkt ${href} fehlt`);
}
const hero = lies('src/components/sections/Hero.tsx');
const kopf = lies('src/components/layout/Header.tsx');
const fuss = lies('src/components/layout/Footer.tsx');
for (const [name, text] of [['Hero.tsx', hero], ['Header.tsx', kopf], ['Footer.tsx', fuss]]) {
  for (const id of ['schulungen', 'recht', 'leistungen', 'lage', 'vision']) {
    if (new RegExp(`(href=["'\`]/#${id}|AnkerLink id=["']${id}|handleAnchorClick\\(e,\\s*'${id}')`).test(text) && !/EINZELNES\.heroKnopfSchulung/.test(text)) {
      fehler.push(`${name}: fest verdrahteter Link auf den ausgeblendeten Abschnitt ${id}`);
    }
  }
}
if (!/Kostenlose Vorschau anfragen/.test(hero)) fehler.push('Hero.tsx: Hauptknopf „Kostenlose Vorschau anfragen“ fehlt');
if (!/Websites für Gemeinden, Ämter und Behörden/.test(hero)) fehler.push('Hero.tsx: Label „Websites für Gemeinden, Ämter und Behörden“ fehlt');
if (!hero.replace(/\s+/g, ' ').includes('Wir machen Ihre Website sicher, barrierefrei und rechtskonform.')) fehler.push('Hero.tsx: Hero-Text „… Wir machen Ihre Website sicher, barrierefrei und rechtskonform.“ fehlt');
if (!/Vorschau anfragen/.test(kopf)) fehler.push('Header.tsx: Knopf „Vorschau anfragen“ fehlt');
const titel = site.match(/SITE_TITLE\s*=\s*'([^']*)'/)?.[1] ?? '';
const beschreibung = site.match(/SITE_DESCRIPTION\s*=\s*'([^']*)'/)?.[1] ?? '';
if (titel !== 'SmartAmt – Sichere Websites für Gemeinden') fehler.push(`site.ts: Seitentitel ist „${titel}“, erwartet „SmartAmt – Sichere Websites für Gemeinden“`);
if (!beschreibung || /\bKI\b|Schulung|Fortbildung|schult/.test(beschreibung)) fehler.push('site.ts: Beschreibung fehlt oder nennt KI oder Schulung');

// ---- 4. Nie zweimal „sicher“ ---------------------------------------------------------------------------
const SICHTBARE_AUSNAHMEN = new Set([
  // ausgeblendete Abschnitte (bleiben im Code, werden nicht angezeigt); Recht.tsx ist in v3 auf /fragen sichtbar und darum
  // keine Ausnahme mehr
  'src/components/sections/Leistungen.tsx',
]);
for (const rel of quellen()) {
  if (SICHTBARE_AUSNAHMEN.has(rel)) continue;
  const text = lies(rel);
  if (/rechtssicher/i.test(text.replace(/Nie zweimal[^\n]*|nie „sicher“ und „rechtssicher“[^\n]*|statt „Rechtssicher“[^\n]*/g, ''))) {
    fehler.push(`${rel}: „rechtssicher“ steht in der sichtbaren Seite (Owner: nicht zweimal sicher hintereinander)`);
  }
}
const problem = lies('src/components/sections/Problem.tsx');
if (!/ABSCHLUSS_WOERTER = \['Sicher', 'Funktional', 'Rechtskonform'\]/.test(problem)) fehler.push("Problem.tsx: das Band muss 'Sicher', 'Funktional', 'Rechtskonform' heißen");
const pruef = lies('src/components/sections/b2/Pruefliste.tsx');
if (!/begriff: 'Rechtskonform'/.test(pruef)) fehler.push('Pruefliste.tsx: „Rechtssicher“ muss „Rechtskonform“ heißen');
const mini = lies('src/components/sections/c2/MiniBrowser.tsx');
if (!/\['Sicher', 'Barrierefrei', 'Rechtskonform'\]/.test(mini)) fehler.push('MiniBrowser.tsx: PUNKTE müssen Sicher, Barrierefrei, Rechtskonform heißen');

// ---- 5. Leon Pösken --------------------------------------------------------------------------------------
if (!/telefon:\s*'01556 6579408'/.test(site)) fehler.push('site.ts: Leons Nummer 01556 6579408 fehlt');
if (!/email:\s*'leon@smartamt\.de'/.test(site)) fehler.push('site.ts: Leons E-Mail leon@smartamt.de fehlt');
if (!/telefon:\s*'0341 97853441'/.test(site)) fehler.push('site.ts: Tobias’ Nummer 0341 97853441 fehlt');
if (!existiert('public/images/team/leon-poesken.webp')) fehler.push('public/images/team/leon-poesken.webp fehlt');
if (!/rolle: 'Gründer von SmartAmt'/.test(personen) || !/rolle: 'Entwickler'/.test(personen)) fehler.push('personen.ts: Rollen „Gründer von SmartAmt“ und „Entwickler“ fehlen');
if (/Ansprechpartner'|Technik, Angebot, Vertrag|Ruft Sie an/.test(personen)) fehler.push('personen.ts: alte Rollen oder Sätze („Ihr Ansprechpartner“, „Technik, Angebot, Vertrag“, „Ruft Sie an …“) stehen noch drin');
if (!/Kaufmann und NGO-Gründer aus Leipzig\. IT aus Überzeugung: bringt Verwaltung und Technik an einen Tisch\./.test(personen)) fehler.push('personen.ts: Leons Satz (Kaufmann und NGO-Gründer) fehlt');
if (!/Entwickler aus Leipzig\. Löst, woran andere scheitern: seit Jahren für Mittelstand und Verwaltung, mehr als 50 Digitalprojekte\./.test(personen)) fehler.push('personen.ts: Tobias Satz fehlt');
if (!/https:\/\/www\.tobiassteffen\.com\//.test(personen)) fehler.push('personen.ts: Link auf tobiassteffen.com fehlt');
if (/leonposken\.vercel\.app/.test(personen)) fehler.push('personen.ts: Link auf leonposken.vercel.app ist raus (Owner 27.10.2026)');
if (!/ANSPRECHPARTNER[^=]*=\s*\[LEON_POESKEN,\s*TOBIAS_STEFFEN\]/.test(personen)) fehler.push('personen.ts: im Kontakt muss Leon der erste Ansprechpartner sein');

// ---- 6. Vorher/Nachher ohne Platzhalter ------------------------------------------------------------------------
const seiten = lies('src/components/sections/b2/MusterbachSeiten.tsx').replace(/\s+/g, ' ');
for (const text of [
  'Offizielle Homepage der Gemeinde',
  '+++ Herzlich Willkommen auf der Homepage der Gemeinde Musterbach +++',
  'Startseite',
  'Bürgerservice',
  'Aktuelle Mitteilungen',
  'Besucher: 0048213',
  'Google Maps lädt sofort',
  'optimiert für 1024×768',
  'Vollsperrung der Bachstraße ab Montag',
  'Wonach suchen Sie?',
  'Rathaus anrufen',
  'Willkommen im Rathaus: kurze Wege, alles Wichtige auf einer Seite.',
  'Abfallkalender',
  'Rathaus & Öffnungszeiten',
  'Rathaus',
  'Service',
  'Aktuelles',
  'Leben',
]) {
  if (!seiten.includes(text)) fehler.push(`MusterbachSeiten.tsx: „${text}“ fehlt`);
}
if (!/<svg viewBox="0 0 1000 212"/.test(seiten) || !/Kirchturm|Kirche/.test(seiten)) fehler.push('MusterbachSeiten.tsx: die gezeichnete Silhouette (Haus, Kirchturm, Bäume) fehlt');
if (/Platzhalter|vStreifen|vBanner/.test(lies('src/components/sections/b2/Vergleich.module.css') + seiten)) fehler.push('Vergleich: Reste des alten Platzhalters');

// ---- 7. v3: Punktraster nur noch im Hero (Owner 27.10.2026: „aber nicht überall diese gepunkteten Hintergründe … Das sieht sehr nach KI aus.“) --
if (wert('punktraster') !== 'false') fehler.push('abschnitte.ts: punktraster muss false sein (Punktraster nur im Hero)');
if (!/EINZELNES\.punktraster \? '' : ' punkte-aus'/.test(lies('src/app/layout.tsx'))) fehler.push('layout.tsx: Klasse punkte-aus am <html> hängt nicht am Schalter punktraster');
if (!/\.punkte-aus \.dot-grid \{\s*background-image: none !important;/.test(lies('src/styles/globals.css'))) fehler.push('globals.css: Regel .punkte-aus .dot-grid fehlt');
if (!existiert('src/components/sections/c2/Licht.tsx')) fehler.push('Licht.tsx fehlt (Raster nur abschalten, nicht löschen)');
fertig('ABSCHNITTE-STATISCH', fehler);
