// Übernimmt die gewählten Logo-Entwürfe aus docs/brand/logo-entwuerfe/ in die Website (lokal, nicht Teil des Builds).
//
// node scripts/erzeuge-logo-zeichen.mjs
//
// Schreibt src/components/ui/logo-zeichen.ts: je Zeichen viewBox und Inhalt (ohne title, desc, style). Klassen bekommen
// den Vorsatz „lz-“ (Regeln in styles/globals.css, Block „Logo-Wahl“), IDs je Zeichen einen eigenen Vorsatz, damit sie
// im Sprite (LogoSprite.tsx) eindeutig sind. Wer einen Entwurf ändert, führt das Skript neu aus.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEBSITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTWUERFE = join(WEBSITE, '..', 'docs', 'brand', 'logo-entwuerfe');

/** Varianten-ID (wie in src/lib/logos.ts) → Entwurf. „wort“ ist die Wortmarke mit Dach-A (C1), die jedes Zeichen begleitet. */
const QUELLEN = [
    { id: 'wort', datei: 'c1-wortbildmarke.svg' },
    { id: 'wlan-srg', datei: join('runde-7', 'r7-w2.svg') },
    { id: 'wlan', datei: join('runde-7', 'r7-w1.svg') },
    { id: 'wlan-kraeftig', datei: join('runde-6', 'r6-w1.svg') },
    { id: 'funk-srg', datei: join('runde-8', 'r8-w2.svg') },
    { id: 'funk-zwei', datei: join('runde-8', 'r8-w2b.svg') },
    { id: 'funk', datei: join('runde-6', 'r6-w2.svg') },
    { id: 'stempel-striche', datei: join('runde-8', 'r8-s3b.svg') },
    { id: 'stempel-saeulen', datei: join('runde-6', 'r6-s3.svg') },
    { id: 'stempel-schichten', datei: join('runde-7', 'r7-s3.svg') },
    { id: 'stempel', datei: join('runde-6', 'r6-s1.svg') },
    { id: 'saeulen', datei: join('runde-7', 'r7-d.svg') },
    { id: 'klammer', datei: join('runde-6', 'r6-b1.svg') },
    { id: 'klammer-srg', datei: join('runde-6', 'r6-b2.svg') },
];

function uebernimm({ id, datei }) {
    const svg = readFileSync(join(ENTWUERFE, datei), 'utf8');
    const viewBox = /viewBox="([^"]+)"/.exec(svg)[1];
    let inhalt = svg
        .replace(/^[\s\S]*?<svg[^>]*>/, '')
        .replace(/<\/svg>\s*$/, '')
        .replace(/<title>[\s\S]*?<\/title>/g, '')
        .replace(/<desc>[\s\S]*?<\/desc>/g, '')
        .replace(/<style>[\s\S]*?<\/style>/g, '')
        .replace(/class="([^"]+)"/g, (_, k) => `class="${k.split(/\s+/).map((c) => `lz-${c}`).join(' ')}"`);
    const ids = [...inhalt.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    for (const alt of ids) {
        const neu = `lz-${id}-${alt}`;
        inhalt = inhalt
            .replaceAll(`id="${alt}"`, `id="${neu}"`)
            .replaceAll(`url(#${alt})`, `url(#${neu})`)
            .replaceAll(`href="#${alt}"`, `href="#${neu}"`);
    }
    return { id, viewBox, inhalt: inhalt.trim() };
}

const fehlend = QUELLEN.filter((q) => !existsSync(join(ENTWUERFE, q.datei)));
for (const q of fehlend) console.warn(`fehlt, übersprungen: ${q.id} (${q.datei})`);
const zeichen = QUELLEN.filter((q) => !fehlend.includes(q)).map(uebernimm);
const kopf = `// Erzeugt von scripts/erzeuge-logo-zeichen.mjs aus docs/brand/logo-entwuerfe/. Nicht von Hand ändern.\n`;
const rumpf = `export const LOGO_ZEICHEN = ${JSON.stringify(Object.fromEntries(zeichen.map((z) => [z.id, { viewBox: z.viewBox, inhalt: z.inhalt }])), null, 4)} as const;\n`;
writeFileSync(join(WEBSITE, 'src', 'components', 'ui', 'logo-zeichen.ts'), kopf + rumpf);
console.log('logo-zeichen.ts:', zeichen.map((z) => `${z.id} ${z.inhalt.length} Zeichen`).join(', '));
