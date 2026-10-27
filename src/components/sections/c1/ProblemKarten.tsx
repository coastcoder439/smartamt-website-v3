'use client';

import { useRef } from 'react';
import { Info } from 'lucide-react';
import { RevealText } from '@/components/ui/Reveal';
import { MiniBarriere, MiniRecht, MiniTechnik } from '@/components/sections/c1/MiniAnsichten';
import { PROBLEM_EINLEITUNG, PROBLEM_THEMEN, type ProblemThema } from '@/components/sections/c1/problem-daten';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Die drei großen Karten des Problem-Abschnitts (ausgeblendet, nicht gelöscht): Einleitung, drei weiße Karten mit je
 * einer Mini-Produktansicht (c1/MiniAnsichten.tsx: veraltete Technik, Barrierefreiheit, Rechtsrisiken), der Hinweis
 * „Beispielansichten“ und die Leitlinie, die zum Band „Sicher. Funktional. Rechtskonform.“ führt.
 *
 * Owner 26.10.2026: „das ist viel zu komplex dargestellt, viel zu komplex, viel zu viel Text, viel zu viele Sachen“.
 * Darum zeigt Problem.tsx in Version 2 nur Überschrift, drei einzeilige Aussagen und das Band. Der Schalter
 * `EINZELNES.problemKarten` (lib/abschnitte.ts) bringt diesen Block an seine alte Stelle unter der Überschrift zurück;
 * Code, Texte (c1/problem-daten.ts) und Mini-Ansichten bleiben unverändert.
 *
 * Aufbau der Karten: Die Karte ist eine Spalte; Kopf und Ansicht nehmen die Resthöhe, der Text steht am Kartenfuß. So
 * haben alle drei Karten gleiche Höhe und keine Leerfläche unter dem Text. Oben in jeder Karte steht ein Status-Chip. Er
 * beginnt bei „Befund“ (Bernstein) und springt beim Hineinscrollen nacheinander (0,25 s Versatz) auf „Behoben“ (Grün); die
 * Werte in der Ansicht wechseln mit, eine dünne Prüflinie in der Markenfarbe läuft dabei über die Ansicht.
 *
 * Bewegung (GSAP, nur transform und opacity, Aufräumen mit matchMedia().revert()): Karten schweben am Desktop gestaffelt
 * herein (y 60 → 0), am Handy einzeln beim Hineinscrollen; der Zustand wechselt über `data-state` an der Karte, die
 * Farben und Ringe folgen per CSS. Eine Leitlinie (scrub) führt von den Karten zum Band und dockt dort mit ihrem Punkt an
 * der Kartenkante an. Das Server-HTML ist der Endzustand (alles „Behoben“): ohne JavaScript und bei reduzierter Bewegung
 * steht sofort das Ergebnis da. Die Startzustände setzt erst der Effekt.
 */

const MINI: Record<ProblemThema['id'], () => React.JSX.Element> = {
    technik: MiniTechnik,
    barriere: MiniBarriere,
    recht: MiniRecht,
};

