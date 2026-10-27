// Gate Website v3 (gebauter Export): Was der Besucher sieht, ist das, was der Owner wollte. Liest `out/index.html`,
// `out/ueber-uns/index.html` und `out/fragen/index.html` (nach `npm run build`), braucht keinen Server und kein Netz.
// Abgeleitet aus v2-ausgabe.mjs (bleibt als Prüfung der Fassung v2 liegen); jede Prüfung von dort gilt hier weiter, nur der
// Ort folgt dem Plan von 03-website-v3: Team auf /ueber-uns, Fragen auf /fragen.
//
//   node scripts/gates/v3-ausgabe.mjs [out]
//
//  - Alle drei Seiten: kein KI, keine Schulung, kein Eremiya Rifat, nie „rechtssicher“, nie zweimal „sicher“ dicht hintereinander,
//    keine Reste der alten Hero-Karte und des Platzhalters, keine Beraterkarte, kein Preishinweis ohne Preis; Menü
//    Angebot · Ablauf · Kontakt · Über uns · Fragen; Festnetz 0341.
//  - Startseite: Titel und Beschreibung ohne KI; Reihenfolge Hero → Problem → Beweis → Angebot samt Ablauf → Vertrauen →
//    Kontakt; Hero mit einem Satz und Festnetz; Vorher/Nachher mit Regler und sechs Befund-Karten im selben Bild; vier Vorteile,
//    vier Schritte; Logo-Band, zwei Zitate, Link auf „Über uns“; Kontakt mit Leon und Tobias als Porträt, Name, Rolle und
//    direkten Wegen; Formular mit zwei Anliegen; Lage, Mission, Team-Sektion und Fragen
//    stehen nicht auf der Startseite; höchstens 900 Wörter im Hauptteil (Plan: rund 800).
//  - /ueber-uns: Leitbild mit fünf Punkten, Dänemark und Estland (nie Schweden oder Norwegen), Platz 12, Team Tobias und Leon mit
//    den Texten aus c3/personen.ts, NX7.AGENCY.
//  - /fragen: genau sechs Fragen, Recht & Sicherheit mit vier Grundlagen ohne KI-Verordnung.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, fertig } from './_lib.mjs';

const ordner = path.resolve(ROOT, process.argv[2] ?? 'out');
const fehler = [];

function lade(rel) {
    const datei = path.join(ordner, rel);
    if (!fs.existsSync(datei)) {
        fehler.push(`${datei} fehlt: zuerst npm run build`);
        return null;
    }
    const html = fs.readFileSync(datei, 'utf8');
    const sichtbar = html
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        .replace(/<style[\s\S]*?<\/style>/g, ' ')
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
    return { html, alles: `${sichtbar} ${attribute}` };
}

const start = lade('index.html');
const ueber = lade('ueber-uns/index.html');
const fragen = lade('fragen/index.html');
if (!start || !ueber || !fragen) fertig('V3-AUSGABE', fehler);

