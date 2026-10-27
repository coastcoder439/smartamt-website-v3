'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AnkerLink } from '@/components/layout/AnkerLink';
import { LEISTUNGEN } from '@/components/layout/leistungen';
import { Label } from '@/components/ui/Label';
import { Logo } from '@/components/ui/Logo';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { EINZELNES } from '@/lib/abschnitte';
import { bewegungReduziert, gsap, registerGsap } from '@/lib/gsap';
import { ABSENDER, KONTAKT, LEON, RECHTSSEITEN, TOBIAS, UNTERSEITEN } from '@/lib/site';

/**
 * Fuß (CI v3): weißer Grund mit feiner Oberlinie (hebt sich vom grauen Kontaktabschnitt darüber ab).
 * Links Logo, Leitsatz und Absenderzeile, daneben die Spalten „Auf einen Blick“ (nur Sprungziele sichtbarer Abschnitte,
 * layout/leistungen.ts), Rechtliches und Kontakt (Leon zuerst, dann Tobias, dann Anschrift). Darunter die
 * große Zierwortmarke, dann die Statuszeile „Keine Cookies · kein Tracking“ und ganz unten die Preisangabe.
 *
 * Die Wortmarke ist reine Zierde (aria-hidden) und füllt die Inhaltsbreite bündig (`.fuss-marke` in
 * globals.css koppelt die Schriftgröße über eine Container-Einheit an die Breite der Hülle): „Smart“ in der
 * Linienfarbe (line-2), „Amt“ in Orange bei 25 % Deckkraft. Eine Kontur per text-stroke scheidet aus: Inter hat
 * überlappende Konturen, die Querbalken von „A“ und „t“ würden durchscheinen.
 *
 * Bewegung (Seitenende mit Pointe): Beim Einscrollen zeichnet sich auf der Oberlinie die orange Linie mit
 * Kopfpunkt über die Inhaltsbreite (Scroll-Effekt mit Linie, wie am Fuß des Hero, nur Spur an den Scroll
 * gekoppelt), die Spalten steigen gestaffelt auf, und die Wortmarke fährt aus ihrer Maske. Nur transform und
 * opacity. Ohne JavaScript und bei reduzierter Bewegung steht sofort der Endzustand da (Server-HTML = Endzustand:
 * Linie voll, Punkt am rechten Ende). Aufräumen mit gsap.context().revert().
 */
