'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';
import { Parallax } from './Parallax';

/**
 * Mini-Browser in der großen Leistungskarte „Websites für Gemeinden“: ein Fenster der erfundenen
 * Beispielgemeinde Musterbach mit drei erfüllten Prüfpunkten (Sicher, Barrierefrei, Rechtskonform).
 *
 * Tiefe (CI v3, Produktansicht): Hinter dem Fenster steht eine zweite weiße Karte, parallel 14 px nach rechts und
 * 12 px nach oben versetzt (gleiche Rundung, schwächerer Schatten; nie gedreht, nie eine Farbfläche). Beide
 * schweben beim Scrollen mit unterschiedlichem Weg (Fenster ±14 px, hintere Karte ±6 px): ruhige Parallaxe
 * zwischen zwei Ebenen.
 *
 * Keine erfundenen Messwerte, nur Zustände. Die Kennzeichnung als Beispiel steht sichtbar im Kartenlabel
 * („Beispiel“) und in der Fußzeile des Fensters („Beispielgemeinde Musterbach (erfunden)“).
 *
 * Bewegung: Beim Hineinscrollen setzen sich die drei Haken nacheinander (Strich zeichnet sich, Kreis
 * blendet ein). Außerdem schweben Fenster und hintere Karte beim Scrollen leicht gegen ihre Fläche
 * (Parallaxe, c2/Parallax.tsx, Art „schweben“; die Fläche hat dafür oben und unten genug Rand). Das
 * Server-HTML zeigt alles fertig; bei reduzierter Bewegung und ohne JavaScript bleibt es so.
 */
const PUNKTE = ['Sicher', 'Barrierefrei', 'Rechtskonform'] as const;

export function MiniBrowser() {
    const ref = useRef<HTMLDivElement>(null);

    useIsoLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        registerGsap();

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const haken = el.querySelectorAll<SVGPathElement>('[data-haken]');
            const kreise = el.querySelectorAll<SVGElement>('[data-kreis]');
            const zeilen = el.querySelectorAll<HTMLElement>('[data-zeile]');
            const zeit = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: { trigger: el, start: 'top 80%', once: true },
            });
            zeit.fromTo(zeilen, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.25 }, 0.5);
            zeit.fromTo(kreise, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.25 }, 0.6);
            zeit.fromTo(haken, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.25 }, 0.75);
        });

        return () => mm.revert();
    }, []);

    return (
        <div
            ref={ref}
            role="img"
            aria-label="Beispiel: Website der erfundenen Gemeinde Musterbach, die drei Prüfpunkte sicher, barrierefrei und rechtskonform sind erfüllt"
            className="relative mt-8 overflow-hidden rounded-[16px] border border-line bg-bg-2 px-4 pb-9 pt-12 sm:px-8 md:mt-0 lg:mt-auto"
        >
            {/* Punktraster und warmes Licht hinter dem Fenster */}
            <div
                aria-hidden="true"
                className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(80%_80%_at_50%_40%,black,transparent)]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-70 blur-3xl"
                style={{ background: 'radial-gradient(closest-side, var(--brand-100), transparent)' }}
            />

            <p className="absolute left-4 top-3 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-brand-ink sm:left-8">
                Beispiel
            </p>

            <div className="relative mx-auto w-full max-w-[446px]">
                {/* zweite Karte dahinter: 14 px rechts, 12 px höher, gleiche Rundung, schwächerer Schatten */}
                <Parallax art="schweben" weg={6} fuellen className="pointer-events-none absolute inset-0">
                    <div
                        aria-hidden="true"
                        className="h-full w-full translate-x-[14px] -translate-y-[12px] rounded-[14px] border border-line bg-white shadow-sm"
                    />
                </Parallax>

                <Parallax art="schweben" weg={14} className="relative">
                    <div className="relative w-full overflow-hidden rounded-[14px] border border-line bg-white shadow-md">
                        {/* Fensterleiste */}
                        <div className="flex items-center gap-3 border-b border-line bg-bg-2 px-3.5 py-2">
                            <span className="flex gap-1.5" aria-hidden="true">
                                <span className="h-2 w-2 rounded-full bg-line-2" />
                                <span className="h-2 w-2 rounded-full bg-line-2" />
                                <span className="h-2 w-2 rounded-full bg-line-2" />
                            </span>
                            <span className="mx-auto rounded-full border border-line bg-white px-3.5 py-0.5 font-mono text-[0.75rem] text-ink-3">
                                www.musterbach.de
                            </span>
                            <span className="w-[38px]" aria-hidden="true" />
                        </div>

                        <div className="px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                                    Gemeinde Musterbach
                                </p>
                                <span className="chip chip-ok">Alles erfüllt</span>
                            </div>
                            <ul className="mt-3 space-y-2">
                                {PUNKTE.map((p) => (
                                    <li
                                        key={p}
                                        data-zeile
                                        className="flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--ok)_22%,white)] bg-ok-50 px-3 py-2"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                            focusable="false"
                                            className="size-6 flex-none"
                                        >
                                            <circle data-kreis cx="12" cy="12" r="12" className="fill-ok" />
                                            <path
                                                data-haken
                                                d="M7 12.5l3.2 3.2L17 8.6"
                                                pathLength={1}
                                                strokeDasharray="1 1"
                                                strokeDashoffset={0}
                                                strokeWidth="2.2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="fill-none stroke-white"
                                            />
                                        </svg>
                                        <span className="min-w-0 flex-1 text-[14px] font-medium text-ink">{p}</span>
                                        <span className="font-mono text-[0.8125rem] text-ink-3">erfüllt</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <p className="border-t border-line bg-bg-2 px-4 py-2 font-mono text-[0.78rem] leading-snug text-ink-3">
                            Beispielgemeinde Musterbach (erfunden)
                        </p>
                    </div>
                </Parallax>
            </div>
        </div>
    );
}

export default MiniBrowser;
