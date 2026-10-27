'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { bewegungReduziert, feinerZeiger, gsap, registerGsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Magnet: Der Inhalt folgt dem Mauszeiger ein Stück, solange dieser darüber steht, und federt
 * beim Verlassen zurück. Übernommen aus dem Prinzip von `ui/magnetic-button.tsx` (Leons Website:
 * Zug von 30 % zur Mitte), hier mit GSAP `quickTo` statt framer-motion, nur transform.
 *
 * Läuft nur an Maus oder Trackpad und nicht bei reduzierter Bewegung; sonst ist die Komponente
 * ein ruhiger Rahmen. Der Wrapper ist `inline-flex`, damit er Knöpfe nicht verbreitert.
 */
type MagnetProps = {
    /** Zug zur Zeigerposition, 0 bis 1 (Vorgabe 0,3). */
    staerke?: number;
    className?: string;
    children: React.ReactNode;
};

export function Magnet({ staerke = 0.3, className, children }: MagnetProps) {
    const ref = useRef<HTMLSpanElement>(null);

    useIsoLayoutEffect(() => {
        const el = ref.current;
        if (!el || bewegungReduziert() || !feinerZeiger()) return;
        registerGsap();

        const ctx = gsap.context(() => {
            const nachX = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
            const nachY = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

            const bewegt = (e: PointerEvent) => {
                const r = el.getBoundingClientRect();
                nachX((e.clientX - (r.left + r.width / 2)) * staerke);
                nachY((e.clientY - (r.top + r.height / 2)) * staerke);
            };
            const verlassen = () => {
                nachX(0);
                nachY(0);
            };

            el.addEventListener('pointermove', bewegt);
            el.addEventListener('pointerleave', verlassen);
            return () => {
                el.removeEventListener('pointermove', bewegt);
                el.removeEventListener('pointerleave', verlassen);
            };
        }, el);

        return () => ctx.revert();
    }, [staerke]);

    return (
        <span ref={ref} className={cn('inline-flex', className)}>
            {children}
        </span>
    );
}

export default Magnet;
