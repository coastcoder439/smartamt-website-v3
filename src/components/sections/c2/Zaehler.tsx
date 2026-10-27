'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Zähler: eine Zahl, die beim Hineinscrollen von `von` auf `bis` läuft (zählt hoch oder herunter),
 * einmalig, 1,8 s, power3.out. Ziffern mit gleicher Breite (tabular-nums), damit nichts springt.
 *
 * Das Server-HTML zeigt den Endwert (deutsches Zahlenformat, „10.753“, „0,9847“). Den Startwert setzt
 * erst der Effekt im Browser; bei reduzierter Bewegung und ohne JavaScript bleibt der Endwert stehen.
 * Der Zähler selbst ist für Screenreader unwichtig, die Aussage steht im umgebenden Text:
 * Aufrufer setzen ihn deshalb in ein `aria-hidden`-Element und geben den Endwert zusätzlich als
 * `sr-only`-Text aus.
 */
type ZaehlerProps = {
    von: number;
    bis: number;
    /** Dauer in Sekunden. */
    dauer?: number;
    /** Wartezeit nach dem Auslösen in Sekunden. */
    verzoegerung?: number;
    /** Nachkommastellen (Vorgabe 0). */
    nachkomma?: number;
    /** ScrollTrigger-Start (Vorgabe „top 85%“). */
    start?: string;
    className?: string;
};

export function Zaehler({
    von,
    bis,
    dauer = 1.8,
    verzoegerung = 0,
    nachkomma = 0,
    start = 'top 85%',
    className,
}: ZaehlerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const format = (n: number) =>
        n.toLocaleString('de-DE', { minimumFractionDigits: nachkomma, maximumFractionDigits: nachkomma });

    useIsoLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        registerGsap();

        const fmt = (n: number) =>
            n.toLocaleString('de-DE', { minimumFractionDigits: nachkomma, maximumFractionDigits: nachkomma });

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const stand = { wert: von };
            const zeige = () => {
                el.textContent = fmt(stand.wert);
            };
            zeige();
            gsap.to(stand, {
                wert: bis,
                duration: dauer,
                delay: verzoegerung,
                ease: 'power3.out',
                onUpdate: zeige,
                onComplete: zeige,
                scrollTrigger: { trigger: el, start, once: true },
            });
            return () => {
                el.textContent = fmt(bis);
            };
        });

        return () => mm.revert();
    }, [von, bis, dauer, verzoegerung, nachkomma, start]);

    return (
        <span ref={ref} className={cn('tabular-nums', className)}>
            {format(bis)}
        </span>
    );
}

export default Zaehler;
