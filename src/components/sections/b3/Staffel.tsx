'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { bewegungReduziert, gsap, registerGsap } from '@/lib/gsap';

/**
 * Gestaffelte Einblendung der direkten Kinder einer Liste oder Gruppe (Deckkraft 0 → 1, y 18 px → 0,
 * 0,6 s, power3.out, Stagger 0,1). Läuft einmalig, sobald die Gruppe in den Bildschirm kommt, und hängt
 * danach nicht mehr am Scroll. Gleiches Muster wie Reveal.tsx: Das Server-HTML zeigt den fertigen
 * Inhalt, die Startzustände setzt erst der Effekt im Browser; bei reduzierter Bewegung und ohne
 * JavaScript bleibt alles einfach stehen.
 */

type StaffelProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
    as?: 'div' | 'ul' | 'ol' | 'dl';
    /** CSS-Auswahl der Kinder, die einzeln hereinkommen (Vorgabe: alle direkten Kinder). */
    kinder?: string;
    /** ScrollTrigger-Start (Vorgabe „top 88%“). */
    start?: string;
    children: React.ReactNode;
};

export function Staffel({ as = 'div', kinder = ':scope > *', start = 'top 88%', children, ...rest }: StaffelProps) {
    const ref = useRef<HTMLElement>(null);

    useIsoLayoutEffect(() => {
        const el = ref.current;
        if (!el || bewegungReduziert()) return;
        const ziele = Array.from(el.querySelectorAll<HTMLElement>(kinder));
        if (ziele.length === 0) return;
        registerGsap();

        const ctx = gsap.context(() => {
            gsap.from(ziele, {
                opacity: 0,
                y: 18,
                duration: 0.6,
                ease: 'power3.out',
                stagger: 0.1,
                clearProps: 'opacity,transform',
                scrollTrigger: { trigger: el, start, once: true },
            });
        }, el);

        return () => ctx.revert();
    }, [kinder, start]);

    const Tag = as as React.ElementType;
    return (
        <Tag ref={ref} {...rest}>
            {children}
        </Tag>
    );
}

export default Staffel;
