'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';
import { registerLenis } from '@/lib/scroll';

/**
 * Weiches Scrollen, aber NUR am Zeigegerät (übernommen aus neubau-v4-text).
 *
 * WARUM Lenis am Finger gar nicht erst startet [gemessen 07.09.2026, 390×844,
 * Produktionsbau, CPU 6×]: Lenis hängt seine Horcher grundsätzlich mit `{ passive: false }`
 * ans Fenster (`wheel`, `touchstart`, `touchmove`, `touchend`). Ein nicht passiver
 * `touchmove`-Horcher nimmt dem Browser die Erlaubnis, den Scroll auf dem Kompositor-Faden
 * zu erledigen: Chrome muss vor jeder Bildbewegung den Hauptfaden fragen. Damit hängt das
 * Scrollen am Finger in derselben Warteschlange wie React und GSAP. Bezahlt wird dafür
 * nichts, denn ohne `syncTouch` steigt Lenis bei Touch aus, bevor es etwas abfängt. Am
 * Finger scrollt der Browser von sich aus weich. Lenis bringt dort also keinen Gewinn.
 *
 * Kopplung mit ScrollTrigger (Muster aus der Lenis-Anleitung für GSAP):
 *  - `autoRaf: false`: Lenis hat keine eigene Bildschleife, der GSAP-Ticker treibt sie an
 *    (`gsap.ticker.add(t => lenis.raf(t * 1000))`),
 *  - `lenis.on('scroll', ScrollTrigger.update)`: jeder Scroll geht an ScrollTrigger,
 *  - `gsap.ticker.lagSmoothing(0)`: GSAP überspringt nach einem Ruckler keine Zeit, sonst
 *    liefe Lenis dem Scroll hinterher.
 *
 * Bei `prefers-reduced-motion: reduce` läuft Lenis nicht (CI: kein weiches Scrollen bei
 * reduzierter Bewegung).
 *
 * Neu messen: Schrift und angeheftete Abschnitte verschieben das Layout. Darum misst
 * ScrollTrigger genau einmal neu, sobald Schriften geladen UND die Seite vollständig geladen
 * ist, und nach jedem Seitenwechsel.
 *
 * Kein `ReactLenis`-Wrapper: Der müsste je nach Gerät im Baum stehen oder fehlen, was die
 * Hydrierung bricht. Diese Fassung rendert IMMER nur `children` und entscheidet im Effekt.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const pfad = usePathname();
    const ersterLauf = useRef(true);

    useEffect(() => {
        registerGsap();

        const zeiger = window.matchMedia('(pointer: coarse)');
        const reduziert = window.matchMedia('(prefers-reduced-motion: reduce)');

        let lenis: Lenis | null = null;
        let takt: ((zeit: number) => void) | null = null;

        const starten = () => {
            if (lenis) return;
            const instanz = new Lenis({
                lerp: 0.1,
                smoothWheel: true,
                autoRaf: false,
            });
            takt = (zeit: number) => instanz.raf(zeit * 1000);
            instanz.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(takt);
            gsap.ticker.lagSmoothing(0);
            registerLenis(instanz);
            lenis = instanz;
        };

        const stoppen = () => {
            if (!lenis) return;
            if (takt) gsap.ticker.remove(takt);
            gsap.ticker.lagSmoothing(500, 33);
            registerLenis(null);
            lenis.destroy();
            lenis = null;
            takt = null;
        };

        const abgleichen = () => {
            if (zeiger.matches || reduziert.matches) stoppen();
            else starten();
        };

        abgleichen();
        zeiger.addEventListener('change', abgleichen);
        reduziert.addEventListener('change', abgleichen);

        // Einmal neu messen, wenn Schriften und Seite fertig sind.
        let aktiv = true;
        const schriften = document.fonts ? document.fonts.ready.then(() => undefined, () => undefined) : Promise.resolve();
        const geladen = new Promise<void>((fertig) => {
            if (document.readyState === 'complete') fertig();
            else window.addEventListener('load', () => fertig(), { once: true });
        });
        Promise.all([schriften, geladen]).then(() => {
            if (aktiv) ScrollTrigger.refresh();
        });

        return () => {
            aktiv = false;
            zeiger.removeEventListener('change', abgleichen);
            reduziert.removeEventListener('change', abgleichen);
            stoppen();
        };
    }, []);

    // Nach einem Seitenwechsel (zum Beispiel Startseite zu Impressum) neu messen; der erste Lauf
    // beim Laden der Seite übernimmt die Messung oben.
    useEffect(() => {
        if (ersterLauf.current) {
            ersterLauf.current = false;
            return;
        }
        const bild = window.requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => window.cancelAnimationFrame(bild);
    }, [pfad]);

    return <>{children}</>;
}
