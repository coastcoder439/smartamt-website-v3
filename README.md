# SmartAmt Website

Website von SmartAmt, einem Projekt der NX7.AGENCY: sichere, barrierefreie, rechtskonforme Websites für Gemeinden
(Version 2, Verkaufs-One-Pager; Bauauftrag `docs/packages/02-website-v2/design/bauauftrag-v2.md`).

**Ausgeblendet statt gelöscht.** Was die Seite in v2 nicht zeigt (Leistungen-Kacheln, KI-Fortbildung und IT-Schulungen, Lage,
Recht & Sicherheit, Vision, Eremiya Rifat, die Anliegen und Fragen zu Schulungen, Hero-Knopf „KI-Fortbildung ansehen“, Ablaufschritt
„Schulung“) steht weiter im Code. Die Schalter stehen in `src/lib/abschnitte.ts`; Menü, Sprungzeile und Fuß folgen ihnen.

Gestaltung (CI v3, hell und freundlich): `docs/brand/brand-identity.md`. Bauauftrag:
`docs/packages/01-smartamt-website/design/website-spec-v3.md`. Texte: `website-copy-b2-b3.md` und `legal-texts.md` im selben Ordner.

**Statischer Export.** `npm run build` erzeugt den Ordner `out/`. Er läuft auf jedem Webserver (heute Vercel, später
der Server in Deutschland). Es gibt keine API-Route; das Kontaktformular schickt, sobald eine Webhook-Adresse gesetzt ist, direkt aus dem Browser dorthin; ohne Adresse bereitet es eine E-Mail an mail@smartamt.de vor
(`src/components/sections/b3/kontakt-regeln.ts`).

## Start

```bash
npm install
npm run dev      # Entwicklung auf http://localhost:3000
```

## Build

```bash
npm run build    # erzeugt out/ (statischer Export, trailingSlash)
npx serve out    # Export lokal ansehen (Adresse: http://localhost:3000)
```

`next start` gibt es bei einem Export nicht. Der Build lädt die zwei Schriften (Inter, JetBrains Mono) einmalig von Google und legt sie in
`out/_next/static/media/`. Im Browser gibt es nie einen Abruf bei Google.

Weitere Skripte:

| Befehl | Zweck |
|---|---|
| `npm run bilder` | erzeugt Favicon, App-Symbol und Vorschaubild neu (`scripts/erzeuge-bilder.mjs` nach `public/`) |
| `npm run gates` | prüft im Quelltext Barrierefreiheit, CI-v3-Regeln (keine Schilder, kein aggressives Rot, Orange nur als Akzent), Lenis, Datenschutz, Header-Gleichheit und die v2-Vorgaben (ausgeblendet statt gelöscht, nie „rechtssicher“, Leon, Vorher/Nachher) |
| `npm run gates:out` | prüft den gebauten Export `out/index.html` (nach `npm run build`): sichtbarer Text ohne KI und Schulung, Reihenfolge der Abschnitte, Angebot, vier Ablaufschritte, sechs Fragen, Leon, Menü |
| `node scripts/shots.mjs <url> <ordner> <name> <breite> <höhe> [reduced\|normal] [#id,#id]` | Bildschirmfotos für die Sichtprüfung (lokal) |
| `node scripts/gates/roh-html.mjs --url http://localhost:3000/` | prüft das Server-HTML und die SEO-Grundlagen (braucht laufenden Server) |
| `npm run lint` | ESLint (flache Konfiguration, `eslint.config.mjs`) |

## Deploy

**Vercel.** Projekt mit Wurzelverzeichnis `website`, Framework „Next.js“, Build-Befehl `npm run build`. Next erkennt den
Export und liefert `out/` aus. `vercel.json` setzt `trailingSlash` und die Sicherheits-Header für alle Pfade.

**Eigener Server (nginx).** Inhalt von `out/` nach `/var/www/smartamt/out` kopieren, `deploy/nginx-headers.conf` in den
server-Block (und in jeden location-Block mit eigenen `add_header`-Zeilen) einbinden:

```nginx
server {
    listen 443 ssl;
    server_name www.smartamt.de;
    root /var/www/smartamt/out;
    include /etc/nginx/snippets/smartamt-headers.conf;   # = deploy/nginx-headers.conf
    location / { try_files $uri $uri/ =404; }
    error_page 404 /404.html;
}
```

Die Header in `vercel.json` und `deploy/nginx-headers.conf` sind dieselben (HSTS, nosniff, `X-Frame-Options: DENY`,
Referrer-Policy, Permissions-Policy, CSP). `scripts/gates/header-gleich.mjs` prüft, dass beide Dateien nicht
auseinanderlaufen. Ändert sich ein Wert, beide Dateien anpassen.

## Technik

Next.js 16 (App Router, `output: 'export'`), React 19, TypeScript, Tailwind 3, GSAP 3 (ScrollTrigger, SplitText),
Lenis, lucide-react (nur Linienicons, 1,75 px). Paketverwaltung npm.

- **Kein Tracking, keine Cookies, kein Speicher im Browser, keine externen Aufrufe.** Einziges erlaubtes Fremdziel für
  `fetch` ist die Webhook-Adresse des Formulars (CSP `connect-src`).
- **Schriften** (über `next/font/google`, beim Build selbst gehostet): **Inter** 400 bis 800 (`font-sans`, alles) und
  **JetBrains Mono** 400/500 (`font-mono`, Labels, Adressen, Kennungen). Für die festen Bilder liest
  `scripts/erzeuge-bilder.mjs` beide aus `@fontsource`.
