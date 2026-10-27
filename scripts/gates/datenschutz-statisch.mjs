// Gate Datenschutz: Die Seite lädt im Browser nichts von fremden Servern, setzt keine Cookies und
// speichert nichts im Browser. Das ist die Grundlage der Datenschutzerklärung. Geprüft wird der
// Quelltext in src/; die Datenschutzseite selbst liefert der Orchestrator.
// Erlaubt ist genau ein Fremdziel für Anfragen: das Backend von Tobi (siehe CSP connect-src).
import { lies, quellen, fertig } from './_lib.mjs';

const fehler = [];

const VERBOTEN = [
  [/fonts\.(googleapis|gstatic)\.com/i, 'Google Fonts zur Laufzeit'],
  [/googletagmanager|google-analytics|gtag\(|plausible|matomo|hotjar|sentry|clarity\.ms/i, 'Tracking oder Analyse'],
  [/document\.cookie/i, 'Cookies'],
  [/localStorage|sessionStorage|indexedDB/i, 'Speicher im Browser'],
  [/<iframe\b|<embed\b|<object\b/i, 'eingebetteter Fremdinhalt'],
  [/navigator\.sendBeacon|XMLHttpRequest|new WebSocket|new EventSource/i, 'unerwartete Netzwerkaufrufe'],
  [/@import\b/i, 'CSS-@import'],
  [/url\(\s*['"]?https?:/i, 'CSS-Ressource von fremdem Server'],
  [/<(script|link|img|source|video|audio)\b[^>]*\b(src|href|srcSet)=["']https?:\/\//i, 'Ressource von fremdem Server im Markup'],
];

for (const rel of quellen()) {
  const text = lies(rel);
  for (const [muster, was] of VERBOTEN) {
    if (muster.test(text)) fehler.push(`${rel}: ${was}`);
  }
  for (const m of text.matchAll(/fetch\(\s*(['"`])(https?:\/\/[^'"`]+)\1/g)) {
    if (!m[2].startsWith('https://backend.tobiassteffen.com')) fehler.push(`${rel}: fetch an fremdes Ziel ${m[2]}`);
  }
}

const config = lies('next.config.ts');
if (!/output:\s*'export'/.test(config)) fehler.push("next.config.ts: kein output: 'export' (die Seite muss ein statischer Export sein)");

fertig('DATENSCHUTZ-STATISCH', fehler);
