// Gate F3: Der Inhalt steht im Server-HTML (ohne JavaScript sichtbar für Crawler) und die SEO-Grundlagen stimmen.
//   node scripts/gates/roh-html.mjs --url http://localhost:3000/ [--min-h2 1] [--min-words 120]
//        [--require "Ihr digitales Ortseingangsschild,Was Ihre Gemeinde hinter sich lässt"]
// Braucht einen laufenden Server (zum Beispiel `npx serve out` nach npm run build); deshalb als manuell
// belegtes Gate mit Beleg-Datei, nicht als CHECK.
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1]]);
    return acc;
  }, []),
);
const url = args.url || 'http://localhost:3000/';
const minH2 = Number(args['min-h2'] || 1);
const minWorte = Number(args['min-words'] || 120);
const pflicht = (args.require || 'Ihr digitales Ortseingangsschild,Was Ihre Gemeinde hinter sich lässt')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const res = await fetch(url, { headers: { accept: 'text/html' } });
const html = await res.text();
const ohneSkript = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
const text = ohneSkript.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const worte = text.split(' ').length;
const h1 = (html.match(/<h1\b/g) || []).length;
const h2 = (html.match(/<h2\b/g) || []).length;

const fehler = [];
if (res.status !== 200) fehler.push(`HTTP ${res.status}`);
if (h1 !== 1) fehler.push(`erwartet genau 1 <h1>, gefunden ${h1}`);
if (h2 < minH2) fehler.push(`erwartet mindestens ${minH2} <h2> im Roh-HTML, gefunden ${h2}`);
if (worte < minWorte) fehler.push(`erwartet mindestens ${minWorte} Wörter im Roh-HTML, gefunden ${worte}`);
for (const p of pflicht) if (!text.includes(p)) fehler.push(`„${p}“ steht nicht im Roh-HTML`);

// SEO-Grundlagen laut Bauauftrag
if (!/<html\b[^>]*\blang="de"/.test(html)) fehler.push('<html> ohne lang="de"');
if (!html.includes('<title>SmartAmt – Sichere Websites für Gemeinden</title>')) fehler.push('title weicht vom Bauauftrag ab');
if (!/<link rel="canonical" href="https:\/\/www\.smartamt\.de\/?"/.test(html)) fehler.push('canonical fehlt oder weicht ab');
if (!/application\/ld\+json/.test(html) || !html.includes('"parentOrganization"')) fehler.push('JSON-LD Organization mit parentOrganization fehlt');
if (!/property="og:image"/.test(html)) fehler.push('og:image fehlt');

console.log(`Roh-HTML ${url}: ${html.length} Zeichen, ${worte} Wörter, h1 ${h1}, h2 ${h2}`);
if (fehler.length) {
  console.error('ROH-HTML FEHLGESCHLAGEN');
  for (const f of fehler) console.error(' - ' + f);
  // exitCode statt process.exit: nach fetch() bricht process.exit unter Windows mit einer libuv-Meldung ab
  process.exitCode = 1;
} else {
  console.log('ROH-HTML OK');
}
