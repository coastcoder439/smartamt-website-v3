import { CalendarDays, Landmark, Recycle, Users, type LucideIcon } from 'lucide-react';
import s from './Vergleich.module.css';

/**
 * Die beiden gezeichneten Seiten der erfundenen Beispielgemeinde Musterbach (HTML, CSS und ein SVG, ohne
 * Bilddateien). Nichts darin ist bedienbar: kein Link, kein Knopf, alles aria-hidden im Fenster.
 *
 * Website v2 (Entscheidung 5): Beide Seiten sind echte Gemeinde-Seiten, nichts ist mehr grau angedeutet:
 *
 *  - Vorher: eine typische alte Seite. Blauer Kopf mit Wappen-Kästchen, „Gemeinde Musterbach – Offizielle Homepage
 *    der Gemeinde“, gelbe Laufschrift, linke Linkleiste mit „»“, „Aktuelle Mitteilungen“ mit unterstrichenen Links,
 *    Besucherzähler, Kasten „Google Maps lädt sofort“, Fußzeile „optimiert für 1024×768“.
 *  - Nachher: das Gemeinde-Design der Angebote. Weißer Kopf mit grün-weißem Wappen, Menü Rathaus · Service ·
 *    Aktuelles · Leben, hellgrüne Hinweisleiste mit grünem Punkt, großes Bild (Himmelsverlauf, grüne Hügel, Haus mit
 *    braunem Dach, Kirchturm, runde Bäume; als SVG gezeichnet, kein Foto), Titel „Musterbach“, Suchfeld mit „Suchen“
 *    und „Rathaus anrufen“, darunter vier Kacheln. Vom Stil der Seite, von der die Vorlage stammt, ist nur dieses
 *    Aussehen der Gemeinde-Website übernommen (Owner: „du sollst nicht den Stil übernehmen“).
 *
 * Die Textzeilen der Fußzeile (Technik, Name, Links, Geräte) sitzen in vier gleichen Spalten, damit die Linien der Marken
 * in Vergleich.tsx auf feste Stellen zeigen (Technik links, Links ab 50 %). Farben: globals.css (--mb-*).
 */

const VORHER_LEISTE = ['Startseite', 'Rathaus', 'Bürgerservice', 'Aktuelles', 'Formulare', 'Downloads'];

const VORHER_MELDUNGEN = ['Bekanntmachung (PDF, 4,2 MB)', 'Tagesordnung Gemeinderat', 'Hinweis zur Abfallentsorgung'];

const KACHELN: { label: string; Icon: LucideIcon }[] = [
    { label: 'Bürgerservice', Icon: Users },
    { label: 'Termine', Icon: CalendarDays },
    { label: 'Abfallkalender', Icon: Recycle },
    { label: 'Rathaus & Öffnungszeiten', Icon: Landmark },
];

export function VorherSeite() {
    return (
        <div className={`${s.seite} ${s.alt}`}>
            <div className={s.vKopf}>
                <span className={s.vWappen} />
                <div className={s.vKopfText}>
                    <p className={s.vTitel}>Gemeinde Musterbach</p>
                    <p className={s.vUntertitel}>Offizielle Homepage der Gemeinde</p>
                </div>
            </div>

            <div className={s.vLauf}>
                <span>
                    +++ Herzlich Willkommen auf der Homepage der Gemeinde Musterbach +++ Diese Seite wird derzeit überarbeitet
                    +++
                </span>
            </div>

            <div className={s.vHaupt}>
                <div className={s.vLeiste}>
                    {VORHER_LEISTE.map((punkt) => (
                        <p key={punkt} className={s.vLeistenLink}>
                            » {punkt}
                        </p>
                    ))}
                </div>

                <div className={s.vMitte}>
                    <p className={s.vUeber}>Aktuelle Mitteilungen</p>
                    {VORHER_MELDUNGEN.map((zeile) => (
                        <p key={zeile} className={s.vLink}>
                            {zeile}
                        </p>
                    ))}
                    <p className={s.vText}>Wichtige Informationen für Bürger finden Sie unter Downloads.</p>
                    <p className={s.vZaehler}>Besucher: 0048213</p>
                </div>

                <div className={s.vKarte}>
                    <span>Google Maps lädt sofort</span>
                </div>
            </div>

            <div className={`${s.fuss} ${s.vFuss}`}>
                <span>Läuft mit PHP 7.4</span>
                <span>© Gemeinde Musterbach</span>
                <span>Impressum | Datenschutz | Sitemap</span>
                <span>optimiert für 1024×768</span>
            </div>
        </div>
    );
}

