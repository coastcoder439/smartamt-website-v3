'use client';

import { useRef } from 'react';
import { Label } from '@/components/ui/Label';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';
import { ABSCHNITT_WEISS, LABEL_GROSS } from '../c2/abschnitt';
import KarteSvg from './KarteSvg';

/**
 * Deutschlandkarte (id deutschlandkarte), Website v3, Seite /ueber-uns, unter den fünf Versprechen. Owner 27.10.2026:
 * „so eine Deutschlandkarte … unter diesen 5 Versprechen … So ein Umriss so von dieser Deutschlandkarte und den Bundesländern
 * und das dann überall so bei den Städten quasi ganzen Smartamt-Symbole aufploppen quasi … Und die dann so miteinander
 * vernetzen auf einmal. Irgendwie so eine Motion-Graphic da“ und „dann wie Deutschland halt auf Platz 1 kommt mit dieser
 * Kartenvisualisierung“.
 *
 * Links die Aussage: Deutschland auf dem Weg zu Platz 1, als Ziel formuliert (heute Platz 12 im UN E-Government Survey 2024,
 * docs/research/facts-context.md, Abschnitt 2). Rechts die Karte: Umriss und 16 Bundesländer (Natural Earth, gemeinfrei,
 * ueber/deutschland-karte.ts), an den Landeshauptstädten und in Leipzig das SmartAmt-Zeichen der gerade gewählten Logo-Variante
 * (dieselben <symbol id="lz-…"> wie Kopf und Fuß, ui/LogoSprite.tsx; sichtbar nach html[data-logo], ohne Wahl der Standard;
 * bei der reinen Wortmarke ein Markenpunkt), danach verbinden Linien die Zeichen zu einem Netz.
 *
 * Bewegung (GSAP ScrollTrigger, scrub, nur transform, opacity und stroke-dashoffset): Länder blenden ein, die Zeichen ploppen
 * nacheinander von Nord nach Süd auf, die Netzlinien zeichnen sich. Das Server-HTML ist der Endzustand: ohne JavaScript und
 * bei prefers-reduced-motion steht die fertige Karte da. Keine Punktfläche, Farben aus den Token der Farbvariante.
 */

export default function Deutschlandkarte() {
    const wurzel = useRef<HTMLElement>(null);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el) return;
        registerGsap();
        const karte = el.querySelector<SVGSVGElement>('[data-karte]');
        if (!karte) return;

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const laender = gsap.utils.toArray<SVGPathElement>(karte.querySelectorAll('[data-land]'));
            const umriss = karte.querySelector<SVGGElement>('[data-umriss]');
            // Städte von Nord nach Süd: das Netz wächst über das Land
            const staedte = gsap.utils
                .toArray<SVGGElement>(karte.querySelectorAll('[data-stadt]'))
                .sort((a, b) => Number(a.dataset.y) - Number(b.dataset.y));
            const linien = gsap.utils.toArray<SVGLineElement>(karte.querySelectorAll('[data-linie]'));
            const ziel = el.querySelector<HTMLElement>('[data-ziel]');

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                // fertig, wenn die Karte mittig steht (Prüfer Runde 2: das fertige Netz muss ganz im Bild sein)
                scrollTrigger: { trigger: karte, start: 'top 85%', end: 'center 58%', scrub: 0.6 },
            });
            tl.fromTo(laender, { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.03 }, 0);
            if (umriss) tl.fromTo(umriss, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);
            tl.fromTo(
                staedte,
                { scale: 0, opacity: 0, transformOrigin: '50% 50%' },
                { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.2)', stagger: 0.12 },
                0.5,
            );
            tl.fromTo(linien, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.05 }, 1.2);
            if (ziel) tl.fromTo(ziel, { opacity: 0.35 }, { opacity: 1, duration: 0.6 }, 1.6);
        });

        return () => mm.revert();
    }, []);

    return (
        <section ref={wurzel} id="deutschlandkarte" aria-labelledby="karte-titel" className={`${ABSCHNITT_WEISS} lg:!pt-12`}>
            <div className="wrap grid-12 items-center gap-y-12">
                <div className="col-span-12 lg:col-span-5">
                    <Label className={LABEL_GROSS}>Unser Ziel</Label>
                    <RevealHeading as="h2" id="karte-titel" className="mt-4">
                        Deutschland auf dem Weg zu <span className="text-brand-600">Platz&nbsp;1.</span>
                    </RevealHeading>
                    <RevealText className="mt-6 max-w-[30em] text-lead">
                        Heute steht Deutschland auf Platz 12 im E-Government-Ranking der Vereinten Nationen. Unser Ziel: Gemeinde für
                        Gemeinde ein Netz aus Websites, auf denen sich alle gleich gut zurechtfinden.
                    </RevealText>
                    <p data-ziel className="mt-8 max-w-[34ch] border-t border-line-2 pt-4 font-mono text-klein text-ink-3">
                        Quelle: UN E-Government Survey 2024. Karte: Natural Earth (gemeinfrei); ein Zeichen in jedem der 16 Länder und
                        in Leipzig, unserem Sitz.
                    </p>
                </div>

                <div className="col-span-12 lg:col-span-7 lg:col-start-6">
                    <KarteSvg className="mx-auto block h-auto max-h-[calc(100svh-11rem)] w-full max-w-[38rem]" />
                </div>
            </div>
        </section>
    );
}
