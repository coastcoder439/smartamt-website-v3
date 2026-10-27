// Gate Sicherheits-Header: vercel.json und deploy/nginx-headers.conf tragen dieselben Header mit
// denselben Werten, und die CSP enthält alle geforderten Anweisungen. Der Export hat keine
// headers()-Funktion mehr, darum steht die Wahrheit in diesen beiden Dateien.
import { lies, fertig } from './_lib.mjs';

const fehler = [];

const ERWARTET = [
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Content-Security-Policy',
];

const vercel = JSON.parse(lies('vercel.json'));
const vercelHeader = new Map();
for (const regel of vercel.headers ?? []) {
  if (regel.source !== '/(.*)') fehler.push(`vercel.json: unerwartete Quelle ${regel.source} (Header gelten für alle Pfade)`);
  for (const h of regel.headers) vercelHeader.set(h.key, h.value);
}

const nginxHeader = new Map();
for (const zeile of lies('deploy/nginx-headers.conf').split(/\r?\n/)) {
  const m = zeile.match(/^\s*add_header\s+(\S+)\s+"(.*)"\s+always;\s*$/);
  if (m) nginxHeader.set(m[1], m[2]);
}

for (const name of ERWARTET) {
  if (!vercelHeader.has(name)) fehler.push(`vercel.json: Header ${name} fehlt`);
  if (!nginxHeader.has(name)) fehler.push(`nginx-headers.conf: Header ${name} fehlt`);
  if (vercelHeader.has(name) && nginxHeader.has(name) && vercelHeader.get(name) !== nginxHeader.get(name)) {
    fehler.push(`Header ${name} ist in vercel.json und nginx-headers.conf unterschiedlich`);
  }
}
for (const name of vercelHeader.keys()) if (!ERWARTET.includes(name)) fehler.push(`vercel.json: unbekannter Header ${name}`);
for (const name of nginxHeader.keys()) if (!ERWARTET.includes(name)) fehler.push(`nginx-headers.conf: unbekannter Header ${name}`);

if (vercelHeader.get('X-Frame-Options') !== 'DENY') fehler.push('X-Frame-Options muss DENY sein');

const csp = vercelHeader.get('Content-Security-Policy') ?? '';
for (const anweisung of [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://backend.tobiassteffen.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "object-src 'none'",
]) {
  if (!csp.split(';').map((s) => s.trim()).includes(anweisung)) fehler.push(`CSP ohne "${anweisung}"`);
}

const config = lies('next.config.ts');
if (/async\s+headers\s*\(/.test(config)) fehler.push('next.config.ts: headers() ist im statischen Export nicht erlaubt');

fertig('HEADER-GLEICH', fehler);