- **Farben** (CSS-Variablen in `src/styles/globals.css`, Tailwind-Klassen in `tailwind.config.ts`): `brand` (NX7-Orange,
  nur Akzent), `ink`, `bg`, `line`, `night`, `ok` (erfüllt, Grün), `warn` (offen, Bernstein), `bad` (nur Formularfehler,
  klein). Keine Schilder, keine großen gelben, orangen oder roten Flächen; `scripts/gates/ci-statisch.mjs` prüft das.
  Größen: `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`, `text-klein`, `text-label`.
- **Bewegung:** Lenis nur bei Maus oder Trackpad (nicht am Finger, nicht bei reduzierter Bewegung), am GSAP-Ticker.
  Bei `prefers-reduced-motion` gibt es keine Scroll-Kopplung, alles steht im Endzustand. Ohne JavaScript ist jeder Text
  lesbar; Animationen setzen Startzustände erst im Effekt (das Skript im Kopf von `layout.tsx` versteckt den Hero nur,
  wenn JavaScript läuft und keine reduzierte Bewegung gewünscht ist, mit Rückfall nach 1,8 s). Animiert wird nur
  `transform` und `opacity`; Aufräumen mit `gsap.context().revert()`.
- **Kontakt-Vorbelegung:** `lib/kontakt.ts` (`waehleAnliegen`, `useAnliegen`, `zerlegeHash`). Der Hauptknopf im Hero
  setzt das Anliegen „website“ und springt zu `#kontakt`; auch `/#kontakt?anliegen=website` funktioniert
  (`HashSprung.tsx`). Der Kontaktabschnitt liest den Wert mit `useAnliegen()`.

## Dateiliste

```
src/app/
  layout.tsx            Schriften, Metadaten, JSON-LD, Kopf, Fuß, Sprunglink
  page.tsx              die vierzehn Abschnitte in Reihenfolge (Bauauftrag v3)
  impressum, datenschutz, barrierefreiheit /page.tsx   Rechtsseiten
  robots.ts, sitemap.ts, manifest.ts                   werden im Export zu robots.txt, sitemap.xml, manifest.webmanifest
  not-found.tsx, error.tsx, global-error.tsx           Fehlerseiten
src/components/ui/
  Logo.tsx              Wortmarke mit Signalpunkt (Smart in Tinte, Amt in Orange)
  Label.tsx             Mono-Label mit „//“
  Leitlinie.tsx         orange Linie, zeichnet sich mit dem Scroll
  Magnet.tsx            Hauptknöpfe folgen der Maus ein Stück
  Reveal.tsx            RevealHeading, RevealText, useHeadingReveal, useTextReveal
  Button.tsx            ButtonLink (primary, secondary)
src/components/layout/
  Header.tsx            feste Kopfzeile, Fortschrittslinie, Menü, Anrufknopf (Handy)
  Footer.tsx            Fuß mit Zierwortmarke
  HashSprung.tsx        Anker aus der Adresse umsetzen
  LegalPage.tsx         Rahmen der Rechtsseiten
src/components/sections/
  Hero, Kunden, Problem, Leistungen, Websites, Ablauf, Schulungen, Lage, Recht, Vision, Referenzen, Team, Faq, Kontakt .tsx
  hero/ (Website-Check), b2/ (Vorher/Nachher, Rangliste), b3/ (Kontaktformular), c1/ (Kundenband, Problemkarten),
  c2/ (Leistungskarten, Zähler), c3/ (Akkordeon, Referenzband, Beraterkarte)
src/lib/        gsap.ts, scroll.ts, kontakt.ts, site.ts, utils.ts
src/hooks/      useSafeReducedMotion.ts, useIsoLayoutEffect.ts
src/providers/  SmoothScrollProvider.tsx
src/styles/     globals.css (Gestaltungssystem)
scripts/        erzeuge-bilder.mjs, gleiche-schulungsbilder-an.mjs, shots.mjs, gates/*.mjs
deploy/         nginx-headers.conf
public/         Symbole, Vorschaubild, images/kunden, images/schulung, images/team
```

## Bausteine

**`Logo`**: `groesse` `'sm'` (24 px) / `'md'` (30 px) / `'lg'` (40 px), `href`, `ohneLink`, `onClick`.
**`Label`**: `as` `'p' | 'span' | 'div'`; auf dunklen Flächen (`.surface-night`) automatisch hell.
**`Leitlinie`**: `richtung` `'senkrecht' | 'waagerecht'`, `strich`, `luecke`, `staerke`, `ausloeser` (Ref auf das Element,
dessen Scrollweg sie zeichnet), `start`, `ende`; Farbe über `currentColor`.
**`RevealHeading`** (`as` h1 bis h4 oder p, `sofort`, `verzoegerung`) und **`RevealText`**: einmalig, nicht am Scroll.
**`ButtonLink`**: `variant` `'primary' | 'secondary'`, `klein`.

Hilfsklassen (`globals.css`): `.wrap`, `.grid-12`, `.section`, `.surface-soft`, `.surface-night`, `.dot-grid`, `.label`,
`.karte`, `.chip-warn`, `.chip-ok`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-klein`, `.link`, `.feld`
(Formularfelder), `.legal` (Rechtstexte).
