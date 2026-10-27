'use client';

import { useRef } from 'react';
import { Label } from '@/components/ui/Label';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';
import { PUNKTE } from '../Leitbild';
import { Fussnote } from '@/components/seiten/Fussnoten';
import { LABEL_GROSS } from '../c2/abschnitt';
import { NETZ, STAEDTE } from './deutschland-karte';
import KarteSvg, { type KartenStufen } from './KarteSvg';

/**
 * Leitbild und Deutschlandkarte in einem Abschnitt (id leitbild), Website v3, Seite /ueber-uns. Owner 27.10.2026: „Das sollte
 * nebeneinander sein. Deutschland auf dem Weg zum Platz 1, mit dem kurzen Text, heute steht das auf Platz 12 … Und dann diese
 * Quelle, rausnehmen, darunter die Karte. Das ist auf der linken Seite. Und rechts daneben sind die 5 Punkte. Und mit jedem
 * Punkt beim Runterscrollen kommt ein Häkchen dann ran. Und währenddessen werden auch immer mehr Karten Dinger da vernetzt. …
 * die Vernetzung ein bisschen ruhiger gestalten dementsprechend mit dem Scroll, passend zu den 5 Punkten. Und nicht … von oben
 * nach unten nur erscheinen lassen, die sollen überall gleichzeitig aufpoppen in Deutschland, so verteilt.“
 *
 * Links (Owner 27.10.2026: „ohne eklige Scroll-Element … genau auf dieselbe Größe skaliert … wie die Karte“, darum ohne
 * mitlaufende Spalte, rechts kompakt in der Höhe der linken Spalte): Ziel „Deutschland auf dem Weg zu Platz 1.“ (als Ziel, heute Platz 12 im UN
 * E-Government Survey 2024, docs/research/facts-context.md, Abschnitt 2) und darunter die Karte (ueber/KarteSvg.tsx). Rechts die
 * fünf Versprechen (Texte aus Leitbild.tsx). Beim Scrollen bekommt ein Punkt nach dem anderen sein Häkchen; mit jedem Häkchen
 * erscheinen auf der Karte mehrere Zeichen zugleich, über ganz Deutschland verteilt (feste Zufallsverteilung in fünf Stufen, je
 * Stufe ein Ort aus jedem Nord-Süd-Band),
 * und die Linien zwischen den sichtbaren Orten zeichnen sich. Ab 1024 px rastet der Abschnitt ein, sobald er unter der Kopfleiste steht; das
 * Scrollen treibt dann die fünf Punkte voran, danach geht die Seite weiter (Owner 27.10.2026: „dann lockt das so lange, bis man die
 * 5 Punkte durchgescrollt hat“). Alle fünf Punkte sind dabei im Bild („erst erscheinen, wenn man auch wirklich alle 5 Punkte auf
 * dem Bildschirm sieht“), Häkchen und Orte kommen nacheinander.
 *
 * Am Handy steht die Karte über den Punkten; sie baut sich dort beim Durchscrollen der Karte selbst in denselben Stufen auf,
 * die Häkchen folgen je Punkt. Das Server-HTML ist der Endzustand (alle Häkchen, ganzes Netz): ohne JavaScript und bei
 * prefers-reduced-motion steht alles fertig da. Nur transform, opacity und stroke-dashoffset.
 */

const STUFEN_ANZAHL = PUNKTE.length;

/**
 * Feste Zufallsverteilung (Startwert 7), damit Server und Browser dieselben Stufen haben. Die Orte werden von Nord nach Süd in
 * Bänder zu je fünf geteilt; in jedem Band bekommt jede Stufe einen zufälligen Ort. So erscheint jede Stufe über ganz Deutschland
 * verteilt, nicht von oben nach unten.
 */
function stufenBerechnen(): KartenStufen {
    let zustand = 7;
    const zufall = () => {
        zustand = (zustand * 1103515245 + 12345) % 2147483648;
        return zustand / 2147483648;
    };
    const mischen = <T,>(liste: T[]) => {
        for (let i = liste.length - 1; i > 0; i--) {
            const j = Math.floor(zufall() * (i + 1));
            [liste[i], liste[j]] = [liste[j], liste[i]];
        }
        return liste;
    };
    const nachSueden = STAEDTE.map((_, i) => i).sort((a, b) => STAEDTE[a].y - STAEDTE[b].y);
    const stadt = new Array<number>(STAEDTE.length).fill(0);
    for (let band = 0; band < nachSueden.length; band += STUFEN_ANZAHL) {
        const orte = nachSueden.slice(band, band + STUFEN_ANZAHL);
        const stufen = mischen(Array.from({ length: STUFEN_ANZAHL }, (_, n) => n)).slice(0, orte.length);
        orte.forEach((ort, k) => {
            stadt[ort] = stufen[k];
        });
    }
    const linie = NETZ.map(([a, b]) => Math.max(stadt[a], stadt[b]));
    return { stadt, linie };
}

