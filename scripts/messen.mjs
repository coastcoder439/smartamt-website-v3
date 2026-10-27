// Messung der Seitenlänge (lokal, nicht Teil des Builds): Seitenhöhe, Bildschirme, Wörter, Abschnitte, waagerechtes Scrollen.
// Gleiche Messart wie der Vergleich mit Tobis Seite (docs/packages/01-smartamt-website/evidence/vergleich-tobi-staging-2026-10-27.md):
// scrollHeight, Wörter im sichtbaren Text (innerText von body), Anzahl `section`.
//
// node scripts/messen.mjs <url> [breite] [höhe]
//
// Vor dem Messen wird die Seite einmal ganz durchgescrollt, damit angeheftete Bereiche (pin) ihren Platz einnehmen.
// Playwright kommt aus der Werkbank (keel-harness-live-1/node_modules), wie in scripts/shots.mjs.
import { pathToFileURL } from 'node:url';

const pw = await import(pathToFileURL('C:/Users/Lonsinator/WORKSPACES/keel-harness-live-1/node_modules/playwright/index.mjs').href);
const [, , url, w = '1440', h = '900'] = process.argv;
if (!url) {
    console.error('Aufruf: node scripts/messen.mjs <url> [breite] [höhe]');
    process.exit(2);
}

const browser = await pw.chromium.launch();
const ctx = await browser.newContext({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(1500);
for (let y = 0; y < 40000; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);

const werte = await page.evaluate(() => {
    const hoehe = document.documentElement.scrollHeight;
    const text = document.body.innerText;
    const woerter = text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
    const abschnitte = [...document.querySelectorAll('section')].map((s) => ({
        id: s.id || s.getAttribute('aria-label') || '',
        hoehe: Math.round(s.getBoundingClientRect().height),
    }));
    // Punkt-Ebenen: sichtbare Elemente über 200 px Höhe, deren Hintergrund ein Radialverlauf in kleiner Kachel ist (Punktraster).
    // Zum Vergleich alle Elemente über 200 px mit einem Radialverlauf im Hintergrund (auch weiche Lichter) und die Flächenfarben
    // der Abschnitte.
    const ebenen = [...document.querySelectorAll('body *')].filter((el) => {
        const s = getComputedStyle(el);
        return el.getBoundingClientRect().height > 200 && s.display !== 'none' && s.visibility !== 'hidden' && s.backgroundImage.includes('radial-gradient');
    });
    const punkte = ebenen.filter((el) => /^\d+(\.\d+)?px/.test(getComputedStyle(el).backgroundSize) && parseFloat(getComputedStyle(el).backgroundSize) <= 48);
    const flaechen = [...new Set([...document.querySelectorAll('main section, main > header, section')].map((el) => getComputedStyle(el).backgroundColor))];
    return {
        punktEbenen: punkte.map((el) => (el.closest('section,header,footer')?.id || el.closest('section,header,footer')?.tagName || '') + '.' + String(el.className).slice(0, 40)),
        radialEbenen: ebenen.length,
        flaechen,
        hoehe,
        bildschirme: Math.round((hoehe / window.innerHeight) * 10) / 10,
        woerter,
        abschnitte: abschnitte.length,
        einzeln: abschnitte,
        waagerecht: document.documentElement.scrollWidth > window.innerWidth,
        rootSchrift: getComputedStyle(document.documentElement).fontSize,
    };
});
console.log(JSON.stringify({ url, fenster: `${w}x${h}`, ...werte }, null, 1));
await browser.close();
