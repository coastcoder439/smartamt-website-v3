'use client';

import { useRef } from 'react';
import { Label } from '@/components/ui/Label';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { LOGO_ZEICHEN } from '@/components/ui/logo-zeichen';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';
import { LOGO_HEUTE, LOGO_STANDARD, LOGO_ZEICHEN_IDS } from '@/lib/logos';
import { ABSCHNITT_WEISS, LABEL_GROSS } from '../c2/abschnitt';
import { KARTE_BREITE, KARTE_HOEHE, LAENDER, NETZ, STAEDTE } from './deutschland-karte';

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

const ZEICHEN_IDS = LOGO_ZEICHEN_IDS.filter((id) => id in LOGO_ZEICHEN) as (keyof typeof LOGO_ZEICHEN)[];

/** Sichtbarkeit des Zeichens je Logo-Wahl, wie in ui/LogoSprite.tsx für Kopf und Fuß. */
const SICHTBAR = [
    '.karte-zeichen,.karte-punkt{display:none}',
    `html:not([data-logo]) .karte-zeichen[data-zeichen='${LOGO_STANDARD}']{display:inline}`,
    ...ZEICHEN_IDS.map((id) => `html[data-logo='${id}'] .karte-zeichen[data-zeichen='${id}']{display:inline}`),
    `html[data-logo='${LOGO_HEUTE}'] .karte-punkt{display:inline}`,
].join('');

/** Durchmesser der Plakette um das Zeichen, in Karteneinheiten (Karte 1000 breit). */
const PLAKETTE = 78;
const ZEICHEN = 60;

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
            <style dangerouslySetInnerHTML={{ __html: SICHTBAR }} />
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
                    <svg
                        data-karte
                        viewBox={`-40 -40 ${KARTE_BREITE + 80} ${KARTE_HOEHE + 80}`}
                        role="img"
                        aria-label="Deutschlandkarte mit den 16 Bundesländern. In jedem Land und in Leipzig steht das SmartAmt-Zeichen; Linien verbinden die Orte zu einem Netz."
                        className="mx-auto block h-auto max-h-[calc(100svh-11rem)] w-full max-w-[38rem]"
                    >
                        <g data-umriss>
                            {LAENDER.map((land) => (
                                <path
                                    key={land.kuerzel}
                                    data-land
                                    d={land.d}
                                    className="fill-bg-2 stroke-ink-3"
                                    strokeWidth={1.25}
                                    strokeLinejoin="round"
                                    vectorEffect="non-scaling-stroke"
                                >
                                    <title>{land.name}</title>
                                </path>
                            ))}
                        </g>

                        <g aria-hidden="true">
                            {NETZ.map(([a, b]) => (
                                <line
                                    key={`${a}-${b}`}
                                    data-linie
                                    x1={STAEDTE[a].x}
                                    y1={STAEDTE[a].y}
                                    x2={STAEDTE[b].x}
                                    y2={STAEDTE[b].y}
                                    pathLength={1}
                                    strokeDasharray="1 1"
                                    strokeDashoffset={0}
                                    className="stroke-brand"
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                    opacity={0.6}
                                />
                            ))}
                        </g>

                        <g aria-hidden="true">
                            {STAEDTE.map((stadt) => (
                                <g key={stadt.name} data-stadt data-y={stadt.y}>
                                    <circle
                                        cx={stadt.x}
                                        cy={stadt.y}
                                        r={PLAKETTE / 2}
                                        className="fill-bg stroke-brand"
                                        strokeWidth={2.5}
                                    />
                                    {ZEICHEN_IDS.map((id) => (
                                        <svg
                                            key={id}
                                            className="karte-zeichen"
                                            data-zeichen={id}
                                            x={stadt.x - ZEICHEN / 2}
                                            y={stadt.y - ZEICHEN / 2}
                                            width={ZEICHEN}
                                            height={ZEICHEN}
                                            viewBox={LOGO_ZEICHEN[id].viewBox}
                                        >
                                            <use href={`#lz-${id}`} />
                                        </svg>
                                    ))}
                                    <circle className="karte-punkt fill-brand" cx={stadt.x} cy={stadt.y} r={9} />
                                </g>
                            ))}
                        </g>
                    </svg>
                </div>
            </div>
        </section>
    );
}
