import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import HashSprung from '@/components/layout/HashSprung';
import Farbwahl from '@/components/ui/Farbwahl';
import LogoSprite from '@/components/ui/LogoSprite';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';
import { EINZELNES } from '@/lib/abschnitte';
import { LOGO_IDS, LOGO_STANDARD } from '@/lib/logos';
import { ABSENDER, KONTAKT, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';

import '@/styles/globals.css';

// Schriften der CI v3 (hell, freundlich, NX7-Familie): Inter für alles, JetBrains Mono für Labels.
// next/font lädt sie beim Build, legt sie in den Export und liefert sie von der eigenen Adresse aus.
const sans = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

const mono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_TITLE,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: ABSENDER.name, url: ABSENDER.url }],
    creator: ABSENDER.name,
    publisher: ABSENDER.name,
    robots: { index: true, follow: true },
    // Bildmarke: oranges abgerundetes Quadrat mit weißem „S“. Die Dateien erzeugt scripts/erzeuge-bilder.mjs
    // (npm run bilder).
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '32x32' },
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
        type: 'website',
        locale: 'de_DE',
        siteName: SITE_NAME,
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        url: '/',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'SmartAmt – Ihr digitales Ortseingangsschild. Sichere Websites für Gemeinden, Ämter und Behörden, daneben die Beispielansicht des Website-Checks einer erfundenen Gemeinde',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: ['/og-image.png'],
    },
};

export const viewport: Viewport = {
    themeColor: '#ffffff',
    width: 'device-width',
    initialScale: 1,
};

// Strukturierte Daten: Wer bietet hier was an, und wer steht dahinter.
const organisation = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organisation`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    description: SITE_DESCRIPTION,
    email: KONTAKT.email,
    telephone: KONTAKT.telefonInternational,
    address: {
        '@type': 'PostalAddress',
        streetAddress: KONTAKT.strasse,
        postalCode: KONTAKT.plz,
        addressLocality: KONTAKT.ort,
        addressCountry: 'DE',
    },
    areaServed: { '@type': 'Country', name: 'Deutschland' },
    parentOrganization: {
        '@type': 'Organization',
        name: ABSENDER.name,
        url: ABSENDER.url,
    },
};

// Läuft vor dem ersten Bild: Markiert, dass JavaScript läuft (html.js) und ob reduzierte Bewegung
// gewünscht ist (html.rm). Nur wenn js gesetzt und rm nicht gesetzt ist, versteckt die CSS-Regel die
// Hero-Elemente bis zum Start ihrer Animation. Ohne JavaScript bleibt alles sichtbar.
const SKRIPT_ANFANG =
    "(function(){var d=document.documentElement;d.classList.add('js');try{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('rm');}}catch(e){}";

// Farbwahl (nur wenn EINZELNES.farbwahl an ist): Liest ?farbe=orange|hellblau|violett|gruen aus der Adresse und setzt
// data-farbe am html-Element, noch vor dem ersten Bild (kein Aufblitzen). Ein unbekannter oder fehlender Wert ergibt
// Orange. Die Wahl steht nur in der Adresse; es wird nichts im Browser gespeichert (kein Cookie, kein Speicher).
// Die Liste der Werte muss mit FARBEN in components/ui/Farbwahl.tsx und den Blöcken data-farbe in globals.css
// übereinstimmen (prüft scripts/gates/farbwahl-statisch.mjs).
const SKRIPT_FARBE =
    "try{var m=/[?&]farbe=([^&#]*)/.exec(location.search);var f=m?decodeURIComponent(m[1]).toLowerCase():'';d.setAttribute('data-farbe',['orange','hellblau','violett','gruen'].indexOf(f)>-1?f:'orange');}catch(e){}";

// Logo-Wahl (gehört zur Farbwahl): Liest ?logo=… und setzt data-logo am html-Element; ein unbekannter oder fehlender Wert
// ergibt den Standard (LOGO_STANDARD). Die Werte kommen aus der einen Liste in lib/logos.ts.
const SKRIPT_LOGO = `try{var l=/[?&]logo=([^&#]*)/.exec(location.search);var w=l?decodeURIComponent(l[1]).toLowerCase():'';d.setAttribute('data-logo',${JSON.stringify(LOGO_IDS)}.indexOf(w)>-1?w:'${LOGO_STANDARD}');}catch(e){}`;

const FRUEHES_SKRIPT =
    SKRIPT_ANFANG + (EINZELNES.farbwahl ? SKRIPT_FARBE : '') + (EINZELNES.farbwahl ? SKRIPT_LOGO : '') + '})();';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="de"
            className={`${sans.variable} ${mono.variable}${EINZELNES.punktraster ? '' : ' punkte-aus'}`}
            suppressHydrationWarning
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: FRUEHES_SKRIPT }} />
            </head>
            <body>
                <LogoSprite />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organisation).replace(/</g, '\\u003c') }}
                />
                <a href="#inhalt" className="skip-link">
                    Zum Inhalt springen
                </a>
                <SmoothScrollProvider>
                    <Header />
                    <main id="inhalt" tabIndex={-1}>
                        {children}
                    </main>
                    <Footer />
                    <HashSprung />
                    {EINZELNES.farbwahl ? <Farbwahl /> : null}
                </SmoothScrollProvider>
            </body>
        </html>
    );
}