// ---- Alle Seiten -----------------------------------------------------------------------------------------------
const VERBOTEN = [
    [/\bKI\b|KI-/, 'KI'],
    [/Schulung|Fortbildung|Schulungsleiter/i, 'Schulung oder Fortbildung'],
    [/Eremiya|Rifat/, 'Eremiya Rifat'],
    [/Beispielgemeinde Musterbach\s*\(erfunden\)\s*grau/i, 'Platzhalter'],
    [/Alle Preise zzgl/i, 'Preishinweis, obwohl die Seite keinen Preis nennt'],
    [/Kennenlerntermin buchen/, 'zweiten Terminknopf'],
    [/(?:Pösken|Steffen) zeigen/, 'Beraterkarte'],
    [/www\.musterbach\.de/, 'Adresse www.musterbach.de (Browser-Leiste)'],
    [/von 5 erfüllt|Alles erfüllt|Prüfung läuft/, 'Prüfliste der alten Hero-Karte'],
    [/aus einer echten Prüfung/i, '„aus einer echten Prüfung“ (die Befunde sind eine Demo)'],
    [/Ortrand|Ortsrand/, 'Eintrag „Amt Ortrand“'],
    [/rechtssicher/i, '„rechtssicher“'],
    [/Schweden|Norwegen/, 'Schweden oder Norwegen (Vorbild sind Dänemark und Estland, Konzept E1)'],
];
for (const [name, seite] of [
    ['Startseite', start],
    ['/ueber-uns', ueber],
    ['/fragen', fragen],
]) {
    for (const [muster, was] of VERBOTEN) {
        const treffer = seite.alles.match(muster);
        if (treffer) fehler.push(`${name}: sichtbarer Text enthält ${was} („${treffer[0]}“)`);
    }
    for (const m of seite.alles.matchAll(/\bsicher(?:e|en|er|es)?\b(?:\W+\w+){0,2}?\W+\bsicher(?:e|en|er|es)?\b/gi)) {
        fehler.push(`${name}: zweimal „sicher“ dicht hintereinander: „${m[0]}“`);
    }
    for (const id of ['leistungen', 'schulungen']) {
        if (new RegExp(`id="${id}"`).test(seite.html)) fehler.push(`${name}: Abschnitt #${id} steht im HTML (ausgeblendet)`);
        if (new RegExp(`href="/?#${id}"`).test(seite.html)) fehler.push(`${name}: Link auf den ausgeblendeten Abschnitt #${id}`);
    }
    const nav = seite.html.match(/<nav aria-label="Hauptnavigation"[\s\S]*?<\/nav>/)?.[0] ?? '';
    const menue = [...nav.matchAll(/<a [^>]*>([^<]*)<\/a>/g)].map((m) => m[1]);
    if (menue.join('|') !== 'Angebot|Ablauf|Kontakt|Über uns|Fragen') fehler.push(`${name}: Menü ist „${menue.join(' · ')}“`);
    if (!/href="\/ueber-uns\/"/.test(seite.html) || !/href="\/fragen\/"/.test(seite.html)) fehler.push(`${name}: Links auf /ueber-uns/ und /fragen/ fehlen`);
    if (!seite.alles.includes('0341 97853441')) fehler.push(`${name}: Festnetz 0341 97853441 fehlt`);
}

