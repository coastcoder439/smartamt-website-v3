'use client';

import { useRef, type RefObject } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { bewegungReduziert, gsap, registerGsap, SplitText } from '@/lib/gsap';

/**
 * Reveal-Helfer (docs/brand/brand-identity.md, „Bewegung“).
 *
 *  - Überschriften kommen zeilenweise per SplitText herein: Jede Zeile fährt aus einer
 *    Maske von unten nach oben (y 100 % → 0, 0,9 s, expo.out, Stagger 0,08).
 *  - Absätze werden nur eingeblendet (Deckkraft 0 → 1, 0,9 s, power3.out).
 *
 * Beides läuft einmalig und hängt nicht am Scroll: Der Start löst aus, sobald das Element
 * in den Bildschirm kommt (ScrollTrigger mit once), danach läuft die Animation für sich ab.
 * Mit `sofort` startet sie beim Laden der Seite (für Elemente im ersten Bild).
 *
 * Das Server-HTML zeigt den fertigen Text. Die Startzustände setzt erst der Effekt im
 * Browser; ohne JavaScript und bei reduzierter Bewegung bleibt der Text einfach stehen.
 */

type RevealOptionen = {
    /** Wartezeit in Sekunden. */
    verzoegerung?: number;
    /** Beim Laden starten statt beim Einscrollen. */
    sofort?: boolean;
};

const ZEILEN_KLASSE = 'reveal-line';

export function useHeadingReveal<T extends HTMLElement>(ref: RefObject<T | null>, optionen: RevealOptionen = {}) {
    const { verzoegerung = 0, sofort = false } = optionen;

    useIsoLayoutEffect(() => {
        const el = ref.current;
        if (!el || !el.textContent?.trim() || bewegungReduziert()) return;
        registerGsap();

        let teilung: SplitText | null = null;
        const ctx = gsap.context(() => {
            teilung = SplitText.create(el, {
                type: 'lines',
                mask: 'lines',
                linesClass: ZEILEN_KLASSE,
                autoSplit: true,
                // Wird die Zeilenaufteilung neu berechnet (Schrift geladen, Breite geändert),
                // ersetzt SplitText die Animation und setzt sie auf den alten Fortschritt.
                onSplit(self) {
                    return gsap.from(self.lines, {
                        yPercent: 100,
                        duration: 0.9,
                        ease: 'expo.out',
                        stagger: 0.08,
                        delay: verzoegerung,
                        scrollTrigger: sofort ? undefined : { trigger: el, start: 'top 88%', once: true },
                    });
                },
            });
        }, el);

        return () => {
            ctx.revert();
            teilung?.revert();
        };
    }, [ref, verzoegerung, sofort]);
}

export function useTextReveal<T extends HTMLElement>(ref: RefObject<T | null>, optionen: RevealOptionen = {}) {
    const { verzoegerung = 0, sofort = false } = optionen;

    useIsoLayoutEffect(() => {
        const el = ref.current;
        if (!el || bewegungReduziert()) return;
        registerGsap();

        const ctx = gsap.context(() => {
            gsap.fromTo(
                el,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.9,
                    ease: 'power3.out',
                    delay: verzoegerung,
                    scrollTrigger: sofort ? undefined : { trigger: el, start: 'top 90%', once: true },
                },
            );
        }, el);

        return () => ctx.revert();
    }, [ref, verzoegerung, sofort]);
}

type RevealHeadingProps = RevealOptionen & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
    id?: string;
    className?: string;
    children: React.ReactNode;
};

/** Überschrift (oder großer Aussagesatz mit as="p") mit zeilenweisem Einfahren. Der Inhalt darf nur Text und Zeilenumbrüche sein. */
export function RevealHeading({ as = 'h2', id, className, children, ...optionen }: RevealHeadingProps) {
    const ref = useRef<HTMLHeadingElement>(null);
    useHeadingReveal(ref, optionen);
    const Tag = as as React.ElementType;
    return (
        <Tag ref={ref} id={id} className={className}>
            {children}
        </Tag>
    );
}

type RevealTextProps = RevealOptionen & {
    as?: 'p' | 'div' | 'ul' | 'ol' | 'span';
    id?: string;
    className?: string;
    children: React.ReactNode;
};

/** Absatz, der nur eingeblendet wird. */
export function RevealText({ as = 'p', id, className, children, ...optionen }: RevealTextProps) {
    const ref = useRef<HTMLElement>(null);
    useTextReveal(ref, optionen);
    const Tag = as as React.ElementType;
    return (
        <Tag ref={ref} id={id} className={className}>
            {children}
        </Tag>
    );
}
