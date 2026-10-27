'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { KUNDEN_LOGOS } from '@/components/sections/c1/kunden-logos';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';
import type { Referenz } from './referenzen-daten';
import { useBewegungErlaubt } from './useBewegungErlaubt';

/**
 * Die Reihe der Zitat-Karten (Referenzen): ein ruhiges Laufband, das sich mit der Maus oder dem Finger ziehen
 * lässt. Muster: das Logo-Laufband von Leons tech-banner.tsx (zwei gleiche Reihen, die eine halbe Länge
 * weiterlaufen und dann nahtlos von vorn beginnen), hier mit GSAP-Ticker statt framer-motion und mit Ziehen.
 *
 *  - Lauf: 36 px pro Sekunde nach links. Beim Überfahren mit der Maus und beim Ziehen bremst das Band weich ab;
 *    nach dem Loslassen trägt der Schwung es ein Stück weiter, bevor es wieder in Fahrt kommt.
 *  - Start: Das Band steht, bis es zur Hälfte im Bild ist, und wartet dann 1,5 Sekunden mit der ersten Karte am
 *    Anfang (vollständig lesbar, nichts am Rand abgeschnitten); erst danach läuft es sanft an.
 *  - Nur transform (translate x), kein Layout je Bild. Außerhalb des Bildes steht das Band still (IntersectionObserver).
 *  - Der Knopf „Anhalten“ stoppt das Band dauerhaft (WCAG 2.2.2: bewegter Inhalt braucht eine Pause).
 *  - Bei reduzierter Bewegung und ohne JavaScript gibt es kein Laufband: Die Reihe ist dann eine ganz normale,
 *    seitlich scrollbare und per Tastatur erreichbare Leiste mit einrastenden Karten. Das zweite Set (nur für die
 *    Endlosschleife) wird dort nicht gerendert; im Laufband ist es für Hilfstechnik ausgeblendet (aria-hidden, inert).
 *  - Aufräumen mit gsap.context().revert().
 */

const TEMPO = 36; // Pixel pro Sekunde
const START_PAUSE = 1500; // ms, nachdem das Band zur Hälfte im Bild ist
const SCHWUNG_MAX = 1600;

function LogoOderKreis({ e }: { e: Referenz }) {
    const logo = e.logo ? KUNDEN_LOGOS.find((l) => l.datei === e.logo) : undefined;
    if (logo) {
        const hoehe = Math.min(56, Math.round(logo.anzeige * 0.9));
        return (
            <Image
                src={`/images/kunden/${logo.datei}`}
                width={logo.breite}
                height={logo.hoehe}
                alt={`Logo ${e.firma}`}
                style={{ height: hoehe, width: 'auto', filter: 'brightness(0)', opacity: logo.deckkraft ?? 0.8 }}
                className="max-w-[11.875rem] flex-none object-contain object-left"
            />
        );
    }
    return (
        <span
            aria-hidden="true"
            className="grid h-11 w-11 flex-none place-items-center rounded-full bg-brand-50 font-mono text-[0.8125rem] font-medium text-brand-ink ring-1 ring-brand-100"
        >
            {e.kuerzel}
        </span>
    );
}

/**
 * Eine Karte spannt drei Zeilen des gemeinsamen Rasters (Kopf, Zitat, Autor; grid-rows-subgrid). Dadurch haben alle
 * Karten einer Reihe gleich hohe Zeilen: Die Trennlinie über dem Autorenblock und die Logo-Reihe liegen in jeder
 * Karte auf einer Höhe, egal wie viele Zeilen Rolle, Firma und Projekt brauchen.
 */