// ---- Startseite ----------------------------------------------------------------------------------------------------
{
    const { html, alles } = start;
    const titel = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    if (titel !== 'SmartAmt – Sichere Websites für Gemeinden') fehler.push(`Startseite: title ist „${titel}“`);
    const beschreibung = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
    if (!beschreibung || /\bKI\b|Schulung|Fortbildung|schult/.test(beschreibung)) fehler.push('Startseite: meta description fehlt oder nennt KI oder Schulung');
    if (/KI-Schulung|\bKI\b/.test(html.match(/<meta property="og:[^>]*>/g)?.join(' ') ?? '')) fehler.push('Startseite: Open-Graph-Angaben nennen KI');

    for (const [muster, was] of [
        [/UN-Ranking|E-Government-Ranking/i, 'Lage (UN-Ranking, steht auf /ueber-uns)'],
        [/Missionstext|Unsere Mission|Gemeinde für Gemeinde/i, 'Mission (steht auf /ueber-uns)'],
        [/Kurz beantwortet\.|Was kostet die Website\?/, 'Fragen (stehen auf /fragen)'],
        [/Übliches Projekt|Ohne Cookies und Tracking/, 'Vergleich oder Merkmale des Angebots (ausgeblendet)'],
        [/Erstgespräch in 25/, 'großes Erstgespräch-Band (ausgeblendet)'],
        [/Preis auf Anfrage/, '„Preis auf Anfrage“ (widerspricht „Fester Jahresbetrag, vorher bekannt“, Prüfer Runde 1)'],
        [/Art\. 32 DSGVO|WCAG 2\.1 AA/, 'Hinweiskästchen der alten Hero-Karte'],
        [/PHP 8\.4 – aktuell|Schriften vom eigenen Server|Kontrast geprüft/, 'verstreute Marken um das Vorher/Nachher'],
        [/Erklärung zur Barrierefreiheit\s+(?:fehlt|vorhanden)|Keine Erklärung zur Barrierefreiheit/, 'Aussage, die Befund 3 widerspricht'],
    ]) {
        const treffer = alles.match(muster);
        if (treffer) fehler.push(`Startseite: enthält ${was} („${treffer[0]}“)`);
    }
    for (const id of ['lage', 'recht', 'vision', 'ueber-uns', 'faq']) {
        if (new RegExp(`id="${id}"`).test(html)) fehler.push(`Startseite: Abschnitt #${id} steht im HTML (gehört auf eine Unterseite)`);
        if (new RegExp(`href="/?#${id}"`).test(html)) fehler.push(`Startseite: Link auf den Anker #${id}`);
    }

    const pflicht = [
        'Ihr digitales Ortseingangsschild',
        'Websites für Gemeinden, Ämter und Behörden',
        'Wir bauen Websites für Gemeinden, Ämter und Behörden: sicher, barrierefrei und rechtskonform.',
        'Kostenlose Vorschau anfragen',
        // Problem
        'Was Ihre Gemeinde hinter sich lässt.',
        'Veraltete Technik',
        'Barrierefreiheit mit Lücken',
        'Vermeidbare Rechtsrisiken',
        'Rechtskonform',
        // Beweis: Vorher/Nachher und Befund-Karten (Demo)
        'Eine Website, die Ihre Gemeinde gut vertritt.',
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
        // Angebot samt Ablauf
        'Das Angebot',
        'Ihre neue Website ist fertig, bevor Sie Ja sagen.',
        'Vorschau mit Ihren eigenen Inhalten',
        'Etwa zwei Wochen bis live',
        'Fester Jahresbetrag, vorher bekannt',
        'Technik, Updates und Hosting in Deutschland',
        'Vom Brief zur neuen Website.',
        'Vorschau mit Ihren Inhalten',
        'Erst dann gibt es einen Vertrag.',
        'Etwa zwei Wochen nach der Freigabe',
        'Fester Jahresbetrag.',
        'Ihr Angebot kommt mit der Vorschau.',
        'Antworten unter Fragen',
        // Vertrauen
        'Projekte für Kommunen, Institutionen und Unternehmen',
        'Landratsamt Fürstenfeldbruck',
        'Hessische Landeszentrale für politische Bildung',
        'Ein Projekt der NX7.AGENCY',
        // Kontakt
        'Sprechen wir über Ihre Gemeinde.',
        'Leon Pösken',
        '01556 6579408',
        'leon@smartamt.de',
        'Tobias Steffen',
        'Vorschau anfragen',
        'Etwas anderes',
    ];
    for (const text of pflicht) if (!alles.includes(text)) fehler.push(`Startseite: „${text}“ fehlt`);

    const ids = ['start', 'ortsausgang', 'websites', 'angebot', 'ablauf', 'kunden', 'referenzen', 'kontakt'];
    let letzte = -1;
    for (const id of ids) {
        const stelle = html.indexOf(`id="${id}"`);
        if (stelle < 0) fehler.push(`Startseite: Abschnitt #${id} fehlt`);
        else if (stelle < letzte) fehler.push(`Startseite: #${id} an falscher Stelle (Reihenfolge: ${ids.join(' → ')})`);
        else letzte = stelle;
    }

    // Hero: ein Satz (der frühere erste Satz ist ausgeblendet), Festnetz in der Vertrauenszeile, keine Handynummer
    const hero = html.slice(html.indexOf('id="start"'), html.indexOf('id="ortsausgang"'));
    if (/Die Website ist das Erste|Wir machen Ihre Website/.test(hero)) fehler.push('Hero: ein früherer Satz steht noch da (Versprechen in einem Satz)');
    if (/Auf einen Blick/.test(hero)) fehler.push('Hero: Sprungzeile „Auf einen Blick“ steht noch da (ausgeblendet, doppelt zum Menü)');
    if (!/href="tel:\+4934197853441"/.test(hero)) fehler.push('Hero: Festnetz 0341 fehlt');
    if (/01556|tel:\+4915566579408/.test(hero)) fehler.push('Hero: Leons Handynummer gehört nur zum Ansprechpartner');

    // Beweis: ein Regler, sechs Befund-Karten im selben Bild, keine zweite Befund-Tabelle
    const websites = html.slice(html.indexOf('id="websites"'), html.indexOf('id="angebot"'));
    const regler = (websites.match(/role="slider"/g) ?? []).length;
    if (regler !== 1) fehler.push(`Beweis: erwartet 1 Regler (role="slider"), gefunden ${regler}`);
    const karten = (websites.match(/data-befund="true"/g) ?? []).length;
    if (karten !== 6) fehler.push(`Beweis: erwartet 6 Befund-Karten, gefunden ${karten}`);
    const reglerPos = websites.indexOf('role="slider"');
    const kartenPos = websites.indexOf('data-befund="true"');
    const gruppe = websites.indexOf('aria-labelledby="befunde-karten-titel"');
    const gruppeEnde = websites.indexOf('musterbach-unterschrift');
    if (gruppe < 0 || reglerPos < gruppe || kartenPos < reglerPos || kartenPos > gruppeEnde) fehler.push('Beweis: Regler und Befund-Karten stehen nicht im selben Bild');
    if (/id="befunde-titel"/.test(websites)) fehler.push('Beweis: die frühere Befund-Tabelle steht noch im HTML');

    // Angebot: vier Vorteile, vier Schritte, „Hosting in Deutschland“ genau einmal
    const angebot = html.slice(html.indexOf('id="angebot"'), html.indexOf('id="kunden"'));
    const vorteile = (angebot.match(/data-punkt(?=[\s=>])/g) ?? []).length;
    if (vorteile !== 4) fehler.push(`Angebot: erwartet 4 Vorteile, gefunden ${vorteile}`);
    const schritte = (angebot.match(/data-schritt(?=[\s=>])/g) ?? []).length;
    if (schritte !== 4) fehler.push(`Angebot: erwartet 4 Schritte, gefunden ${schritte}`);
    const hosting = angebot.split('Hosting in Deutschland').length - 1;
    if (hosting !== 1) fehler.push(`Angebot: „Hosting in Deutschland“ steht ${hosting}-mal, erwartet einmal`);

    // Vertrauen: zwei Zitate, Link auf „Über uns“
    const vertrauen = html.slice(html.indexOf('id="referenzen"'), html.indexOf('id="kontakt"'));
    const zitate = (vertrauen.match(/<blockquote/g) ?? []).length;
    if (zitate !== 2) fehler.push(`Vertrauen: erwartet 2 Zitate, gefunden ${zitate}`);
    if (!/href="\/ueber-uns\/"/.test(vertrauen)) fehler.push('Vertrauen: Link auf „Über uns“ fehlt');

    // Formular: nur „Vorschau anfragen“ und „Etwas anderes“
    const optionen = [...html.matchAll(/<input[^>]*name="anliegen"[^>]*>/g)].length;
    if (optionen !== 2) fehler.push(`Formular: erwartet 2 Anliegen, gefunden ${optionen}`);

    // Ansprechpartner mit Gesicht im Kontakt (Owner 27.10.2026: „dass die Gesichter mal zu sehen sind. Ja, so wie auf Tobis Seite“),
    // aber keine ganze Team-Sektion: beide Porträts, Name, Rolle, Nummer und Leons E-Mail nur im Kontakt, keine Team-Sätze.
    const kontakt = html.slice(html.indexOf('id="kontakt"'));
    for (const foto of ['tobias-steffen.webp', 'leon-poesken.webp']) {
        if (!kontakt.includes(foto)) fehler.push(`Kontakt: Porträt ${foto} fehlt`);
        if (html.slice(0, html.indexOf('id="kontakt"')).includes(foto)) fehler.push(`Startseite: ${foto} steht vor dem Kontakt (nur dort gewünscht)`);
    }
    for (const text of ['Gründer von SmartAmt', 'Entwickler', 'href="tel:+4934197853441"', 'href="tel:+4915566579408"', 'href="mailto:leon@smartamt.de"', 'href="/ueber-uns/"']) {
        if (!kontakt.includes(text)) fehler.push(`Kontakt: „${text}“ fehlt`);
    }
    if (/Löst, woran andere scheitern|IT aus Überzeugung/.test(alles)) fehler.push('Startseite: Team-Sätze stehen auf der Startseite (nur Name und Rolle, die Sätze gehören auf /ueber-uns)');

    // Länge (Plan: rund 800 Wörter). Gezählt im Hauptteil des Server-HTML (ohne Kopf, Menü-Panel und Fuß); die Messung im
    // Browser (scripts/messen.mjs) steht im Beleg des Pakets.
    const haupt = (html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? html)
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z#0-9]+;/gi, ' ');
    const woerter = haupt.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
    if (woerter > 900) fehler.push(`Startseite: ${woerter} Wörter im Hauptteil, höchstens 900 (Plan: rund 800)`);
}

// ---- /ueber-uns ------------------------------------------------------------------------------------------------------
{
    const { html, alles } = ueber;
    for (const text of [
        'Über uns',
        'Wir bereiten den Weg zum einheitlichen digitalen Staat.',
        'Deutschland digital machen',
        'Überall gleich gut zurechtfinden',
        'Ämter wissen, dass alles rechtskonform ist',
        'Immer auf dem neuesten Stand der Technik',
        'Vorbild Dänemark und Estland',
        'Gemeinde für Gemeinde',
        'In Dänemark und Estland gehören digitale Behördengänge zum Alltag.',
        'Platz 12',
        'UN E-Government Survey 2024',
        'Ein Projekt der NX7.AGENCY.',
        'Gründer von SmartAmt',
        'Entwickler aus Leipzig. Löst, woran andere scheitern: seit Jahren für Mittelstand und Verwaltung, mehr als 50 Digitalprojekte.',
        'Kaufmann und NGO-Gründer aus Leipzig. IT aus Überzeugung: bringt Verwaltung und Technik an einen Tisch.',
        'tobiassteffen.com',
        'Kostenlose Vorschau anfragen',
    ]) {
        if (!alles.includes(text)) fehler.push(`/ueber-uns: „${text}“ fehlt`);
    }
    // Reihenfolge (Owner 27.10.2026): Kopf → Mission → Platz 12 → fünf Versprechen → Karte → Team
    let letzte = html.indexOf('<h1');
    for (const id of ['vision', 'lage', 'leitbild', 'deutschlandkarte', 'ueber-uns']) {
        const stelle = html.indexOf(`id="${id}"`);
        if (stelle < 0 || stelle < letzte) fehler.push(`/ueber-uns: #${id} fehlt oder steht an der falschen Stelle (Kopf → vision → lage → leitbild → deutschlandkarte → ueber-uns)`);
        else letzte = stelle;
    }
    // Karte: 16 Bundesländer, 15 Orte mit Zeichen, Netzlinien; Platz 1 nur als Ziel
    const karte = html.slice(html.indexOf('id="deutschlandkarte"'), html.indexOf('id="ueber-uns"'));
    const laender = (karte.match(/data-land=/g) ?? []).length;
    if (laender !== 16) fehler.push(`/ueber-uns: Karte hat ${laender} Bundesländer, erwartet 16`);
    const orte = (karte.match(/data-stadt=/g) ?? []).length;
    if (orte < 10) fehler.push(`/ueber-uns: Karte hat ${orte} Orte mit Zeichen, erwartet mindestens 10`);
    if ((karte.match(/data-linie=/g) ?? []).length < orte - 1) fehler.push('/ueber-uns: Netzlinien fehlen');
    if (!/href="#lz-wlan-srg"/.test(karte)) fehler.push('/ueber-uns: Karte nutzt nicht die Logo-Zeichen (#lz-…)');
    if (/radial-gradient/.test(karte)) fehler.push('/ueber-uns: Karte mit Punkt- oder Radialhintergrund');
    if (!alles.includes('Deutschland auf dem Weg zu Platz 1.')) fehler.push('/ueber-uns: Zielsatz „Deutschland auf dem Weg zu Platz 1.“ fehlt');
    if (/Deutschland (?:ist|steht) (?:auf )?Platz 1|Deutschland auf Platz 1(?! *im)/.test(alles.replace('Deutschland auf dem Weg zu Platz 1.', ''))) fehler.push('/ueber-uns: Platz 1 als Tatsache statt als Ziel');
    if (!alles.includes('Natural Earth')) fehler.push('/ueber-uns: Quelle der Karte (Natural Earth) fehlt');
    const leitbild = html.slice(html.indexOf('id="leitbild"'), html.indexOf('id="deutschlandkarte"'));
    const punkte = (leitbild.match(/<li\b/g) ?? []).length;
    if (punkte !== 5) fehler.push(`/ueber-uns: Leitbild hat ${punkte} Punkte, erwartet 5`);
    for (const foto of ['tobias-steffen.webp', 'leon-poesken.webp']) if (!html.includes(foto)) fehler.push(`/ueber-uns: Foto ${foto} fehlt`);
    if (html.includes('eremiya-rifat')) fehler.push('/ueber-uns: Foto von Eremiya Rifat steht im HTML');
    const tobiasLink = /<a [^>]*href="https:\/\/www\.tobiassteffen\.com\/"[^>]*>/.exec(html)?.[0] ?? '';
    if (!/target="_blank"/.test(tobiasLink) || !/rel="noopener"/.test(tobiasLink)) fehler.push('/ueber-uns: Link auf tobiassteffen.com (neuer Tab, noopener) fehlt');
    if (html.includes('leonposken.vercel.app')) fehler.push('/ueber-uns: Link auf leonposken.vercel.app ist raus (Owner 27.10.2026)');
    if (/Ihr Ansprechpartner|Technik, Angebot, Vertrag|Ruft Sie an, beantwortet/.test(alles)) fehler.push('/ueber-uns: alte Rolle oder alter Satz steht auf der Seite');
    if ((html.match(/<h1\b/g) ?? []).length !== 1) fehler.push('/ueber-uns: genau eine h1 erwartet');
}

// ---- /fragen ---------------------------------------------------------------------------------------------------------
{
    const { html, alles } = fragen;
    const faq = html.slice(html.indexOf('id="faq"'), html.indexOf('id="recht"'));
    const anzahl = (faq.match(/<details\b/g) ?? []).length;
    if (anzahl !== 6) fehler.push(`/fragen: erwartet 6 Fragen, gefunden ${anzahl}`);
    for (const frage of [
        'Was kostet die Website?',
        'Müssen wir das ausschreiben?',
        'Was passiert mit unseren Inhalten?',
        'Wem gehören Inhalte und Domain?',
        'Wie lange binden wir uns?',
        'Wer kümmert sich nach dem Livegang?',
    ]) {
        if (!alles.includes(frage)) fehler.push(`/fragen: Frage „${frage}“ fehlt`);
    }
    const recht = html.slice(html.indexOf('id="recht"'));
    const grundlagen = (recht.match(/<details\b/g) ?? []).length;
    if (grundlagen !== 4) fehler.push(`/fragen: Recht & Sicherheit hat ${grundlagen} Grundlagen, erwartet 4 (ohne KI-Verordnung)`);
    for (const text of [
        'Rechtskonform heißt: Wir kennen die Paragraphen.',
        'Barrierefreiheit',
        'Keine Cookies ohne Einwilligung',
        'Keine Daten an fremde Server',
        'Sicherheit nach dem Stand der Technik',
    ]) {
        if (!alles.includes(text)) fehler.push(`/fragen: „${text}“ fehlt`);
    }
    if ((html.match(/<h1\b/g) ?? []).length !== 1) fehler.push('/fragen: genau eine h1 erwartet');
}

// Datenschutz: nennt nur Felder, die das Formular abfragt (die Schulungs-Anliegen sind ausgeblendet)
const datenschutz = path.join(ordner, 'datenschutz', 'index.html');
if (!fs.existsSync(datenschutz)) fehler.push(`${datenschutz} fehlt`);
else if (/Schulungsort|Teilnehmerzahl/.test(fs.readFileSync(datenschutz, 'utf8'))) fehler.push('Datenschutz nennt Schulungsfelder');

// Sitemap nennt die Unterseiten
const sitemap = path.join(ordner, 'sitemap.xml');
if (!fs.existsSync(sitemap)) fehler.push('sitemap.xml fehlt');
else {
    const xml = fs.readFileSync(sitemap, 'utf8');
    for (const p of ['/ueber-uns/', '/fragen/']) if (!xml.includes(p)) fehler.push(`sitemap.xml: ${p} fehlt`);
}

fertig('V3-AUSGABE', fehler);