/** Wappen der Gemeinde: Schild, links grün, rechts weiß. */
function Wappen({ className }: { className: string }) {
    return (
        <svg viewBox="0 0 40 48" className={className} aria-hidden="true" focusable="false">
            <defs>
                <clipPath id="mb-wappen-links">
                    <rect x="0" y="0" width="20" height="48" />
                </clipPath>
            </defs>
            <path
                className={s.wappenFlaeche}
                d="M20 2.5 L36.5 8 V24 C36.5 35.5 28 42.5 20 45.5 C12 42.5 3.5 35.5 3.5 24 V8 Z"
            />
            <path
                className={s.wappenGruen}
                clipPath="url(#mb-wappen-links)"
                d="M20 2.5 L36.5 8 V24 C36.5 35.5 28 42.5 20 45.5 C12 42.5 3.5 35.5 3.5 24 V8 Z"
            />
            <path
                className={s.wappenRand}
                d="M20 2.5 L36.5 8 V24 C36.5 35.5 28 42.5 20 45.5 C12 42.5 3.5 35.5 3.5 24 V8 Z"
            />
        </svg>
    );
}

/**
 * Das große Bild der neuen Seite, gezeichnet: Himmelsverlauf, ferne und nahe grüne Hügel, ein Weg, darauf Haus mit braunem
 * Dach, Kirchturm mit Spitze und Uhr, runde Bäume. Die untere Hälfte dunkelt weich ab, damit der weiße Titel lesbar bleibt.
 * Seitenverhältnis 1000 × 212; `slice` schneidet an schmalen Fenstern oben und seitlich zu.
 */
