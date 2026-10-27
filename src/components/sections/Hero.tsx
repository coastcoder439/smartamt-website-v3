'use client';

import { useRef } from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { LEISTUNGEN } from '@/components/layout/leistungen';
import { AnkerLink } from '@/components/layout/AnkerLink';
import { ButtonLink } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Magnet } from '@/components/ui/Magnet';
import { HeroMusterbach } from '@/components/sections/hero/HeroMusterbach';
import { WebsiteCheck } from '@/components/sections/hero/WebsiteCheck';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { bewegungReduziert, feinerZeiger, gsap, registerGsap } from '@/lib/gsap';
import { EINZELNES } from '@/lib/abschnitte';
import { waehleAnliegen } from '@/lib/kontakt';
import { handleAnchorClick } from '@/lib/scroll';
import { KONTAKT } from '@/lib/site';

/**
 * Hero (id start), CI v3: Die Überschrift „Ihr digitales Ortseingangsschild.“ steht über die volle
 * Breite und vollständig, auf jeder Breite in zwei Zeilen ohne Wortbruch (Schriftgröße folgt der Inhaltsbreite).
 * Darunter links der Text mit Knopf, Vertrauenszeile und der Zeile „Auf einen Blick“ mit den Sprungzielen (ab 1024 px),
 * rechts, kopfbündig zum Text und nur 24 px unter der Überschrift, das Bild: die fertige Beispielgemeinde Musterbach als
 * ruhige Karte (hero/HeroMusterbach.tsx). Die frühere Produktansicht „Website-Check“ (hero/WebsiteCheck.tsx, mit Browser-Leiste,
 * Hinweiskästchen und Prüfliste) bleibt im Code und erscheint mit `EINZELNES.heroWebsiteCheck` wieder; ihre Prüfpunkte stehen jetzt
 * in der Befund-Liste unter dem Vorher/Nachher. Am Handy folgt die Reihenfolge Text, Knopf, Bild, Vertrauenszeile,
 * damit die Karte schon im ersten Bildschirm angeschnitten erscheint.
 *
 * Website v2 (Entscheidung 2): ohne KI und Schulungen. Label „Websites für Gemeinden, Ämter und Behörden“, Hauptknopf
 * „Kostenlose Vorschau anfragen“ (springt zu Kontakt). Der Knopf „KI-Fortbildung ansehen“ bleibt im Code und erscheint
 * wieder mit `EINZELNES.heroKnopfSchulung`; die Sprungzeile zeigt nur Abschnitte, die sichtbar sind. Die Nummer in der
 * Vertrauenszeile ist Leons.
 *
 * Bühne: drei weiche Lichter (warm hinter der Produktansicht, klein links unten, schräger Streif von oben rechts),
 * ein deutliches Punktraster und feine Rasterlinien an den Rändern der Inhaltsbreite. Die Lichter driften beim
 * Scrollen (transform) und folgen am Desktop leicht dem Zeiger; bei reduzierter Bewegung stehen sie still.
 *
 * Ladeanimation unter 1,4 s: Die Zeilen der Überschrift fahren per CSS aus ihrer Maske (`.hero-h1` in
 * globals.css, ohne auf die Hydrierung zu warten); Text, Knöpfe, Vertrauenszeile und Leistungen folgen
 * gestaffelt, das Bild steigt weich auf. Beim Hinausscrollen driftet die Überschrift leicht nach
 * oben und blendet etwas aus, und am Fuß des Hero zeichnet sich eine orange Linie mit Kopfpunkt quer über
 * die Inhaltsbreite (Scroll-Effekt mit Linie, führt in die Folgesektion). Nur transform und opacity. Ohne
 * JavaScript und bei reduzierter Bewegung steht sofort alles da (Server-HTML ist der Endzustand).
 *
 * Die Überschrift hängt an `.hero-h1` (globals.css): Die Schriftgröße folgt der Inhaltsbreite, so dass
 * „Ortseingangsschild.“ auf jeder Breite vollständig in einer Zeile steht und nie von der Maske
 * abgeschnitten wird.
 */
