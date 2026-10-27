'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { bewegungReduziert, gsap, registerGsap } from '@/lib/gsap';

/**
 * Produktansicht im Hero: der SmartAmt-Website-Check für die erfundene Beispielgemeinde Musterbach.
 *
 * Keine erfundenen Messwerte: Die Ansicht zeigt nur, ob ein Prüfpunkt erfüllt ist (fünf von fünf),
 * keine Punktzahl und keine Versionsnummern. Dass es ein Beispiel ist, steht sichtbar im Kartenlabel
 * („· Beispiel“) und in der Fußzeile der Karte („Beispielgemeinde Musterbach (erfunden)“, Muster
 * Vergleich.tsx), nicht nur im aria-label.
 *
 * Das Server-HTML zeigt den Endzustand (alles erfüllt). Mit JavaScript und ohne reduzierte Bewegung
 * startet die Ansicht im Vorher-Zustand (alle Punkte offen, Zähler 0) und hakt die Punkte nacheinander
 * ab, während eine dünne orange Prüflinie über die Liste läuft und Zähler und Ring mitwachsen (Takt 0,2 s,
 * die ganze Sequenz steht nach rund 2,5 s). Noch während der letzten Punkte schweben die beiden Hinweise herein
 * und je ein gezeichneter Strich bindet sie zeitgleich an ihren Prüfpunkt:
 * „Art. 32 DSGVO / Stand der Technik“ an „Software auf aktuellem Stand“, „WCAG 2.1 AA“ an „Erklärung
 * zur Barrierefreiheit“. Beide Hinweise hängen am rechten Rand: der erste ragt oben, der zweite unten über die
 * Karte hinaus (unten sitzt er auf der leeren rechten Seite der Fußzeile). Hinter der Karte liegt eine zweite
 * weiße Karte, parallel versetzt (14 px nach rechts, 12 px nach oben, gleiche Rundung, schwächerer Schatten,
 * keine Drehung und keine Farbfläche) für Tiefe; beim Scrollen driftet sie etwas schneller als die Karte.
 *
 * Ruhige Farben: offen = Bernstein, erfüllt = Grün. Kein Rot.
 *
 * Die Striche werden aus den echten Positionen gemessen (offsetLeft/offsetTop, unabhängig von
 * Transformationen) und bei jeder Größenänderung neu gesetzt. Ohne JavaScript fehlen sie, sie sind
 * reine Zierde. Hinweise und Striche gibt es ab 1024 px; darunter bleibt die Karte allein. Von 1024 bis 1279 px
 * steht die Adresszeile links neben den Fensterpunkten (zentriert erst ab 1280 px), damit sie nie am oberen
 * Hinweis klebt.
 */
const PUNKTE = [
    { titel: 'Software auf aktuellem Stand', vorher: 'veraltet', nachher: 'aktuell' },
    { titel: 'Verschlüsselte Verbindung', vorher: 'teilweise', nachher: 'durchgehend' },
    { titel: 'Cookies nur mit Einwilligung', vorher: 'ungefragt', nachher: 'geregelt' },
    { titel: 'Schriften vom eigenen Server', vorher: 'Google', nachher: 'lokal' },
    { titel: 'Erklärung zur Barrierefreiheit', vorher: 'fehlt', nachher: 'vorhanden' },
];

const ANZAHL = PUNKTE.length;
const RADIUS = 52;
const UMFANG = 2 * Math.PI * RADIUS;

