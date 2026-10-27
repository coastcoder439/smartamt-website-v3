'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { bewegungReduziert, gsap, registerGsap } from '@/lib/gsap';
import { NachherSeite } from '@/components/sections/b2/MusterbachSeiten';

/**
 * Bild im Hero: die fertige Beispielgemeinde Musterbach als ruhige Karte (Website v2, auf Wunsch der Website-Sitzung;
 * Owner 26.10.2026: „den Header bei uns, also da, ne, dieses, dieses Ding mit www.musterbach.de, das ist komplett
 * überfordernd“ und „diese Dinger noch abgehen, das packen wir alles schön wie bei Tobi gebündelt unter diese vorher nacher
 * schieber“). Es ist dieselbe gezeichnete Seite wie „Nachher“ im Vorher/Nachher (b2/MusterbachSeiten.tsx), ohne Browser-Leiste,
 * ohne Adresse, ohne Hinweiskästchen, ohne Striche und ohne Prüfliste. Die Prüfpunkte stehen in der Befund-Liste unter dem
 * Vorher/Nachher (b2/Befunde.tsx). Die alte Karte (hero/WebsiteCheck.tsx) bleibt im Code und erscheint mit
 * `EINZELNES.heroWebsiteCheck` (lib/abschnitte.ts) wieder.
 *
 * Beschriftung: nur „Beispielgemeinde Musterbach“ unter der Karte. Die Karte ist ein Bild (role="img" mit Beschreibung).
 *
 * Bewegung (GSAP, nur transform und opacity, reduzierte Bewegung respektiert): Nach dem Aufsteigen der Karte (Hero.tsx,
 * data-intro="ansicht") zoomt die gezeichnete Landschaft langsam auf ihre Größe zurück (1,08 → 1), danach fahren Titel, Suchfeld und
 * die vier Kacheln gestaffelt herein. Beim Hinausscrollen bleibt die Karte etwas zurück (yPercent −3) und die Landschaft wandert ein
 * Stück nach oben. Das Server-HTML ist der Endzustand: ohne JavaScript und bei reduzierter Bewegung steht alles sofort da.
 *
 * Die gezeichnete Seite misst in Container-Einheiten (cqw): Die Karte ist darum selbst ein Container (inline-size). Unter 560 px
 * Kartenbreite stellt die Seite auf einspaltig um (siehe Vergleich.module.css).
 */
export function HeroMusterbach() {
    const wurzel = useRef<HTMLDivElement>(null);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el || bewegungReduziert()) return;
        registerGsap();

        const ctx = gsap.context(() => {
            const karte = el.querySelector<HTMLElement>('[data-hero-karte]');
            const zoom = el.querySelector<SVGGElement>('[data-mb="zoom"]');
            const text = el.querySelector<HTMLElement>('[data-mb="text"]');
            const suche = el.querySelector<HTMLElement>('[data-mb="suche"]');
            const kacheln = Array.from(el.querySelectorAll<HTMLElement>('[data-mb="kachel"]'));

            // Einlauf: kommt, wenn die Karte im Hero gestiegen ist (Hero-Intro läuft etwa 1,4 s)
            const tl = gsap.timeline({ delay: 0.9, defaults: { ease: 'power3.out' } });
            if (zoom) tl.from(zoom, { scale: 1.08, svgOrigin: '620 130', duration: 2.6, ease: 'expo.out' }, 0);
            if (text) tl.from(text, { opacity: 0, y: 16, duration: 0.9 }, 0.25);
            if (suche) tl.from(suche, { opacity: 0, y: 14, duration: 0.9 }, 0.45);
            if (kacheln.length) tl.from(kacheln, { opacity: 0, y: 18, duration: 0.8, stagger: 0.09 }, 0.6);

            // Ruhige Parallaxe beim Scrollen: Die Karte bleibt etwas zurück, die Landschaft wandert ein Stück nach oben.
            if (karte) {
                gsap.to(karte, {
                    yPercent: -3,
                    ease: 'none',
                    scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom top', scrub: 0.6 },
                });
            }
            if (zoom) {
                gsap.to(zoom, {
                    y: -10,
                    ease: 'none',
                    scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom top', scrub: 0.9 },
                });
            }
        }, el);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={wurzel} className="relative isolate">
            {/* warmes Licht hinter der Karte (nur Zierde) */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-10 -z-20 rounded-[3rem] opacity-70 blur-3xl"
                style={{ background: 'radial-gradient(60% 60% at 60% 40%, var(--brand-100), transparent 70%)' }}
            />

            <div
                data-hero-karte
                role="img"
                aria-label="Beispiel: neue Website der Gemeinde Musterbach"
                className="overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-lg [container-type:inline-size]"
            >
                <NachherSeite />
            </div>

            <p className="mt-4 text-center font-mono text-[0.75rem] leading-snug text-ink-3">Beispielgemeinde Musterbach</p>
        </div>
    );
}

export default HeroMusterbach;