export function Karte({ e, klasse = 'row-span-3 grid snap-start grid-rows-[subgrid]' }: { e: Referenz; klasse?: string }) {
    return (
        <figure className={`karte ${klasse} p-6 sm:p-7`}>
            <div className="flex min-h-[3.5rem] items-center justify-between gap-3">
                <LogoOderKreis e={e} />
                {e.oeffentlich ? (
                    <span className="inline-flex flex-none items-center gap-2 rounded-full bg-bg-2 px-3 py-1 text-[0.75rem] font-semibold text-ink-2">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand" />
                        Öffentliche Hand
                    </span>
                ) : null}
            </div>
            <blockquote className="mt-5 text-[1.0625rem] leading-relaxed text-ink">
                <span aria-hidden="true" className="mr-0.5 text-brand-600">
                    „
                </span>
                {e.zitat}
                <span aria-hidden="true" className="text-brand-600">
                    “
                </span>
            </blockquote>
            <figcaption className="mt-6 border-t border-line pt-5">
                <span className="block text-klein font-semibold leading-snug text-ink">{e.name}</span>
                <span className="mt-0.5 block text-klein leading-snug text-ink-2">
                    {e.rolle}, {e.firma}
                </span>
                <p className="mt-3 font-mono text-[0.75rem] leading-snug text-ink-3">
                    {e.projekt}
                    {e.ort ? ` · ${e.ort}` : ''}
                </p>
            </figcaption>
        </figure>
    );
}

