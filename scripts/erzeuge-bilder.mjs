// Erzeugt die Bildmarken der Seite als feste PNG-Dateien in public/ (CI v3):
//   icon-192.png, icon-512.png   Bildmarke: oranges abgerundetes Quadrat mit weißem „S“ (Favicon, App-Symbol, Manifest)
//   apple-touch-icon.png         Startbildschirm-Symbol (iOS), randlos (iOS rundet selbst)
//   favicon.ico                  32 px, als PNG im ICO-Container
//   og-image.png                 Vorschaubild für geteilte Links (1200 × 630)
//
// Warum feste Dateien statt icon.tsx und opengraph-image.tsx: Die Seite ist ein statischer
// Export, der auf jedem Webserver liegen soll. Dateien mit Endung und festem Pfad liefert jeder
// Server mit dem richtigen Inhaltstyp aus; die Adressen stehen in layout.tsx und manifest.ts.
//
// Gerendert wird in Chromium (Playwright aus der Werkbank, wie scripts/shots.mjs) aus kleinem HTML mit
// den echten Schriften der Seite (Inter, JetBrains Mono aus @fontsource, lokal eingebettet). Dadurch
// stimmen Laufweite, Schatten und Punktraster mit der Website überein, was Satori nicht leistet.
//
// Aufruf: npm run bilder (nach Änderungen an Bildmarke oder Leitsatz; die Ergebnisse werden eingecheckt).
// Gestaltung nach docs/brand/brand-identity.md: weiß, Tinte, NX7-Orange nur als Akzent, kein Schild.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUSGABE = path.join(WURZEL, 'public');
const PLAYWRIGHT = 'C:/Users/Lonsinator/WORKSPACES/keel-harness-live-1/node_modules/playwright/index.mjs';

// Farben aus src/styles/globals.css (:root), hier einmal gespiegelt, weil das Skript kein CSS einliest.
const C = {
    brand: '#ff6600',
    brand600: '#e85d04',
    brandInk: '#c2410c',
    brand100: '#ffe8d9',
    ink: '#0f0f10',
    ink2: '#4b4b52',
    ink3: '#6e6e76',
    bg2: '#f6f6f7',
    bg3: '#eeeef0',
    line: '#e7e7ea',
    line2: '#d6d6db',
    ok: '#15803d',
    ok50: '#eef8f1',
};

async function schrift(paket, datei) {
    const bytes = await readFile(path.join(WURZEL, 'node_modules', '@fontsource', paket, 'files', datei));
    return `data:font/woff2;base64,${bytes.toString('base64')}`;
}

const [inter500, inter700, inter800, mono500] = await Promise.all([
    schrift('inter', 'inter-latin-500-normal.woff2'),
    schrift('inter', 'inter-latin-700-normal.woff2'),
    schrift('inter', 'inter-latin-800-normal.woff2'),
    schrift('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff2'),
]);

const FONT_CSS = `
@font-face { font-family: 'Inter'; font-weight: 500; src: url(${inter500}) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 700; src: url(${inter700}) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 800; src: url(${inter800}) format('woff2'); }
@font-face { font-family: 'JetBrains Mono'; font-weight: 500; src: url(${mono500}) format('woff2'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
`;

// ---- Bildmarke --------------------------------------------------------------
// Orange abgerundetes Quadrat, weißes „S“. rund = false: randlos (iOS rundet selbst).
function bildmarkeHtml(groesse, rund) {
    const radius = rund ? Math.round(groesse * 0.225) : 0;
    return `<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}
html, body { background: transparent; }
.marke { width: ${groesse}px; height: ${groesse}px; border-radius: ${radius}px; background: ${C.brand};
  display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.marke span { font-weight: 800; font-size: ${Math.round(groesse * 0.64)}px; line-height: 1; letter-spacing: -0.04em;
  color: #fff; margin-top: ${-Math.round(groesse * 0.02)}px; margin-left: ${-Math.round(groesse * 0.015)}px; }
</style></head><body><div class="marke" id="bild"><span>S</span></div></body></html>`;
}

