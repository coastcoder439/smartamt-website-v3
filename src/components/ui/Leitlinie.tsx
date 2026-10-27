'use client';

import { useRef, type RefObject } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { bewegungReduziert, gsap, registerGsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Leitlinie: die Linie, die sich beim Scrollen zeichnet (CI v3, docs/brand/brand-identity.md,
 * „Bewegung“). Sie verbindet Schritte, die wirklich aufeinander folgen. Für reine Aufzählungen
 * wird sie nicht verwendet. Gezeichnet wird über clip-path (nur Zuschnitt, keine Layoutwirkung).
 *
 * Die Linie nimmt die Textfarbe an (`currentColor`): auf hellen Flächen zum Beispiel
 * `text-brand` (Orange) oder `text-line-2` für die ruhige Führungsspur, auf dunklen `text-brand`.
 * Größe und Lage bestimmt der Aufrufer über `className` (senkrecht: Höhe und Breite ≥
 * Strichstärke, waagerecht: Breite und Höhe ≥ Strichstärke). Mit `strich`/`luecke` lässt sich die
 * Linie durchgehend (Lücke 0) oder gestrichelt setzen.
 *
 * Standardmäßig hängt die Zeichnung am eigenen Kasten. Mit `ausloeser` hängt sie an einem
 * größeren Element, zum Beispiel an der ganzen Schrittliste. Ohne JavaScript und bei
 * reduzierter Bewegung steht die Linie fertig gezeichnet da.
 */
type LeitlinieProps = {
    richtung?: 'senkrecht' | 'waagerecht';
    /** Länge eines Strichs in px (Vorgabe 1, mit Lücke 0 also durchgehend). */
    strich?: number;
    /** Länge einer Lücke in px (Vorgabe 0). */
    luecke?: number;
    /** Strichstärke in px (Vorgabe 2). */
    staerke?: number;
    /** Element, dessen Scrollweg die Linie zeichnet. Vorgabe: der eigene Kasten. */
    ausloeser?: RefObject<HTMLElement | null>;
    /** ScrollTrigger-Start (Vorgabe „top 80%“). */
    start?: string;
    /** ScrollTrigger-Ende (Vorgabe „bottom 60%“). */
    ende?: string;
    className?: string;
};

export function Leitlinie({
    richtung = 'senkrecht',
    strich = 1,
    luecke = 0,
    staerke = 2,
    ausloeser,
    start = 'top 80%',
    ende = 'bottom 60%',
    className,
}: LeitlinieProps) {
    const kastenRef = useRef<HTMLDivElement>(null);
    const klammerRef = useRef<HTMLDivElement>(null);
    const senkrecht = richtung === 'senkrecht';

    useIsoLayoutEffect(() => {
        const kasten = kastenRef.current;
        const klammer = klammerRef.current;
        if (!kasten || !klammer || bewegungReduziert()) return;
        registerGsap();

        const ctx = gsap.context(() => {
            gsap.fromTo(
                klammer,
                { clipPath: senkrecht ? 'inset(0% 0% 100% 0%)' : 'inset(0% 100% 0% 0%)' },
                {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: ausloeser?.current ?? kasten,
                        start,
                        end: ende,
                        scrub: 0.3,
                    },
                },
            );
        }, kasten);

        return () => ctx.revert();
    }, [senkrecht, start, ende, ausloeser]);

    return (
        <div
            ref={kastenRef}
            aria-hidden="true"
            className={cn('pointer-events-none relative', className)}
            style={senkrecht ? { minWidth: staerke } : { minHeight: staerke }}
        >
            <div ref={klammerRef} className="absolute inset-0">
                <svg className="h-full w-full overflow-visible" focusable="false">
                    <line
                        x1={senkrecht ? '50%' : 0}
                        y1={senkrecht ? 0 : '50%'}
                        x2={senkrecht ? '50%' : '100%'}
                        y2={senkrecht ? '100%' : '50%'}
                        stroke="currentColor"
                        strokeWidth={staerke}
                        strokeDasharray={`${strich} ${luecke}`}
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        </div>
    );
}

export default Leitlinie;