export default function ReferenzBand({ eintraege }: { eintraege: readonly Referenz[] }) {
    const erlaubt = useBewegungErlaubt();
    const [angehalten, setAngehalten] = useState(false);
    const kasten = useRef<HTMLDivElement>(null);
    const spur = useRef<HTMLDivElement>(null);
    const angehaltenRef = useRef(false);

    useEffect(() => {
        angehaltenRef.current = angehalten;
    }, [angehalten]);

    useIsoLayoutEffect(() => {
        const huelle = kasten.current;
        const band = spur.current;
        if (!erlaubt || !huelle || !band) return;
        registerGsap();

        const ctx = gsap.context(() => {
            let x = 0;
            let v = 0; // Geschwindigkeit in px/s
            let halb = 0;
            let zieht = false;
            let ueber = false;
            let sichtbar = true;
            let gestartet = false; // false, bis das Band zur Hälfte im Bild war und die Startpause vorbei ist
            let startTimer = 0;
            let zeigerStart = 0;
            let xStart = 0;
            let letzteZeigerX = 0;
            let letzteZeit = 0;

            const messen = () => {
                halb = band.scrollWidth / 2;
            };
            messen();
            const groesse = new ResizeObserver(messen);
            groesse.observe(band);
            const sicht = new IntersectionObserver(
                ([eintrag]) => {
                    sichtbar = eintrag.isIntersecting;
                },
                { rootMargin: '120px' },
            );
            sicht.observe(huelle);
            // Startpause: Erst wenn das Band zur Hälfte im Bild ist, beginnt eine Pause von 1,5 s; solange steht die
            // erste Karte vollständig lesbar am Anfang. Am Handy sieht man so beim Hineinscrollen nie ein halbes Wort.
            const start = new IntersectionObserver(
                ([eintrag]) => {
                    if (gestartet || startTimer || !eintrag.isIntersecting || eintrag.intersectionRatio < 0.5) return;
                    startTimer = window.setTimeout(() => {
                        gestartet = true;
                    }, START_PAUSE);
                },
                { threshold: [0, 0.5, 1] },
            );
            start.observe(huelle);

            const wickeln = (wert: number) => {
                if (halb <= 0) return wert;
                let r = wert % halb;
                if (r > 0) r -= halb;
                return r;
            };

            const tick = (_zeit: number, deltaMs: number) => {
                if (!sichtbar || halb <= 0) return;
                const s = Math.min(deltaMs, 100) / 1000;
                if (!zieht) {
                    const ziel = !gestartet || ueber || angehaltenRef.current ? 0 : -TEMPO;
                    v += (ziel - v) * (1 - Math.exp(-4.5 * s));
                    x += v * s;
                }
                x = wickeln(x);
                gsap.set(band, { x });
            };
            gsap.ticker.add(tick);

            const runter = (e: PointerEvent) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                zieht = true;
                zeigerStart = e.clientX;
                xStart = x;
                letzteZeigerX = e.clientX;
                letzteZeit = performance.now();
                v = 0;
                huelle.setPointerCapture(e.pointerId);
                huelle.dataset.zieht = 'true';
            };
            const bewegt = (e: PointerEvent) => {
                if (!zieht) return;
                x = xStart + (e.clientX - zeigerStart);
                const jetzt = performance.now();
                const dt = jetzt - letzteZeit;
                if (dt > 0) {
                    const momentan = ((e.clientX - letzteZeigerX) / dt) * 1000;
                    v += (momentan - v) * 0.4;
                }
                letzteZeigerX = e.clientX;
                letzteZeit = jetzt;
            };
            const hoch = (e: PointerEvent) => {
                if (!zieht) return;
                zieht = false;
                delete huelle.dataset.zieht;
                if (huelle.hasPointerCapture(e.pointerId)) huelle.releasePointerCapture(e.pointerId);
                if (performance.now() - letzteZeit > 90) v = 0;
                v = Math.max(-SCHWUNG_MAX, Math.min(SCHWUNG_MAX, v));
            };
            const hinein = (e: PointerEvent) => {
                if (e.pointerType === 'mouse') ueber = true;
            };
            const hinaus = (e: PointerEvent) => {
                if (e.pointerType === 'mouse') ueber = false;
            };

            huelle.addEventListener('pointerdown', runter);
            huelle.addEventListener('pointermove', bewegt);
            huelle.addEventListener('pointerup', hoch);
            huelle.addEventListener('pointercancel', hoch);
            huelle.addEventListener('pointerenter', hinein);
            huelle.addEventListener('pointerleave', hinaus);

            return () => {
                gsap.ticker.remove(tick);
                groesse.disconnect();
                sicht.disconnect();
                start.disconnect();
                window.clearTimeout(startTimer);
                huelle.removeEventListener('pointerdown', runter);
                huelle.removeEventListener('pointermove', bewegt);
                huelle.removeEventListener('pointerup', hoch);
                huelle.removeEventListener('pointercancel', hoch);
                huelle.removeEventListener('pointerenter', hinein);
                huelle.removeEventListener('pointerleave', hinaus);
                delete huelle.dataset.zieht;
                gsap.set(band, { clearProps: 'transform' });
            };
        }, huelle);

        return () => ctx.revert();
    }, [erlaubt]);

    return (
        <div className="mt-12 lg:mt-16">
            <div className="wrap flex min-h-[2.75rem] items-center justify-between gap-4">
                <p className="font-mono text-klein text-ink-3">
                    {erlaubt ? 'Ziehen, um zu blättern' : 'Seitlich scrollen, um weitere Stimmen zu lesen'}
                </p>
                {erlaubt ? (
                    <button
                        type="button"
                        onClick={() => setAngehalten((a) => !a)}
                        className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-line-2 bg-bg px-4 text-klein font-medium text-ink shadow-sm transition-colors hover:border-ink-3"
                    >
                        {angehalten ? (
                            <Play aria-hidden="true" size={16} strokeWidth={1.75} />
                        ) : (
                            <Pause aria-hidden="true" size={16} strokeWidth={1.75} />
                        )}
                        {angehalten ? 'Fortsetzen' : 'Anhalten'}
                        <span className="sr-only"> (Laufband der Kundenstimmen)</span>
                    </button>
                ) : null}
            </div>

            <div
                ref={kasten}
                {...(erlaubt
                    ? {}
                    : { role: 'region', 'aria-label': 'Kundenstimmen, seitlich scrollbar', tabIndex: 0 })}
                className={
                    erlaubt
                        ? 'cursor-grab touch-pan-y select-none overflow-hidden py-4 pl-[max(var(--gutter),calc((100%_-_var(--inhalt))_/_2))] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] data-[zieht=true]:cursor-grabbing'
                        : 'snap-x snap-mandatory overflow-x-auto py-4 pl-[max(var(--gutter),calc((100%_-_var(--inhalt))_/_2))] [scroll-padding-left:max(var(--gutter),calc((100%_-_var(--inhalt))_/_2))] [scrollbar-width:thin]'
                }
            >
                <div ref={spur} className="flex w-max items-stretch">
                    <div className="grid grid-flow-col auto-cols-[min(84vw,23.75rem)] grid-rows-[auto_1fr_auto] gap-x-5 pr-5">
                        {eintraege.map((e) => (
                            <Karte key={e.firma} e={e} />
                        ))}
                    </div>
                    {erlaubt ? (
                        <div aria-hidden="true" inert className="grid grid-flow-col auto-cols-[min(84vw,23.75rem)] grid-rows-[auto_1fr_auto] gap-x-5 pr-5">
                            {eintraege.map((e) => (
                                <Karte key={e.firma} e={e} />
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