function Silhouette({ className }: { className: string }) {
    return (
        <svg
            viewBox="0 0 1000 212"
            preserveAspectRatio="xMidYMid slice"
            className={className}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id="mb-himmel" x1="0" y1="0" x2="0.18" y2="1">
                    <stop offset="0" className={s.himmelOben} />
                    <stop offset="0.55" className={s.himmelMitte} />
                    <stop offset="1" className={s.himmelUnten} />
                </linearGradient>
                <linearGradient id="mb-abdunkeln" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0.3" stopColor="#000" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity="0.5" />
                </linearGradient>
            </defs>

            <g data-mb="zoom">
                <rect width="1000" height="212" fill="url(#mb-himmel)" />

                {/* weiche Wolken */}
                <g className={s.wolke}>
                    <ellipse cx="190" cy="52" rx="86" ry="13" />
                    <ellipse cx="240" cy="40" rx="52" ry="11" />
                    <ellipse cx="640" cy="34" rx="70" ry="10" />
                    <ellipse cx="690" cy="25" rx="42" ry="8" />
                </g>

                {/* ferne Hügel mit kleinen Baumgruppen */}
                <path className={s.huegelFern} d="M0 138 C110 112 230 108 360 124 S620 112 760 104 S920 112 1000 120 V212 H0 Z" />
                <g className={s.baumFern}>
                    <circle cx="470" cy="119" r="7" />
                    <circle cx="486" cy="122" r="5.5" />
                    <circle cx="548" cy="113" r="6.5" />
                </g>

                {/* mittlerer Hügel, auf dem der Ort steht */}
                <path className={s.huegelMitte} d="M250 212 C390 158 540 116 700 112 S920 130 1000 142 V212 Z" />

                {/* Weg zum Rathaus */}
                <path className={s.weg} d="M520 212 C580 180 640 166 676 154" />

                {/* Kirche: Turm mit Spitze, Uhr und Schallluke */}
                <g>
                    <rect className={s.haus} x="758" y="58" width="34" height="96" />
                    <rect className={s.hausSchatten} x="778" y="58" width="14" height="96" />
                    <polygon className={s.dach} points="754,60 775,10 796,60" />
                    <polygon className={s.dachDunkel} points="775,10 796,60 775,60" />
                    <path className={s.kreuz} d="M775 10 V0 M770 5 H780" />
                    <circle className={s.uhr} cx="775" cy="80" r="8" />
                    <path className={s.zeiger} d="M775 80 V74 M775 80 L780 82" />
                    <rect className={s.fenster} x="770" y="100" width="10" height="20" rx="5" />
                </g>

                {/* Haus mit braunem Dach */}
                <g>
                    <rect className={s.haus} x="634" y="104" width="104" height="50" />
                    <rect className={s.hausSchatten} x="708" y="104" width="30" height="50" />
                    <polygon className={s.dach} points="620,106 686,64 752,106" />
                    <polygon className={s.dachDunkel} points="686,64 752,106 686,106" />
                    <rect className={s.fenster} x="652" y="120" width="18" height="18" rx="2" />
                    <rect className={s.fenster} x="682" y="120" width="18" height="18" rx="2" />
                    <rect className={s.tuer} x="712" y="124" width="16" height="30" rx="2" />
                </g>

                {/* runde Bäume vorn */}
                <g>
                    <circle className={s.baum} cx="826" cy="142" r="24" />
                    <circle className={s.baumHell} cx="819" cy="134" r="10" />
                    <circle className={s.baum} cx="872" cy="152" r="17" />
                    <circle className={s.baumHell} cx="867" cy="146" r="7" />
                    <circle className={s.baum} cx="602" cy="146" r="14" />
                    <circle className={s.baum} cx="944" cy="144" r="22" />
                    <circle className={s.baumHell} cx="938" cy="137" r="9" />
                </g>

                {/* nahe Hügelkante, unten dunkel */}
                <path className={s.huegelNah} d="M0 176 C160 158 330 150 520 166 S860 164 1000 160 V212 H0 Z" />
                <rect width="1000" height="212" fill="url(#mb-abdunkeln)" />
            </g>
        </svg>
    );
}

export function NachherSeite() {
    return (
        <div className={`${s.seite} ${s.neu}`}>
            <div className={s.nKopf}>
                <span className={s.nMarke}>
                    <Wappen className={s.nWappen} />
                    <span className={s.nName}>Gemeinde Musterbach</span>
                </span>
                <div className={s.nNav}>
                    <span>Rathaus</span>
                    <span>Service</span>
                    <span>Aktuelles</span>
                    <span>Leben</span>
                </div>
            </div>

            <div className={s.nHinweis}>
                <span className={s.nPunkt} />
                <span>Vollsperrung der Bachstraße ab Montag</span>
            </div>

            <div className={s.nHeld}>
                <Silhouette className={s.nBild} />
                <div data-mb="text" className={s.nHeldText}>
                    <p className={s.nTitel}>Musterbach</p>
                    <p className={s.nUntertitel}>Willkommen im Rathaus: kurze Wege, alles Wichtige auf einer Seite.</p>
                </div>
                <div data-mb="suche" className={s.nSuche}>
                    <span className={s.nFeld}>Wonach suchen Sie?</span>
                    <span className={s.nKnopf}>Suchen</span>
                    <span className={s.nKnopf}>Rathaus anrufen</span>
                </div>
            </div>

            <div className={s.nTiles}>
                {KACHELN.map(({ label, Icon }) => (
                    <div key={label} data-mb="kachel" className={s.nKachel}>
                        <span className={s.nIconFlaeche}>
                            <Icon className={s.nIcon} strokeWidth={1.75} aria-hidden="true" />
                        </span>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <div className={`${s.fuss} ${s.nFuss}`}>
                <span>Läuft mit PHP 8.4</span>
                <span>© Gemeinde Musterbach</span>
                <span>Impressum · Datenschutz · Barrierefreiheit</span>
                <span>Für jedes Gerät gebaut</span>
            </div>
        </div>
    );
}