export function WebsiteCheck() {
    const wurzel = useRef<HTMLDivElement>(null);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el) return;

        const zeilen = Array.from(el.querySelectorAll<HTMLElement>('[data-punkt]'));
        const zahl = el.querySelector<HTMLElement>('[data-zahl]');
        const ring = el.querySelector<SVGCircleElement>('[data-ring]');
        const status = el.querySelector<HTMLElement>('[data-status]');
        const liste = el.querySelector<HTMLElement>('[data-liste]');
        const linie = el.querySelector<HTMLElement>('[data-pruefline]');
        const hinweise = Array.from(el.querySelectorAll<HTMLElement>('[data-hinweis]'));
        const striche = Array.from(el.querySelectorAll<HTMLElement>('[data-leader]'));
        const hinten = el.querySelector<HTMLElement>('[data-hinten]');

        // Position eines Elements in der Karten-Wurzel, ohne Transformationen (offset*).
        const lage = (n: HTMLElement) => {
            let x = 0;
            let y = 0;
            let k: HTMLElement | null = n;
            while (k && k !== el) {
                x += k.offsetLeft;
                y += k.offsetTop;
                k = k.offsetParent as HTMLElement | null;
            }
            return { x, y, w: n.offsetWidth, h: n.offsetHeight };
        };

        // Striche zwischen Hinweis und Prüfpunkt setzen (Länge, Lage, Richtung).
        const messen = () => {
            for (const s of striche) {
                const von = el.querySelector<HTMLElement>(`[data-hinweis="${s.dataset.von}"]`);
                const nach = el.querySelector<HTMLElement>(`[data-punkt="${s.dataset.nach}"]`);
                if (!von || !nach || von.offsetParent === null) {
                    s.style.display = 'none';
                    continue;
                }
                const a = lage(von);
                const b = lage(nach);
                const abwaerts = a.y + a.h <= b.y;
                const oben = abwaerts ? a.y + a.h : b.y + b.h;
                const hoehe = abwaerts ? b.y - oben : a.y - oben;
                if (hoehe < 8) {
                    s.style.display = 'none';
                    continue;
                }
                s.style.display = 'block';
                s.style.left = `${Math.round(a.x + a.w * Number(s.dataset.ax ?? 0.2))}px`;
                s.style.top = `${oben}px`;
                s.style.height = `${hoehe}px`;
                s.dataset.richtung = abwaerts ? 'ab' : 'auf';
                const kopf = s.querySelector<HTMLElement>('[data-kopf]');
                if (kopf) {
                    kopf.style.top = abwaerts ? 'auto' : '-3px';
                    kopf.style.bottom = abwaerts ? '-3px' : 'auto';
                }
            }
        };

        messen();
        const beobachter = new ResizeObserver(messen);
        beobachter.observe(el);
        if (document.fonts) document.fonts.ready.then(messen, () => undefined);

        if (bewegungReduziert()) {
            return () => beobachter.disconnect();
        }
        registerGsap();

        const ctx = gsap.context(() => {
            // Vorher-Zustand setzen
            for (const z of zeilen) z.dataset.state = 'offen';
            if (status) status.dataset.state = 'offen';
            const stand = { wert: 0 };
            const zeichne = () => {
                if (zahl) zahl.textContent = String(Math.round(stand.wert));
                if (ring) ring.style.strokeDashoffset = String(UMFANG * (1 - stand.wert / ANZAHL));
            };
            zeichne();
            gsap.set(hinweise, { opacity: 0, y: 8 });
            for (const s of striche) {
                const abwaerts = s.dataset.richtung !== 'auf';
                const strich = s.querySelector('[data-strich]');
                const kopf = s.querySelector('[data-kopf]');
                if (strich) gsap.set(strich, { scaleY: 0, transformOrigin: abwaerts ? '50% 0%' : '50% 100%' });
                if (kopf) gsap.set(kopf, { scale: 0 });
            }

            // Gesamtdauer der Sequenz höchstens rund 3 s: Punkte im Takt von 0,2 s, Hinweise und Striche kommen
            // schon während der letzten Punkte und zeichnen sich gleichzeitig (nicht erst danach).
            const schritt = 0.2;
            const fertigAb = 0.2 + zeilen.length * schritt;
            const tl = gsap.timeline({ delay: 0.5, defaults: { ease: 'power2.out' }, onComplete: messen });
            zeilen.forEach((z, i) => {
                const t = 0.2 + i * schritt;
                tl.call(() => {
                    z.dataset.state = 'ok';
                }, [], t);
                tl.to(stand, { wert: i + 1, duration: 0.25, ease: 'power2.out', onUpdate: zeichne }, t);
            });
            tl.call(() => {
                if (status) status.dataset.state = 'ok';
            }, [], fertigAb);

            // Prüflinie: läuft einmal von oben nach unten über die Liste und blendet dann aus
            if (linie && liste) {
                tl.fromTo(
                    linie,
                    { y: 0, opacity: 1 },
                    { y: () => liste.offsetHeight, duration: zeilen.length * schritt, ease: 'none', immediateRender: false },
                    0.2,
                );
                tl.to(linie, { opacity: 0, duration: 0.25 }, fertigAb);
            }

            // Hinweise und Striche: die Hinweise schweben herein, ihre Striche zeichnen sich zeitgleich (bündig, kurz danach der Punkt)
            const ab = fertigAb - 0.35;
            tl.to(hinweise, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.1 }, ab);
            striche.forEach((s, i) => {
                const strich = s.querySelector('[data-strich]');
                const kopf = s.querySelector('[data-kopf]');
                const t = ab + 0.12 + i * 0.1;
                if (strich) tl.to(strich, { scaleY: 1, duration: 0.5, ease: 'power3.inOut' }, t);
                if (kopf) tl.to(kopf, { scale: 1, duration: 0.3, ease: 'power3.out' }, t + 0.4);
            });

            // Hinter der Karte: die zweite Ebene schiebt sich unter der Karte hervor (parallel, ohne Drehung)
            if (hinten) {
                gsap.from(hinten, { opacity: 0, x: -14, y: 12, duration: 0.9, ease: 'expo.out', delay: 0.3 });
            }

            // Ruhige Parallaxe beim Scrollen: die Ansicht bleibt etwas zurück, die hintere Ebene
            // wandert schneller nach oben, das gibt Tiefe. Hinweise und Striche bleiben fest an der Karte.
            gsap.to(el, {
                yPercent: -4,
                ease: 'none',
                scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom top', scrub: 0.6 },
            });
            if (hinten) {
                gsap.fromTo(
                    hinten,
                    { y: 0 },
                    {
                        y: -24,
                        ease: 'none',
                        immediateRender: false,
                        scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom top', scrub: 0.9 },
                    },
                );
            }
        }, el);

        return () => {
            beobachter.disconnect();
            ctx.revert();
        };
    }, []);

    return (
        <div
            ref={wurzel}
            className="relative isolate"
            role="img"
            aria-label="Beispiel: Website-Check der erfundenen Gemeinde Musterbach, fünf von fünf Prüfpunkten erfüllt"
        >
            {/* warmes Licht hinter der Ansicht */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-10 -z-20 rounded-[48px] opacity-70 blur-3xl"
                style={{ background: 'radial-gradient(60% 60% at 60% 40%, var(--brand-100), transparent 70%)' }}
            />

            {/* hintere Ebene: eine zweite weiße Karte, parallel nach rechts oben versetzt (gleiche Rundung wie die
                Vordere, schwächerer Schatten). Keine Drehung, keine Farbfläche. */}
            <div
                aria-hidden="true"
                data-hinten
                className="absolute -right-2.5 -top-2 bottom-2 left-2.5 -z-10 rounded-[20px] border border-line-2 bg-white shadow-sm sm:-right-3.5 sm:-top-3 sm:bottom-3 sm:left-3.5"
            />

            <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-lg">
                {/* Fensterleiste */}
                <div className="flex items-center gap-3 border-b border-line bg-bg-2 px-4 py-2.5">
                    <span className="flex gap-1.5" aria-hidden="true">
                        <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
                        <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
                        <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
                    </span>
                    <span className="mx-auto truncate rounded-full border border-line bg-white px-4 py-1 font-mono text-[12px] text-ink-3 lg:mx-0 xl:mx-auto">
                        www.musterbach.de
                    </span>
                    <span className="w-[42px]" aria-hidden="true" />
                </div>

                <div className="p-5 sm:px-7 sm:py-6">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-brand-ink">
                            SmartAmt Website-Check · Beispiel
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-3">
                            <p className="text-[17px] font-semibold tracking-[-0.01em] text-ink">Gemeinde Musterbach</p>
                            <span
                                data-status
                                data-state="ok"
                                className="group/status flex-none rounded-full px-3 py-1 text-[12px] font-semibold transition-colors duration-500 data-[state=offen]:bg-warn-50 data-[state=ok]:bg-ok-50 data-[state=offen]:text-warn data-[state=ok]:text-ok"
                            >
                                <span className="group-data-[state=offen]/status:hidden">Alles erfüllt</span>
                                <span className="hidden group-data-[state=offen]/status:inline">Prüfung läuft</span>
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid items-center gap-5 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-6 xl:grid-cols-[140px_minmax(0,1fr)]">
                        {/* Ergebnis-Ring: Anteil erfüllter Prüfpunkte */}
                        <div className="relative mx-auto h-[130px] w-[130px] xl:h-[140px] xl:w-[140px]">
                            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
                                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--bg-3)" strokeWidth="10" />
                                <circle
                                    data-ring
                                    cx="60"
                                    cy="60"
                                    r={RADIUS}
                                    fill="none"
                                    stroke="var(--brand)"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={UMFANG}
                                    strokeDashoffset={0}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span data-zahl className="text-[40px] font-bold leading-none tracking-[-0.04em] text-ink xl:text-[44px]">
                                    {ANZAHL}
                                </span>
                                <span className="mt-1 text-[12px] text-ink-3">von {ANZAHL} erfüllt</span>
                            </div>
                        </div>

                        {/* Prüfpunkte mit Prüflinie */}
                        <div data-liste className="relative">
                            <ul className="space-y-2">
                                {PUNKTE.map((p, i) => (
                                    <li
                                        key={p.titel}
                                        data-punkt={i}
                                        data-state="ok"
                                        className="group/punkt flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 transition-colors duration-500 data-[state=ok]:border-[color-mix(in_srgb,var(--ok)_22%,white)] data-[state=ok]:bg-ok-50"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="relative flex h-6 w-6 flex-none items-center justify-center rounded-full transition-colors duration-500 group-data-[state=offen]/punkt:bg-warn-50 group-data-[state=ok]/punkt:bg-ok"
                                        >
                                            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white group-data-[state=offen]/punkt:hidden" fill="none">
                                                <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span className="hidden h-2 w-2 rounded-full bg-warn-dot group-data-[state=offen]/punkt:block" />
                                        </span>
                                        <span className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-ink">{p.titel}</span>
                                        <span className="font-mono text-[12px] text-ink-3">
                                            <span className="group-data-[state=offen]/punkt:hidden">{p.nachher}</span>
                                            <span className="hidden group-data-[state=offen]/punkt:inline">{p.vorher}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div
                                aria-hidden="true"
                                data-pruefline
                                className="pointer-events-none absolute -inset-x-1 top-0 h-[2px] rounded-full bg-brand opacity-0 shadow-[0_0_14px_2px_color-mix(in_srgb,var(--brand)_45%,transparent)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Fußzeile der Karte: kennzeichnet das Beispiel sichtbar */}
                <p className="border-t border-line bg-bg-2 px-5 py-2.5 font-mono text-[12px] leading-snug text-ink-3 sm:px-7">
                    Beispielgemeinde Musterbach (erfunden)
                </p>
            </div>

            {/* Hinweise hängen am Rand der Karte; je ein gezeichneter Strich bindet sie an ihren Prüfpunkt */}
            <div
                aria-hidden="true"
                data-hinweis="dsgvo"
                className="absolute -top-5 right-6 hidden w-[158px] rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-md lg:block"
            >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Art. 32 DSGVO</p>
                <p className="text-[13px] font-semibold text-ink">Stand der Technik</p>
            </div>
            <div
                aria-hidden="true"
                data-hinweis="wcag"
                className="absolute -bottom-5 right-6 hidden w-[158px] rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-md lg:block"
            >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Barrierefreiheit</p>
                <p className="text-[13px] font-semibold text-ink">WCAG 2.1 AA</p>
            </div>

            <Strich von="dsgvo" nach={0} ax={0.14} />
            <Strich von="wcag" nach={ANZAHL - 1} ax={0.2} />
        </div>
    );
}

/** Zeichnet (per JavaScript gemessen) den Strich von einem Hinweis zu einem Prüfpunkt. */
function Strich({ von, nach, ax }: { von: string; nach: number; ax: number }) {
    return (
        <span
            aria-hidden="true"
            data-leader
            data-von={von}
            data-nach={nach}
            data-ax={ax}
            className="pointer-events-none absolute z-10 -ml-px hidden w-[2px]"
        >
            <span data-strich className="absolute inset-0 rounded-full bg-brand" />
            <span
                data-kopf
                className="absolute left-1/2 h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-brand"
                style={{ boxShadow: '0 0 0 4px var(--brand-100)' }}
            />
        </span>
    );
}

export default WebsiteCheck;
