'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Ruhige Parallaxe, gekoppelt an den Scroll (scrub, nur transform). Zwei Arten:
 *
 *  - „bild“ (Vorgabe): ein Foto in einer Karte. Das Bild wandert langsam gegen die Karte (yPercent −6 → 6).
 *    Es steht 12 % größer als sein Rahmen (der Rahmen schneidet zu), damit nie ein Rand sichtbar wird.
 *  - „schweben“: ein Teil (zum Beispiel die Ansicht „Websites“ in der Leistungskarte) schwebt um `weg` Pixel
 *    gegen den Scroll (y +weg → −weg), ohne Zuschnitt und ohne Vergrößerung. Der Aufrufer gibt der Fläche
 *    außenrum genug Rand (mindestens `weg` Pixel).
 *
 * Bei reduzierter Bewegung und ohne JavaScript steht alles still (mittig, gleich groß).
 */
type ParallaxProps = {
    className?: string;
    children: React.ReactNode;
    art?: 'bild' | 'schweben';
    /** nur für „schweben“: Weg in Pixeln je Richtung (Vorgabe 14) */
    weg?: number;
    /** nur für „schweben“: das bewegte Teil füllt den Rahmen (für Flächen, die selbst keine Höhe haben) */
    fuellen?: boolean;
};

export function Parallax({ className, children, art = 'bild', weg = 14, fuellen = false }: ParallaxProps) {
    const rahmen = useRef<HTMLDivElement>(null);
    const bild = useRef<HTMLDivElement>(null);

    useIsoLayoutEffect(() => {
        const r = rahmen.current;
        const b = bild.current;
        if (!r || !b) return;
        registerGsap();

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const spur = { trigger: r, start: 'top bottom', end: 'bottom top', scrub: true };
            if (art === 'schweben') {
                gsap.fromTo(b, { y: weg }, { y: -weg, ease: 'none', scrollTrigger: spur });
                return;
            }
            gsap.fromTo(
                b,
                { yPercent: -6, scale: 1.12 },
                { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: spur },
            );
        });

        return () => mm.revert();
    }, [art, weg]);

    const schweben = art === 'schweben';
    return (
        <div ref={rahmen} className={cn(!schweben && 'overflow-hidden', className)}>
            <div ref={bild} className={cn('will-change-transform', (!schweben || fuellen) && 'h-full w-full')}>
                {children}
            </div>
        </div>
    );
}

export default Parallax;
