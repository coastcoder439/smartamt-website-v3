'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger, registerGsap } from '@/lib/gsap';
import { istAnliegen, waehleAnliegen, zerlegeHash } from '@/lib/kontakt';
import { scrollToId } from '@/lib/scroll';

/**
 * Setzt Anker aus der Adresse um, nachdem die Seite aufgebaut ist.
 *
 * Der Browser springt beim Laden von sich aus zu `#kontakt`, aber zu früh: Schrift und
 * angeheftete Abschnitte verschieben das Layout noch. Diese Komponente wartet, misst neu und
 * springt dann (ohne Animation) mit dem Abstand zur festen Kopfzeile.
 *
 * Außerdem versteht sie `#kontakt?anliegen=website`: Der Teil hinter dem Fragezeichen wird
 * gelesen und als Anliegen gemerkt (siehe lib/kontakt.ts). Gilt nur auf der Startseite.
 */
export default function HashSprung() {
    const pfad = usePathname();

    useEffect(() => {
        if (pfad !== '/') return;
        registerGsap();

        let abgebrochen = false;

        const umsetzen = (sofort: boolean) => {
            const { id, parameter } = zerlegeHash(window.location.hash);
            const anliegen = parameter.get('anliegen');
            if (istAnliegen(anliegen)) waehleAnliegen(anliegen);
            if (!id) return;
            ScrollTrigger.refresh();
            scrollToId(id, { sofort });
        };

        const spaeter = () => {
            if (abgebrochen) return;
            window.requestAnimationFrame(() => {
                if (!abgebrochen) umsetzen(true);
            });
        };

        if (document.fonts) document.fonts.ready.then(spaeter).catch(spaeter);
        else spaeter();

        const beiAenderung = () => umsetzen(false);
        window.addEventListener('hashchange', beiAenderung);

        return () => {
            abgebrochen = true;
            window.removeEventListener('hashchange', beiAenderung);
        };
    }, [pfad]);

    return null;
}