// ---- Vorschaubild -----------------------------------------------------------
// Weiß, Punktraster, Logo, Leitsatz, Produktansicht „Website-Check“ unten rechts (angeschnitten),
// „Ein Projekt der NX7.AGENCY“. Keine Schilder, keine großen Orangeflächen. Keine erfundenen Messwerte:
// Der Ring zeigt fünf von fünf Prüfpunkten, die Karte ist als „Beispiel“ und „(erfunden)“ gekennzeichnet.
function vorschauHtml() {
    const zeilen = [
        'Software auf aktuellem Stand',
        'Verschlüsselte Verbindung',
        'Cookies nur mit Einwilligung',
    ];
    const haken = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const radius = 46;
    const umfang = 2 * Math.PI * radius;
    return `<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}
.seite { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #fff; }
.punkte { position: absolute; inset: 0; background-image: radial-gradient(circle at 1px 1px, ${C.line2} 1px, transparent 0);
  background-size: 24px 24px; opacity: .7; -webkit-mask-image: radial-gradient(80% 85% at 30% 25%, #000, transparent); }
.licht { position: absolute; right: -180px; top: -200px; width: 640px; height: 640px; border-radius: 50%;
  background: radial-gradient(closest-side, ${C.brand100}, transparent); opacity: .8; }
.logo { position: absolute; left: 64px; top: 52px; display: flex; align-items: center; gap: 22px;
  font-weight: 800; font-size: 40px; letter-spacing: -0.045em; color: ${C.ink}; line-height: 1; }
.logo i { display: block; width: 19px; height: 19px; margin-left: 8px; border-radius: 50%; background: ${C.brand};
  box-shadow: 0 0 0 8px ${C.brand100}; }
.logo b { color: ${C.brand}; font-weight: 800; }
h1 { position: absolute; left: 60px; top: 142px; font-weight: 700; font-size: 100px; line-height: .98;
  letter-spacing: -0.05em; color: ${C.ink}; white-space: nowrap; }
h1 span { display: block; }
h1 .o { color: ${C.brand600}; }
.lead { position: absolute; left: 64px; top: 372px; width: 600px; font-weight: 500; font-size: 31px; line-height: 1.35;
  letter-spacing: -0.015em; color: ${C.ink2}; text-wrap: balance; }
.absender { position: absolute; left: 64px; bottom: 50px; font-family: 'JetBrains Mono', monospace; font-weight: 500;
  font-size: 17px; letter-spacing: .14em; text-transform: uppercase; color: ${C.ink3}; }
.absender::before { content: '// '; color: ${C.brand}; }
.karte { position: absolute; left: 726px; top: 392px; width: 440px; border-radius: 22px; background: #fff;
  border: 1px solid ${C.line}; box-shadow: 0 40px 80px -28px rgba(16,16,20,.28), 0 8px 20px -8px rgba(16,16,20,.1); overflow: hidden; }
.leiste { display: flex; align-items: center; gap: 12px; padding: 13px 16px; background: ${C.bg2}; border-bottom: 1px solid ${C.line}; }
.leiste .d { display: flex; gap: 6px; } .leiste .d i { width: 10px; height: 10px; border-radius: 50%; background: ${C.line2}; }
.leiste .u { margin: 0 auto; padding: 4px 16px; border-radius: 999px; border: 1px solid ${C.line}; background: #fff;
  font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${C.ink3}; }
.leiste .z { width: 42px; }
.inhalt { padding: 22px 24px 0; }
.kopf { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.kopf .l { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: ${C.brandInk}; white-space: nowrap; }
.kopf-n { margin-top: 5px; font-weight: 700; font-size: 16px; letter-spacing: -0.01em; color: ${C.ink}; white-space: nowrap; }
.chip { padding: 5px 12px; border-radius: 999px; background: ${C.ok50}; color: ${C.ok}; font-weight: 700; font-size: 12px; }
.reihe { display: flex; gap: 18px; align-items: flex-start; margin-top: 20px; }
.ring { position: relative; width: 100px; height: 100px; flex: none; }
.ring svg { width: 100px; height: 100px; transform: rotate(-90deg); }
.ring div { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring b { font-weight: 800; font-size: 34px; letter-spacing: -0.04em; line-height: 1; color: ${C.ink}; }
.ring small { margin-top: 3px; font-size: 11px; color: ${C.ink3}; font-weight: 500; }
.liste { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.punkt { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 11px; background: ${C.ok50};
  border: 1px solid #cfe5d6; font-weight: 500; font-size: 12px; color: ${C.ink}; }
.punkt .h { width: 20px; height: 20px; border-radius: 50%; background: ${C.ok}; display: flex; align-items: center; justify-content: center; flex: none; }
.punkt .t { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style></head><body>
<div class="seite" id="bild">
  <div class="punkte"></div><div class="licht"></div>
  <div class="logo"><i></i><span>Smart<b>Amt</b></span></div>
  <h1><span>Ihr digitales</span><span class="o">Ortseingangsschild.</span></h1>
  <p class="lead">Sichere Websites für Gemeinden, Ämter und Behörden</p>
  <p class="absender">Ein Projekt der NX7.AGENCY</p>
  <div class="karte">
    <div class="leiste"><span class="d"><i></i><i></i><i></i></span><span class="u">www.musterbach.de</span><span class="z"></span></div>
    <div class="inhalt">
      <div class="kopf"><div class="l">SmartAmt Website-Check · Beispiel</div><span class="chip">Alles erfüllt</span></div>
      <div class="kopf-n">Beispielgemeinde Musterbach (erfunden)</div>
      <div class="reihe">
        <div class="ring">
          <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${radius}" fill="none" stroke="${C.bg3}" stroke-width="10"/>
            <circle cx="60" cy="60" r="${radius}" fill="none" stroke="${C.brand}" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${umfang}" stroke-dashoffset="0"/></svg>
          <div><b>5</b><small>von 5</small></div>
        </div>
        <div class="liste">${zeilen
            .map((t) => `<div class="punkt"><span class="h">${haken}</span><span class="t">${t}</span></div>`)
            .join('')}</div>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

// ICO-Container mit einem eingebetteten PNG (von allen aktuellen Browsern gelesen).
function alsIco(png, groesse) {
    const kopf = Buffer.alloc(22);
    kopf.writeUInt16LE(0, 0); // reserviert
    kopf.writeUInt16LE(1, 2); // Typ: Symbol
    kopf.writeUInt16LE(1, 4); // Anzahl Bilder
    kopf.writeUInt8(groesse, 6); // Breite
    kopf.writeUInt8(groesse, 7); // Höhe
    kopf.writeUInt8(0, 8); // Farben
    kopf.writeUInt8(0, 9); // reserviert
    kopf.writeUInt16LE(1, 10); // Farbebenen
    kopf.writeUInt16LE(32, 12); // Bit pro Pixel
    kopf.writeUInt32LE(png.length, 14); // Größe der Daten
    kopf.writeUInt32LE(22, 18); // Beginn der Daten
    return Buffer.concat([kopf, png]);
}

const pw = await import(pathToFileURL(PLAYWRIGHT).href);
const browser = await pw.chromium.launch();

async function alsPng(html, breite, hoehe, transparent) {
    const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.locator('#bild').screenshot({ omitBackground: transparent });
    await ctx.close();
    return png;
}

await mkdir(AUSGABE, { recursive: true });

const dateien = {
    'icon-192.png': await alsPng(bildmarkeHtml(192, true), 192, 192, true),
    'icon-512.png': await alsPng(bildmarkeHtml(512, true), 512, 512, true),
    'apple-touch-icon.png': await alsPng(bildmarkeHtml(180, false), 180, 180, false),
    'og-image.png': await alsPng(vorschauHtml(), 1200, 630, false),
};
dateien['favicon.ico'] = alsIco(await alsPng(bildmarkeHtml(32, true), 32, 32, true), 32);
await browser.close();

for (const [name, daten] of Object.entries(dateien)) {
    await writeFile(path.join(AUSGABE, name), daten);
    console.log(`public/${name}  ${daten.length} Bytes`);
}
