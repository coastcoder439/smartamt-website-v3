'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';

/**
 * Gestaffeltes Hereinschweben (Karten, Zeilen): Deckkraft 0 → 1 und y 28 px → 0, 0,9 s, power3.out,
 * Versatz 0,12 s je Reihe. Läuft einmalig, sobald die Gruppe in den Bildschirm kommt, und hängt danach nicht
 * mehr am Scroll. Danach werden die Inline-Werte entfernt (`clearProps`), damit die Hover-Effekte der
 * Karten (CSS, 2 px höher) wieder greifen.
 *
 * Reihen: Teile mit demselben `data-reihe` (0, 1, 2 …) starten gleichzeitig. So schweben zwei Karten
 * nebeneinander im Gleichschritt herein und stehen nie versetzt gegeneinander, auch nicht mitten in der Bewegung.
 * Ohne `data-reihe` zählt die Reihenfolge im Dokument (ein Teil je Reihe).
 *
 * Das Server-HTML zeigt alles fertig. Die Startzustände setzt erst der Effekt im Browser; bei
 * reduzierter Bewegung und ohne JavaScript bleibt alles stehen (CI v3, „Bewegung“).
 */
type GestaffeltProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
    as?: 'div' | 'ul' | 'ol';
    /** CSS-Auswahl der Teile, die einzeln hereinkommen (Vorgabe: Elemente mit data-st). */
    teile?: string;
    /** ScrollTrigger-Start (Vorgabe „top 82%“). */
    start?: string;
    /** Versatz zwischen den Reihen in Sekunden. */
    versatz?: number;
    /** Weg in Pixeln. */
    weg?: number;
    children: React.ReactNode;
};

export function Gestaffelt({
    as = 'div',
    teile = '[data-st]',
    start = 'top 82%',
    versatz = 0.12,
    weg = 28,
    children,
    ...rest
}: GestaffeltProps) {
    const ref = useRef<HTMLElement>(null);

    useIsoLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        registerGsap();

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const ziele = Array.from(el.querySelectorAll<HTMLElement>(teile));
            if (ziele.length === 0) return;
            gsap.from(ziele, {
                opacity: 0,
                y: weg,
                duration: 0.9,
                ease: 'power3.out',
                delay: (i: number, ziel: Element) => {
                    const reihe = Number((ziel as HTMLElement).dataset.reihe);
                    return (Number.isFinite(reihe) ? reihe : i) * versatz;
                },
                clearProps: 'opacity,transform',
                scrollTrigger: { trigger: el, start, once: true },
            });
        });

        return () => mm.revert();
    }, [teile, start, versatz, weg]);

    const Tag = as as React.ElementType;
    return (
        <Tag ref={ref} {...rest}>
            {children}
        </Tag>
    );
}

export default Gestaffelt;