const STUFEN = stufenBerechnen();

/** Häkchen in der Markenfarbe der gewählten Farbvariante (Owner 27.10.2026: „die Häkchenfarbe ist CI-Farbe“). */
function Haken() {
    // Leerer Ring (immer da), darüber die gefüllte Scheibe in der Markenfarbe mit Häkchen in Tinte bzw. Weiß (--on-brand);
    // Scheibe und Häkchen erscheinen beim Scrollen.
    return (
        <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false" className="size-9 flex-none">
            <circle cx="18" cy="18" r="16.5" strokeWidth="1.5" className="fill-bg stroke-line-2" />
            <circle data-kreis cx="18" cy="18" r="17.25" className="fill-brand" />
            <path
                data-haken
                d="M11 18.5l5 5L25.5 13"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={0}
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="fill-none stroke-[var(--on-brand)]"
            />
        </svg>
    );
}

export default function LeitbildKarte() {
    const wurzel = useRef<HTMLElement>(null);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el) return;
        registerGsap();
        const karte = el.querySelector<SVGSVGElement>('[data-karte]');
        const liste = el.querySelector<HTMLElement>('[data-punkte]');
        if (!karte || !liste) return;

        const punkte = gsap.utils.toArray<HTMLElement>(liste.querySelectorAll('[data-punkt]'));
        const stufe = (n: number) => ({
            orte: gsap.utils.toArray<SVGGElement>(karte.querySelectorAll(`[data-stadt][data-stufe="${n}"]`)),
            linien: gsap.utils.toArray<SVGLineElement>(karte.querySelectorAll(`[data-linie][data-stufe="${n}"]`)),
        });

        /**
         * Zeitleiste in Ruhe (zeitbasiert, nicht am Scroll): Punkt für Punkt erst das Häkchen, dann ploppen die Orte dieser Stufe
         * einzeln nacheinander auf, danach zeichnen sich ihre Linien. Owner 27.10.2026: „ich möchte nicht, dass die so schnell und so
         * viele auf einmal aufploppen. Schön nacheinander.“
         */
        const ablauf = (mitPunkten: boolean) => {
            const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
            for (let n = 0; n < STUFEN_ANZAHL; n++) {
                const { orte, linien } = stufe(n);
                const punkt = punkte[n];
                const marke = `stufe${n}`;
                tl.addLabel(marke);
                if (mitPunkten && punkt) {
                    tl.to(punkt, { opacity: 1, duration: 0.5 }, marke);
                    tl.to(punkt.querySelector('[data-kreis]'), { scale: 1, opacity: 1, duration: 0.4 }, marke);
                    tl.to(punkt.querySelector('[data-haken]'), { strokeDashoffset: 0, duration: 0.5 }, `${marke}+=0.2`);
                }
                tl.to(orte, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)', stagger: 0.35 }, `${marke}+=0.5`);
                tl.to(linien, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut', stagger: 0.15 }, '>-0.1');
            }
            return tl;
        };
        const startzustand = (mitPunkten: boolean) => {
            gsap.set(karte.querySelectorAll('[data-stadt]'), { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
            gsap.set(karte.querySelectorAll('[data-linie]'), { strokeDashoffset: 1 });
            if (mitPunkten) {
                gsap.set(punkte, { opacity: 0.6 });
                gsap.set(liste.querySelectorAll('[data-kreis]'), { scale: 0.6, opacity: 0, transformOrigin: '50% 50%' });
                gsap.set(liste.querySelectorAll('[data-haken]'), { strokeDashoffset: 1 });
            }
        };

        const mm = gsap.matchMedia();
        // Ab 1024 px: Der Abschnitt rastet unter der Kopfleiste ein (pin). Solange er steht, treibt das Scrollen die fünf Punkte
        // voran: Häkchen für Häkchen, dazu ploppen die Orte einzeln auf und die Linien zeichnen sich. Danach scrollt die Seite
        // weiter. Owner 27.10.2026: „Man scrollt runter auf Deutschland auf Platz 1, dann lockt das so lange, bis man die 5 Punkte
        // durchgescrollt hat. Und dann scrollt die Seite es weiter.“
        mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
            startzustand(true);
            const tl = ablauf(true);
            tl.paused(false);
            ScrollTrigger.create({
                trigger: el,
                start: () => `top top+=${document.querySelector('header')?.getBoundingClientRect().height ?? 0}`,
                end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
                pin: true,
                scrub: 0.8,
                animation: tl,
                invalidateOnRefresh: true,
            });
        });
        // Darunter: kein Einrasten; die Karte startet, wenn sie ganz im Bild ist, die Häkchen kommen je Punkt.
        mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
            startzustand(false);
            const tl = ablauf(false);
            ScrollTrigger.create({ trigger: karte, start: 'bottom 98%', once: true, onEnter: () => tl.play() });
            for (const punkt of punkte) {
                gsap.set(punkt, { opacity: 0.6 });
                const zeit = gsap.timeline({ paused: true });
                zeit.fromTo(punkt, { opacity: 0.6 }, { opacity: 1, duration: 0.5 }, 0);
                zeit.fromTo(punkt.querySelector('[data-kreis]'), { scale: 0.6, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.4 }, 0);
                zeit.fromTo(punkt.querySelector('[data-haken]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5 }, 0.2);
                ScrollTrigger.create({ trigger: punkt, start: 'bottom 95%', once: true, onEnter: () => zeit.play() });
            }
        });

        return () => mm.revert();
    }, []);

    return (
        <section
            ref={wurzel}
            id="leitbild"
            aria-labelledby="leitbild-titel"
            className="section surface-soft relative isolate scroll-mt-[var(--header-h)] lg:!py-8"
        >
            <div className="wrap grid-12 items-stretch gap-y-12">
                {/* Links: Ziel, kurzer Text und Karte; ab 1024 px bleibt die Spalte stehen */}
                <div className="col-span-12 lg:col-span-6">
                    <Label className={LABEL_GROSS}>Unser Ziel</Label>
                    <RevealHeading as="h2" id="leitbild-titel" className="mt-3 text-[clamp(2rem,1.3rem+2.2vw,3.25rem)] leading-[1.04]">
                        Deutschland auf dem Weg zu <span className="whitespace-nowrap text-brand-600">Platz 1.</span>
                    </RevealHeading>
                    <RevealText className="mt-4 max-w-[34em] text-[1.0625rem] leading-[1.55] text-ink-2">
                        Heute steht Deutschland auf Platz 12 im{' '}
                        <span className="whitespace-nowrap">E-Government-Ranking</span> der Vereinten Nationen.
                        <Fussnote n={1} /> Unser Ziel: Gemeinde für
                        Gemeinde ein Netz aus Websites, auf denen sich alle gleich gut zurechtfinden.
                    </RevealText>
                    <div className="mt-6 [&_[data-land]]:fill-bg">
                        <KarteSvg
                            stufen={STUFEN}
                            className="mx-auto block h-auto max-h-[calc(100svh-var(--header-h)-21rem)] w-full max-w-[34rem] lg:mx-0"
                        />
                    </div>
                </div>

                {/* Rechts: die fünf Versprechen; je Punkt ein Häkchen beim Scrollen */}
                <div className="col-span-12 flex flex-col lg:col-span-6 lg:col-start-7 lg:pt-2">
                    <Label className={LABEL_GROSS}>Fünf Versprechen</Label>
                    {/* v3: jeder Punkt eine geschlossene Karte, Titel und Satz links, der Status-Kreis rechts; ohne Nummern. Owner
                        27.10.2026: „diese Formatierung von dem Haken, dann rechts daneben diese Zahl, dann rechts daneben aber so nach
                        rechts offen die Überschrift, das gefällt mir irgendwie alles nicht.“ */}
                    <ol data-punkte className="mt-4 flex flex-1 flex-col justify-between gap-2.5">
                        {PUNKTE.map((p) => (
                            <li
                                key={p.titel}
                                data-punkt
                                className="flex items-center gap-5 rounded-2xl border border-line bg-bg px-5 py-4 shadow-sm lg:px-6"
                            >
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-[clamp(1.0625rem,0.95rem+0.4vw,1.3125rem)] font-bold leading-[1.2] tracking-[-0.02em]">
                                        {p.titel}
                                    </h3>
                                    <p className="mt-1 text-[0.9375rem] leading-[1.5] text-ink-2">{p.text}</p>
                                </div>
                                <Haken />
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
