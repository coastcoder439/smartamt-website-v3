'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';

/**
 * Prüfliste (Abschnitt „Websites“): vier Zeilen in einer weißen Karte, wie eine ausgefüllte Prüfliste (Sicher, Barrierefrei,
 * Rechtskonform, Funktional; nie „sicher“ und „rechtssicher“ in einer Aufzählung, Owner 26.10.2026). Die Texte sind kurze
 * Aussagen im Verkäufer-Ton, je höchstens zehn Wörter (Nachtrag 1, N8; vorher ganze Absätze mit Rechtsverweis).
 * Links ein grüner Haken im weichen Kreis (erfüllt), dann der Begriff, rechts der Text. Keine Nummern
 * (es ist keine Abfolge), keine Kachelraster.
 *
 * Bewegung: Beim Hineinscrollen setzen sich die Haken nacheinander (Strich zeichnet sich, 0,5 s,
 * Versatz 0,22 s) und die Kreise füllen sich dabei grün. Der Startzustand entsteht erst im Effekt; das
 * Server-HTML zeigt alle Haken fertig, ebenso bei reduzierter Bewegung und ohne JavaScript.
 */

const PUNKTE = [
    {
        begriff: 'Sicher',
        text: 'Aktuelle Software, Updates und verschlüsselte Verbindungen.',
    },
    {
        begriff: 'Barrierefrei',
        text: 'Mit Tastatur und Screenreader bedienbar, mit eigener Erklärung.',
    },
    {
        begriff: 'Rechtskonform',
        text: 'Keine Cookies ohne Einwilligung, vollständige Pflichtangaben.',
    },
    {
        begriff: 'Funktional',
        text: 'Klare Wege zu Anträgen, Öffnungszeiten und Ansprechpersonen.',
    },
] as const;

export default function Pruefliste() {
    const listeRef = useRef<HTMLUListElement>(null);

    useIsoLayoutEffect(() => {
        const liste = listeRef.current;
        if (!liste) return;
        registerGsap();

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const haken = liste.querySelectorAll<SVGPathElement>('[data-haken]');
            const kreise = liste.querySelectorAll<SVGElement>('[data-kreis]');
            const zeit = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: { trigger: liste, start: 'top 78%', once: true },
            });
            zeit.fromTo(haken, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.22 }, 0.1);
            zeit.fromTo(kreise, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.22 }, 0);
        });

        return () => mm.revert();
    }, []);

    return (
        <ul ref={listeRef} role="list" className="karte overflow-hidden rounded-[20px] px-6 md:px-9">
            {PUNKTE.map((punkt) => (
                <li
                    key={punkt.begriff}
                    className="grid grid-cols-[32px_minmax(0,1fr)] items-start gap-x-5 gap-y-2 border-t border-line py-7 first:border-t-0 md:grid-cols-[32px_10.5rem_minmax(0,1fr)] md:gap-x-6"
                >
                    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className="size-8">
                        <circle
                            data-kreis
                            cx="16"
                            cy="16"
                            r="15"
                            strokeWidth="1"
                            className="origin-center fill-ok-50 stroke-[color-mix(in_srgb,var(--ok)_28%,white)] [transform-box:fill-box]"
                        />
                        <path
                            data-haken
                            d="M9.5 16.5l4.5 4.5L22.5 11"
                            pathLength={1}
                            strokeDasharray="1 1"
                            strokeDashoffset={0}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="fill-none stroke-ok"
                        />
                    </svg>
                    <h3 className="md:pt-[3px]">{punkt.begriff}</h3>
                    <p className="col-start-2 text-ink-2 md:col-start-3 md:pt-[3px]">{punkt.text}</p>
                </li>
            ))}
        </ul>
    );
}