export default function Footer() {
    const wurzel = useRef<HTMLElement>(null);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el || bewegungReduziert()) return;
        registerGsap();

        const ctx = gsap.context(() => {
            // Linie mit Kopfpunkt: zeichnet sich, sobald der Fuß ins Bild fährt (an den Scroll gekoppelt).
            const linie = el.querySelector<HTMLElement>('[data-fuss-linie]');
            const fuell = el.querySelector<HTMLElement>('[data-fuss-linie-fuell]');
            const punkt = el.querySelector<HTMLElement>('[data-fuss-linie-punkt]');
            if (linie && fuell && punkt) {
                const spur = { trigger: el, start: 'top 96%', end: 'top 40%', scrub: 0.4 };
                gsap.fromTo(
                    fuell,
                    { scaleX: 0 },
                    { scaleX: 1, ease: 'none', immediateRender: true, scrollTrigger: spur },
                );
                gsap.fromTo(
                    punkt,
                    { x: () => -linie.offsetWidth },
                    {
                        x: 0,
                        ease: 'none',
                        immediateRender: true,
                        scrollTrigger: { ...spur, invalidateOnRefresh: true },
                    },
                );
            }

            // Spalten: steigen gestaffelt auf, sobald sie ins Bild kommen.
            const spalten = el.querySelectorAll('[data-fuss-spalte]');
            if (spalten.length) {
                gsap.from(spalten, {
                    opacity: 0,
                    y: 22,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.09,
                    scrollTrigger: { trigger: spalten[0], start: 'top 94%', once: true },
                });
            }

            // Wortmarke: fährt aus ihrer Maske, wenn sie ins Bild kommt. Der Auslöser ist die Hülle der Marke, nicht die
            // Marke selbst: Die Marke steht im Startzustand um 118 % nach unten versetzt, ihr Rand läge dann hinter dem
            // Seitenende, und beim Sprung ans Ende (Ende-Taste, Anker) hätte der Auslöser nie gefeuert (leere Fläche).
            // Die Hülle bewegt sich nicht und liegt am Seitenende im Bild.
            const marke = el.querySelector<HTMLElement>('[data-fuss-marke]');
            const huelle = el.querySelector<HTMLElement>('.fuss-marke-huelle');
            if (marke) {
                gsap.from(marke, {
                    yPercent: 118,
                    duration: 1.3,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: huelle ?? marke, start: 'top 100%', once: true },
                });
            }
        }, el);

        return () => ctx.revert();
    }, []);

    return (
        <footer ref={wurzel} className="relative overflow-x-clip border-t border-line bg-bg pb-10 pt-14 md:pb-12 md:pt-16">
            {/* Linie auf der Oberlinie: feine Spur ist die Rahmenlinie des Fußes, darauf zeichnet sich die orange Linie */}
            <div aria-hidden="true" className="wrap pointer-events-none absolute inset-x-0 top-0">
                <div data-fuss-linie className="relative h-0">
                    <span data-fuss-linie-fuell className="absolute -top-px left-0 h-[2px] w-full origin-left rounded-full bg-brand" />
                    <span
                        data-fuss-linie-punkt
                        className="absolute -top-[3px] right-0 -mr-[3.5px] h-[7px] w-[7px] rounded-full bg-brand"
                        style={{ boxShadow: '0 0 0 4px var(--brand-100)' }}
                    />
                </div>
            </div>

            <div className="wrap relative">
                <div className="grid-12 gap-y-10">
                    <div data-fuss-spalte className="col-span-12 lg:col-span-4">
                        <Logo groesse="md" className="fuss-logo" />
                        <p className="mt-5 max-w-[22em] text-[1.0625rem] leading-relaxed text-ink-2">
                            Ihr digitales Ortseingangsschild.
                        </p>
                        <p className="mt-5 text-klein">
                            <a
                                href={ABSENDER.url}
                                target="_blank"
                                rel="noopener"
                                className="link inline-flex min-h-[2.75rem] items-center gap-1.5 font-medium md:min-h-0"
                            >
                                {ABSENDER.zeile}
                                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
                                <span className="sr-only"> (öffnet in neuem Tab)</span>
                            </a>
                        </p>
                    </div>

                    <div data-fuss-spalte className="col-span-6 lg:col-span-2 lg:col-start-6">
                        <Label>Auf einen Blick</Label>
                        <ul className="mt-3 text-klein">
                            {LEISTUNGEN.map((l) => (
                                <li key={l.label}>
                                    <AnkerLink id={l.id} className="fuss-link">
                                        {l.label}
                                    </AnkerLink>
                                </li>
                            ))}
                            {/* v3: die Unterseiten (Plan 03-website-v3, Punkt 2 und 3) */}
                            {UNTERSEITEN.map((seite) => (
                                <li key={seite.href}>
                                    <Link href={seite.href} className="fuss-link">
                                        {seite.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div data-fuss-spalte className="col-span-6 lg:col-span-2">
                        <Label>Rechtliches</Label>
                        <ul className="mt-3 text-klein">
                            {RECHTSSEITEN.map((seite) => (
                                <li key={seite.href}>
                                    <Link href={seite.href} className="fuss-link">
                                        {seite.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div data-fuss-spalte className="col-span-12 sm:col-span-6 lg:col-span-3">
                        <Label>Kontakt</Label>
                        <address className="mt-3 text-klein not-italic">
                            <p className="font-semibold text-ink">{LEON.name}</p>
                            <a href={LEON.telefonHref} className="fuss-link">
                                {LEON.telefon}
                            </a>
                            <br />
                            <a href={`mailto:${LEON.email}`} className="fuss-link">
                                {LEON.email}
                            </a>
                            <p className="mt-3 font-semibold text-ink">{TOBIAS.name}</p>
                            <a href={TOBIAS.telefonHref} className="fuss-link">
                                {TOBIAS.telefon}
                            </a>
                            <p className="mt-3 text-ink-2">
                                {KONTAKT.strasse}
                                <br />
                                {KONTAKT.plz} {KONTAKT.ort}
                            </p>
                        </address>
                    </div>
                </div>

                {/* Zierde: große Wortmarke, bündig mit der Inhaltsbreite, fährt aus ihrer Maske */}
                <div aria-hidden="true" className="fuss-marke-huelle mt-12 md:mt-14">
                    <div className="fuss-marke-maske">
                        <div data-fuss-marke className="fuss-marke" style={{ color: 'var(--line-2)' }}>
                            <span>Smart</span>
                            <span style={{ color: 'color-mix(in srgb, var(--brand) 25%, white)' }}>Amt</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[0.7812rem] text-ink-3 md:flex-row md:items-center md:justify-between">
                    <p className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ok" />
                        Keine Cookies · kein Tracking
                    </p>
                    <p>© 2026 SmartAmt{EINZELNES.fussPreiseMwSt ? ' · Alle Preise zzgl. 19 % MwSt.' : null}</p>
                </div>
            </div>
        </footer>
    );
}