export default function ProblemKarten() {
    const wurzel = useRef<HTMLDivElement>(null);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el) return;
        registerGsap();

        const karten = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-karte]'));
        const raster = el.querySelector<HTMLElement>('[data-karten]');
        const linie = el.querySelector<HTMLElement>('[data-verbinder]');
        const fuell = el.querySelector<HTMLElement>('[data-verbinder-fuell]');
        const punkt = el.querySelector<HTMLElement>('[data-verbinder-punkt]');

        const mm = gsap.matchMedia();
        mm.add(
            {
                gross: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
                klein: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
            },
            (kontext) => {
                const { gross } = kontext.conditions as { gross?: boolean };
                const ausloeser: ScrollTrigger[] = [];

                // Startzustand: alle Karten im Befund, versteckt (erst jetzt, nie im Server-HTML)
                for (const k of karten) k.dataset.state = 'offen';
                gsap.set(karten, { y: gross ? 60 : 28, opacity: 0 });

                // Eine Karte von „Befund“ auf „Behoben“ schalten: Prüflinie läuft über die Ansicht, in ihrer
                // Mitte springt der Zustand, Chip und Werte setzen sich leicht ab.
                const umschalten = (karte: HTMLElement) => {
                    const t = gsap.timeline();
                    const korpus = karte.querySelector<HTMLElement>('[data-korpus]');
                    const strich = karte.querySelector<HTMLElement>('[data-linie]');
                    const chip = karte.querySelector<HTMLElement>('[data-chip]');
                    const werte = gsap.utils.toArray<HTMLElement>(karte.querySelectorAll('[data-wert]'));

                    if (korpus && strich) {
                        t.fromTo(
                            strich,
                            { y: 0, opacity: 1 },
                            { y: () => Math.max(0, korpus.offsetHeight - 2), duration: 0.8, ease: 'power2.inOut' },
                            0,
                        );
                        t.to(strich, { opacity: 0, duration: 0.25, ease: 'power1.out' }, 0.8);
                    }
                    t.call(
                        () => {
                            karte.dataset.state = 'ok';
                        },
                        [],
                        0.32,
                    );
                    if (chip) {
                        t.fromTo(chip, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, 0.32);
                    }
                    if (werte.length) {
                        t.fromTo(werte, { y: 8 }, { y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.05, immediateRender: false }, 0.32);
                    }
                    return t;
                };

                // Karten hereinschweben lassen, danach nacheinander (0,25 s Versatz) umschalten
                const spielen = (liste: HTMLElement[], versatzEin: number, versatzUm: number) => {
                    const tl = gsap.timeline({ paused: true });
                    liste.forEach((k, i) => {
                        tl.to(
                            k,
                            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity' },
                            i * versatzEin,
                        );
                        tl.add(umschalten(k), 1.1 + i * versatzUm);
                    });
                    return tl;
                };

                if (gross && raster) {
                    const tl = spielen(karten, 0.15, 0.25);
                    ausloeser.push(ScrollTrigger.create({ trigger: raster, start: 'top 78%', once: true, onEnter: () => tl.play() }));
                } else {
                    for (const k of karten) {
                        const tl = spielen([k], 0, 0);
                        ausloeser.push(ScrollTrigger.create({ trigger: k, start: 'top 84%', once: true, onEnter: () => tl.play() }));
                    }
                }

                // Leitlinie von den Karten zum Band: zeichnet sich mit dem Scroll, der Kopfpunkt läuft mit
                if (linie && fuell && punkt) {
                    const spur = { start: 'top 90%', end: 'bottom 55%', scrub: 0.4 };
                    gsap.fromTo(
                        fuell,
                        { scaleY: 0 },
                        { scaleY: 1, ease: 'none', immediateRender: true, scrollTrigger: { trigger: linie, ...spur } },
                    );
                    gsap.fromTo(
                        punkt,
                        { y: () => -linie.offsetHeight },
                        {
                            y: 0,
                            ease: 'none',
                            immediateRender: true,
                            scrollTrigger: { trigger: linie, ...spur, invalidateOnRefresh: true },
                        },
                    );
                }

                return () => {
                    for (const a of ausloeser) a.kill();
                    for (const k of karten) k.dataset.state = 'ok';
                };
            },
        );

        return () => mm.revert();
    }, []);

    return (
        <div ref={wurzel}>
            {/* Einleitung beginnt auf der Grundlinie der ersten Überschriftszeile */}
            <RevealText className="mt-6 max-w-[40ch] text-lead text-ink-2">{PROBLEM_EINLEITUNG}</RevealText>

            {/*
              Am Desktop teilen sich die drei Karten drei Zeilen (Subgrid): Ansicht, Titel und Text stehen
              in allen Karten auf einer Linie, die Ansichten sind gleich hoch. Die erste Spalte ist breiter,
              weil ihr Text am längsten ist: So brechen alle drei Texte etwa gleich oft um und unter dem Text
              bleibt höchstens eine halbe Zeile frei.
            */}
            <ul
                data-karten
                className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-6 lg:gap-y-0"
            >
                {PROBLEM_THEMEN.map((thema) => {
                    const Mini = MINI[thema.id];
                    return (
                        <li
                            key={thema.id}
                            data-karte
                            data-state="ok"
                            className="group/karte karte flex flex-col rounded-[20px] border-line-2 p-5 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6 md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:items-stretch md:max-lg:gap-x-10 lg:row-span-3 lg:grid lg:grid-rows-subgrid"
                        >
                            {/* Kopf und Ansicht: Die Ansicht nimmt die Resthöhe der Zeile, damit unten keine Leerfläche bleibt */}
                            <div className="flex flex-1 flex-col">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-ink-2">{thema.bereich}</p>
                                    {/* Status-Chip: Befund (Bernstein) → Behoben (Grün), Zustand steht auch als Text da */}
                                    <span data-chip className="inline-flex">
                                        <span className="chip chip-warn group-data-[state=ok]/karte:hidden">
                                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-warn-dot" />
                                            Befund
                                        </span>
                                        <span className="chip chip-ok group-data-[state=offen]/karte:hidden">
                                            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                                                <path
                                                    d="M3.5 8.5l3 3 6-7"
                                                    stroke="currentColor"
                                                    strokeWidth="2.2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            Behoben
                                        </span>
                                    </span>
                                </div>
                                <Mini />
                            </div>

                            {/* Titel und Text: am Desktop lösen sich die Elemente aus dem Block und liegen in Zeile 2 und 3 */}
                            <div className="mt-7 md:max-lg:mt-0 md:max-lg:flex md:max-lg:flex-col md:max-lg:justify-center lg:contents">
                                <h3 className="lg:mt-7">{thema.titel}</h3>
                                <p className="mt-3 text-pretty text-[1rem] leading-[1.6] text-ink-2">{thema.text.join(' ')}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <p className="mt-5 flex items-center gap-2 font-mono text-[13px] leading-snug text-ink-2">
                <Info aria-hidden="true" size={15} strokeWidth={2} className="flex-none text-ink-3" />
                Beispielansichten · Beispielgemeinde Musterbach (erfunden)
            </p>

            {/* Leitlinie: führt von den Karten zum Ergebnis und dockt mit dem Punkt an der Oberkante des Bandes an */}
            <div aria-hidden="true" data-verbinder className="relative z-10 mx-auto -mb-px mt-9 h-16 w-[2px] md:mt-12 md:h-24">
                <span className="absolute inset-0 rounded-full bg-line-2" />
                <span data-verbinder-fuell className="absolute inset-0 origin-top rounded-full bg-brand" />
                <span
                    data-verbinder-punkt
                    className="absolute left-1/2 top-full -ml-[4px] -mt-[4px] h-[8px] w-[8px] rounded-full bg-brand"
                    style={{ boxShadow: '0 0 0 4px var(--brand-100)' }}
                />
            </div>
        </div>
    );
}
