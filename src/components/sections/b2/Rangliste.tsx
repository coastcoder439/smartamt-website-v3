'use client';

import { useRef } from 'react';
import { Label } from '@/components/ui/Label';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';
import { LABEL_GROSS } from '../c2/abschnitt';

/**
 * Rangliste (Abschnitt „Lage“): drei horizontale Balken in einer weißen Karte. Dänemark Platz 1, Estland
 * Platz 2, Deutschland Platz 12 (orange). Die Balkenlänge ist der E-Government-Entwicklungsindex (EGDI)
 * des UN-Berichts 2024 auf der Skala 0 bis 1, die Werte stehen am Balken (belegt in
 * docs/research/facts-context.md, Abschnitt 2: Dänemark 0,9847, Estland 0,9727, Deutschland 0,9382).
 * Beim Balken von Deutschland markiert ein kleiner Strich den Wert von 2022 (0,8770, Platz 22).
 * Die Plätze 3 bis 11 stehen nicht in der Grafik; eine gestrichelte Linie deutet die Lücke an.
 *
 * Bewegung (einmalig, kein Scrub): Beim Hineinscrollen wachsen die Balken nacheinander von links herein
 * (scaleX, expo.out) und die Werte zählen von 0 auf ihren Wert; danach blendet der 2022-Strich ein. Das
 * Server-HTML zeigt den Endzustand; bei reduzierter Bewegung und ohne JavaScript bleibt er stehen.
 *
 * Barrierefrei: echte <ol> mit Beschriftung; jede Platzziffer trägt für Screenreader das Wort „Platz“,
 * die Balken sind reine Zierde (aria-hidden), ihre Aussage steht im Wert.
 */

const ZEILEN = [
    { platz: 1, name: 'Dänemark', wert: 0.9847 },
    { platz: 2, name: 'Estland', wert: 0.9727 },
    { platz: 12, name: 'Deutschland', wert: 0.9382, hervor: true },
] as const;

/** EGDI von Deutschland 2022 (Platz 22), als Marke am Balken. */
const WERT_2022 = 0.877;

const zahl = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

export default function Rangliste() {
    const wurzel = useRef<HTMLDivElement>(null);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el) return;
        registerGsap();

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const zeilen = Array.from(el.querySelectorAll<HTMLElement>('[data-zeile]'));
            const marke = el.querySelector<HTMLElement>('[data-marke]');
            const luecke = el.querySelector<HTMLElement>('[data-luecke]');

            const zeit = gsap.timeline({
                defaults: { ease: 'expo.out' },
                scrollTrigger: { trigger: el, start: 'top 78%', once: true },
            });

            zeilen.forEach((zeile, i) => {
                const balken = zeile.querySelector<HTMLElement>('[data-balken]');
                const wert = zeile.querySelector<HTMLElement>('[data-wert]');
                const ziel = Number(zeile.dataset.ziel);
                const t = 0.1 + i * 0.22;
                if (balken) zeit.fromTo(balken, { scaleX: 0 }, { scaleX: 1, duration: 1.5 }, t);
                if (wert && Number.isFinite(ziel)) {
                    const stand = { w: 0 };
                    wert.textContent = zahl(0);
                    zeit.to(
                        stand,
                        {
                            w: ziel,
                            duration: 1.5,
                            onUpdate: () => {
                                wert.textContent = zahl(stand.w);
                            },
                            onComplete: () => {
                                wert.textContent = zahl(ziel);
                            },
                        },
                        t,
                    );
                }
            });
            if (luecke) zeit.fromTo(luecke, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.4);
            if (marke) zeit.fromTo(marke, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power3.out' }, 1.6);

            return () => {
                for (const zeile of zeilen) {
                    const wert = zeile.querySelector<HTMLElement>('[data-wert]');
                    const ziel = Number(zeile.dataset.ziel);
                    if (wert && Number.isFinite(ziel)) wert.textContent = zahl(ziel);
                }
            };
        });

        return () => mm.revert();
    }, []);

    return (
        <div ref={wurzel} className="karte rounded-[20px] p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <Label className={LABEL_GROSS}>Rangliste 2024</Label>
                <p className="font-mono text-[0.8125rem] text-ink-2">EGDI, Skala 0 bis 1</p>
            </div>

            <ol
                role="list"
                aria-label="E-Government-Ranking der Vereinten Nationen 2024: Platz 1 Dänemark, Platz 2 Estland, Platz 12 Deutschland"
                className="mt-6 space-y-1"
            >
                {ZEILEN.map((z, i) => (
                    <li key={z.platz}>
                        {i === 2 ? (
                            <div
                                aria-hidden="true"
                                data-luecke
                                className="ml-[22px] h-9 w-0 border-l-2 border-dotted border-line-2"
                            />
                        ) : null}
                        <div
                            data-zeile
                            data-ziel={z.wert}
                            className={cn(
                                'grid grid-cols-[3.25rem_minmax(0,1fr)] items-center gap-x-3 rounded-2xl px-3 py-3.5',
                                'hervor' in z && z.hervor && 'bg-brand-50',
                            )}
                        >
                            <span
                                className={cn(
                                    'font-mono text-[1.625rem] font-medium leading-none tracking-[-0.04em]',
                                    'hervor' in z && z.hervor ? 'text-brand-ink' : 'text-ink-3',
                                )}
                            >
                                <span className="sr-only">Platz </span>
                                {z.platz}
                            </span>
                            <div className="min-w-0">
                                <div className="flex items-baseline justify-between gap-4">
                                    <span className="text-[1.125rem] font-semibold tracking-[-0.015em] text-ink">
                                        {z.name}
                                    </span>
                                    <span
                                        data-wert
                                        className="font-mono text-[13px] tabular-nums text-ink-2"
                                    >
                                        {zahl(z.wert)}
                                    </span>
                                </div>
                                <div
                                    aria-hidden="true"
                                    className="relative mt-2.5 h-3 overflow-hidden rounded-full bg-bg-3"
                                >
                                    <span
                                        data-balken
                                        className={cn(
                                            'absolute inset-y-0 left-0 origin-left rounded-full',
                                            'hervor' in z && z.hervor
                                                ? 'bg-brand'
                                                : 'bg-[color-mix(in_srgb,var(--ink-3)_55%,white)]',
                                        )}
                                        style={{ width: `${z.wert * 100}%` }}
                                    />
                                </div>
                                {'hervor' in z && z.hervor ? (
                                    <div data-marke className="relative mt-1.5 h-8">
                                        <span
                                            aria-hidden="true"
                                            className="absolute -top-[22px] h-[18px] w-[2px] rounded-full bg-ink"
                                            style={{ left: `${WERT_2022 * 100}%`, marginLeft: '-1px' }}
                                        />
                                        <p
                                            className="absolute top-1 whitespace-nowrap font-mono text-[0.8125rem] leading-none text-ink-2"
                                            style={{ right: `calc(${(1 - WERT_2022) * 100}% - 1px)` }}
                                        >
                                            2022: Platz 22
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