const VERTRAUEN = ['Antwort in 24 Stunden', 'Kostenlose Prüfung', 'Vor Ort in Ihrer Verwaltung'];

export default function Hero() {
    const wurzel = useRef<HTMLElement>(null);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el || bewegungReduziert()) return;
        registerGsap();

        const teile = Array.from(el.querySelectorAll<HTMLElement>('[data-intro]'));
        const freigeben = () => {
            for (const t of teile) t.removeAttribute('data-intro');
        };

        const ctx = gsap.context(() => {
            const finde = (name: string) => el.querySelector<HTMLElement>(`[data-intro="${name}"]`);

            gsap.set(teile, { visibility: 'visible' });
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: freigeben });

            const label = finde('label');
            const text = finde('text');
            const knoepfe = finde('cta');
            const vertrauen = finde('meta');
            const leistungen = finde('leist');
            const ansicht = finde('ansicht');

            if (label) tl.from(label, { opacity: 0, y: 10, duration: 0.6 }, 0);
            if (text) tl.from(text, { opacity: 0, y: 16, duration: 0.7 }, 0.35);
            if (knoepfe) tl.from(knoepfe, { opacity: 0, y: 16, duration: 0.7 }, 0.45);
            if (vertrauen) tl.from(vertrauen, { opacity: 0, y: 10, duration: 0.7 }, 0.55);
            if (leistungen) tl.from(leistungen, { opacity: 0, y: 10, duration: 0.7 }, 0.65);
            if (ansicht) tl.from(ansicht, { opacity: 0, y: 48, rotateX: 8, transformPerspective: 1200, duration: 1.2, ease: 'expo.out' }, 0.2);

            // Linie am Fuß des Hero: zeichnet sich beim Weiterscrollen von links nach rechts, der Kopfpunkt läuft mit.
            const linie = el.querySelector<HTMLElement>('[data-hero-linie]');
            const fuell = el.querySelector<HTMLElement>('[data-hero-linie-fuell]');
            const kopfpunkt = el.querySelector<HTMLElement>('[data-hero-linie-punkt]');
            if (linie && fuell && kopfpunkt) {
                const spur = { start: 'bottom 88%', end: 'bottom 38%', scrub: 0.4 };
                gsap.fromTo(
                    fuell,
                    { scaleX: 0 },
                    { scaleX: 1, ease: 'none', immediateRender: true, scrollTrigger: { trigger: el, ...spur } },
                );
                gsap.fromTo(
                    kopfpunkt,
                    { x: () => -linie.offsetWidth },
                    {
                        x: 0,
                        ease: 'none',
                        immediateRender: true,
                        scrollTrigger: { trigger: el, ...spur, invalidateOnRefresh: true },
                    },
                );
            }

            // Bühne: die Lichter driften beim Hinausscrollen mit unterschiedlicher Geschwindigkeit nach oben (nur transform).
            const lichtA = el.querySelector<HTMLElement>('[data-glow="a"]');
            const lichtB = el.querySelector<HTMLElement>('[data-glow="b"]');
            const lichtC = el.querySelector<HTMLElement>('[data-glow="c"]');
            const drift = { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.8 };
            if (lichtA) gsap.to(lichtA, { y: -150, x: 40, ease: 'none', scrollTrigger: drift });
            if (lichtB) gsap.to(lichtB, { y: -70, ease: 'none', scrollTrigger: drift });
            if (lichtC) gsap.to(lichtC, { y: 90, ease: 'none', scrollTrigger: drift });

            // Beim Hinausscrollen: die Überschrift driftet langsam nach oben und blendet etwas aus.
            const kopf = el.querySelector<HTMLElement>('[data-hero-kopf]');
            if (kopf) {
                gsap.to(kopf, {
                    yPercent: -8,
                    opacity: 0.25,
                    ease: 'none',
                    scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.5 },
                });
            }
        }, el);

        // Zeiger: am Desktop folgen die inneren Lichtflächen dem Zeiger ein wenig (gegenläufig, verschieden stark).
        let abmelden: (() => void) | undefined;
        if (feinerZeiger()) {
            ctx.add(() => {
                const ziele = (['a', 'b', 'c'] as const).map((n, i) => {
                    const innen = el.querySelector<HTMLElement>(`[data-glow="${n}"] > div`);
                    if (!innen) return null;
                    return {
                        tiefe: [34, -22, 14][i],
                        x: gsap.quickTo(innen, 'x', { duration: 1.4, ease: 'power3.out' }),
                        y: gsap.quickTo(innen, 'y', { duration: 1.4, ease: 'power3.out' }),
                    };
                });
                const bewegt = (e: PointerEvent) => {
                    const nx = e.clientX / window.innerWidth - 0.5;
                    const ny = e.clientY / window.innerHeight - 0.5;
                    for (const z of ziele) {
                        if (!z) continue;
                        z.x(nx * z.tiefe * 2);
                        z.y(ny * z.tiefe * 1.2);
                    }
                };
                el.addEventListener('pointermove', bewegt, { passive: true });
                abmelden = () => el.removeEventListener('pointermove', bewegt);
            });
        }

        return () => {
            abmelden?.();
            ctx.revert();
        };
    }, []);

    const zumKontakt = (e: React.MouseEvent<HTMLAnchorElement>) => {
        waehleAnliegen('website');
        handleAnchorClick(e, 'kontakt');
    };

    const zuSchulungen = (e: React.MouseEvent<HTMLAnchorElement>) => {
        handleAnchorClick(e, 'schulungen');
    };

    return (
        <section
            ref={wurzel}
            id="start"
            className="relative isolate overflow-hidden pb-[clamp(3.5rem,8vh,6.5rem)] pt-[calc(var(--header-h)+clamp(1.25rem,3.5vh,3rem))]"
        >
            {/* Bühne: Punktraster, Rasterlinien und drei weiche Lichter (nur Zierde, hinter dem Inhalt) */}
            <div aria-hidden="true" className="hero-buehne">
                <div className="hero-dots" />
                <div className="hero-gitter">
                    <i />
                    <i />
                </div>
                <div data-glow="c" className="hero-glow hero-glow-c">
                    <div />
                </div>
                <div data-glow="a" className="hero-glow hero-glow-a">
                    <div />
                </div>
                <div data-glow="b" className="hero-glow hero-glow-b">
                    <div />
                </div>
            </div>

            <div className="wrap">
                <div data-hero-kopf>
                    <Label data-intro="label">Websites für Gemeinden, Ämter und Behörden</Label>

                    <h1 className="hero-h1 mt-4 lg:mt-6">
                        <span className="zeile">
                            <span>Ihr digitales</span>
                        </span>
                        <span className="zeile">
                            <span className="text-brand-600">Ortseingangs&shy;schild.</span>
                        </span>
                    </h1>
                </div>

                {/* Mobil: Text und Knöpfe, Produktansicht, Vertrauenszeile. Ab 1024 px: Text links (Zeile 1) und
                    Vertrauenszeile (Zeile 2), die Produktansicht rechts über beide Zeilen, oben bündig mit dem Text. */}
                <div className="grid-12 mt-6 items-start gap-y-8 lg:mt-8 lg:grid-rows-[auto_1fr] lg:gap-y-0">
                    <div className="col-span-12 lg:col-span-5 lg:row-start-1 lg:-mt-1">
                        {EINZELNES.heroSatzMitAngebot ? (
                            <p
                                data-intro="text"
                                className="max-w-[24em] text-[clamp(1.25rem,1.05rem+0.6vw,1.5rem)] font-medium leading-[1.4] tracking-[-0.015em] text-ink"
                            >
                                Wir bauen Websites für Gemeinden, Ämter und Behörden: sicher, barrierefrei und rechtskonform.
                            </p>
                        ) : (
                            <p data-intro="text" className="max-w-[34em] text-[1.0625rem] leading-[1.55] text-ink-2 sm:text-lead">
                                {EINZELNES.heroErsterSatz
                                    ? 'Die Website ist das Erste, was Bürgerinnen, Bürger und Unternehmen von Ihrer Gemeinde sehen. '
                                    : null}
                                Wir machen Ihre Website sicher, barrierefrei und rechtskonform.
                            </p>
                        )}

                        <div data-intro="cta" className="mt-6 flex flex-wrap gap-3 lg:mt-9">
                            <Magnet>
                                <ButtonLink href="/#kontakt" onClick={zumKontakt}>
                                    Kostenlose Vorschau anfragen
                                    <span className="pfeil" aria-hidden="true">
                                        →
                                    </span>
                                </ButtonLink>
                            </Magnet>
                            {EINZELNES.heroKnopfSchulung ? (
                                <ButtonLink href="/#schulungen" variant="secondary" onClick={zuSchulungen}>
                                    KI-Fortbildung ansehen
                                </ButtonLink>
                            ) : null}
                        </div>
                    </div>

                    <div
                        data-intro="ansicht"
                        className="col-span-12 pb-2 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:pb-8 lg:pl-6"
                    >
                        {EINZELNES.heroWebsiteCheck ? <WebsiteCheck /> : <HeroMusterbach />}
                    </div>

                    <div className="col-span-12 lg:col-span-5 lg:row-start-2 lg:mt-8">
                        <ul data-intro="meta" className="flex flex-wrap gap-x-6 gap-y-2 text-klein text-ink-3">
                            {VERTRAUEN.map((v) => (
                                <li key={v} className="flex items-center gap-2">
                                    <svg viewBox="0 0 16 16" className="h-4 w-4 text-ok" fill="none" aria-hidden="true">
                                        <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {v}
                                </li>
                            ))}
                            <li className="flex items-center gap-2">
                                <Phone aria-hidden="true" size="1rem" strokeWidth={1.75} className="text-brand-ink" />
                                {/* Tippfläche 44 px hoch (Innenabstand), ohne die Zeile zu strecken (negativer Außenabstand) */}
                                <a href={KONTAKT.telefonHref} className="link -my-2.5 whitespace-nowrap py-2.5">
                                    {KONTAKT.telefon}
                                </a>
                            </li>
                        </ul>

                        {/* Sprungziele (nur sichtbare Abschnitte): füllt die Spalte unter der Vertrauenszeile (ab 1024 px) */}
                        {EINZELNES.heroSprungzeile ? (
                            <nav data-intro="leist" aria-label="Auf einen Blick" className="mt-9 hidden border-t border-line pt-5 lg:block">
                                <Label>Auf einen Blick</Label>
                                <ul className="mt-2.5 grid grid-flow-col auto-cols-fr divide-x divide-line">
                                    {LEISTUNGEN.map((l) => (
                                        <li key={l.id} className="px-4 first:pl-0 last:pr-0">
                                            <AnkerLink
                                                id={l.id}
                                                className="group/l flex min-h-[2.75rem] items-start justify-between gap-2 py-1.5 text-[0.9375rem] font-semibold leading-snug text-ink transition-colors hover:text-brand-ink"
                                            >
                                                <span>{l.label}</span>
                                                <ArrowRight
                                                    aria-hidden="true"
                                                    size="0.9375rem"
                                                    strokeWidth={1.75}
                                                    className="mt-[0.1875rem] flex-none text-ink-3 transition-all duration-300 group-hover/l:translate-x-0.5 group-hover/l:text-brand-ink"
                                                />
                                            </AnkerLink>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Schlusslinie: feine Spur, darauf zeichnet sich beim Scrollen die orange Linie mit Kopfpunkt */}
            <div aria-hidden="true" className="wrap pointer-events-none absolute inset-x-0 bottom-0 pb-2">
                <div data-hero-linie className="relative h-px bg-line">
                    <span data-hero-linie-fuell className="absolute -top-px left-0 h-[2px] w-full origin-left rounded-full bg-brand" />
                    <span
                        data-hero-linie-punkt
                        className="absolute -top-[3px] right-0 -mr-[3.5px] h-[7px] w-[7px] rounded-full bg-brand"
                        style={{ boxShadow: '0 0 0 4px var(--brand-100)' }}
                    />
                </div>
            </div>
        </section>
    );
}
