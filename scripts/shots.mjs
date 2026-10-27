// Screenshots für die Sichtprüfung (lokal, nicht Teil des Builds).
//
// node scripts/shots.mjs <url> <ausgabeordner> <name> <breite> <höhe> [reduced|normal] [#id,#id,...]
//
// Ohne Abschnittsliste: Bildschirmfotos entlang der ganzen Seite (je 85 % Fensterhöhe weiter).
// Mit Abschnittsliste: je Abschnitt scrollIntoView, 1,4 s warten, dann ein Foto.
// Playwright kommt aus der Werkbank (keel-harness-live-1/node_modules).
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const pw = await import(pathToFileURL('C:/Users/Lonsinator/WORKSPACES/keel-harness-live-1/node_modules/playwright/index.mjs').href);
const [, , url, out, name, w = '1440', h = '900', modus = 'normal', abschnitte = ''] = process.argv;
if (!url || !out || !name) {
    console.error('Aufruf: node scripts/shots.mjs <url> <ordner> <name> <breite> <höhe> [reduced|normal] [#id,#id]');
    process.exit(2);
}
mkdirSync(out, { recursive: true });

const browser = await pw.chromium.launch();
const ctx = await browser.newContext({
    viewport: { width: Number(w), height: Number(h) },
    reducedMotion: modus === 'reduced' ? 'reduce' : 'no-preference',
    deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const fehler = [];
page.on('pageerror', (e) => fehler.push(String(e)));
page.on('console', (m) => {
    if (m.type() === 'error') fehler.push(m.text());
});

await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(2200);

const dateien = [];
if (abschnitte) {
    for (const sel of abschnitte.split(',').filter(Boolean)) {
        const ok = await page.evaluate((s) => {
            const el = document.querySelector(s);
            if (!el) return false;
            el.scrollIntoView({ block: 'start' });
            return true;
        }, sel);
        await page.waitForTimeout(1400);
        const datei = join(out, `${name}-${sel.replace(/[^a-z0-9-]/gi, '')}.png`);
        if (ok) {
            await page.screenshot({ path: datei });
            dateien.push(datei);
        } else {
            fehler.push(`Abschnitt fehlt: ${sel}`);
        }
    }
} else {
    const gesamt = await page.evaluate(() => document.documentElement.scrollHeight);
    const schritt = Math.round(Number(h) * 0.85);
    let i = 0;
    const MAX = Number(process.env.SHOTS_MAX || 60);
    for (let y = 0; y < gesamt && i < MAX; y += schritt, i++) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(900);
        const datei = join(out, `${name}-${String(i).padStart(2, '0')}.png`);
        await page.screenshot({ path: datei });
        dateien.push(datei);
    }
}

console.log(JSON.stringify({ name, dateien, fehler }, null, 2));
await browser.close();
