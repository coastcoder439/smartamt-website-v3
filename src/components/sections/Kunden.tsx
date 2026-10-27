'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/Label';
import { EINZELNES } from '@/lib/abschnitte';
import { KUNDEN_LOGOS, KUNDEN_LOGOS_SPUR_2, type KundenLogo } from '@/components/sections/c1/kunden-logos';
import styles from '@/components/sections/c1/Kunden.module.css';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Kunden (id kunden), direkt unter dem Hero: Referenzen der NX7.AGENCY als ruhiges, endloses Logo-Laufband
 * (Muster: Leons `ui/tech-banner.tsx` mit zwei gegenläufigen Spuren, hier ohne framer-motion als reine
 * CSS-Animation, siehe c1/Kunden.module.css). Der Satz „Projekte für Kommunen, Institutionen und Unternehmen“
 * ist die echte Zwischenüberschrift (h2) und trägt die Hierarchie. Kopf mittig: das Label steht zwischen zwei
 * feinen Linien (wie „Womit ich baue“ bei Leon), darunter der Satz; so bleibt die rechte Hälfte nicht leer.
 * Seitliche Ausblendmasken, Hover und Tastaturfokus pausieren beide Spuren, das Logo unter der Maus tritt
 * hervor (volle Tinte, 1,04-fach). Außerhalb des Bildes stehen die Spuren still, bei reduzierter Bewegung
 * stehen die Logos ruhig und umbrechend da.
 *
 * Bewegung (GSAP): Linien, Label und Satz steigen beim Hineinscrollen sanft auf, die Spuren blenden ein. Nur
 * transform und opacity. Das Server-HTML zeigt den Endzustand; die Startzustände setzt erst der Effekt.
 * Ohne JavaScript läuft das Band trotzdem (CSS), jeder Name ist als Alt-Text lesbar.
 *
 * Doppelte Gruppe fürs Endlosband: die zweite ist `aria-hidden` und trägt leere Alt-Texte, damit
 * Screenreader jedes Logo nur einmal vorlesen. Die zweite Spur ist ganz `aria-hidden` (gleiche Logos).
 *
 * Ankersprung: Der Abschnitt hält beim Hineinspringen Abstand zur Kopfzeile, damit die orange Schlusslinie des
 * Hero darüber sichtbar bleibt (nicht direkt unter der Navigation klebt).
 */

function Gruppe({ logos, beschriftet }: { logos: readonly KundenLogo[]; beschriftet: boolean }) {
    return (
        <ul
            className={styles.gruppe}
            {...(beschriftet ? { 'aria-label': 'Referenzen der NX7.AGENCY' } : { 'aria-hidden': true as const })}
        >
            {logos.map((logo) => (
                <li
                    key={logo.datei}
                    className={styles.logo}
                    style={{ '--h': `${logo.anzeige / 16}rem`, '--o': logo.deckkraft ?? 0.7 } as React.CSSProperties}
                >
                    <Image
                        src={`/images/kunden/${logo.datei}`}
                        alt={beschriftet ? logo.name : ''}
                        width={logo.breite}
                        height={logo.hoehe}
                        className={styles.bild}
                        loading="eager"
                        fetchPriority="low"
                    />
                </li>
            ))}
        </ul>
    );
}

export default function Kunden() {
    const wurzel = useRef<HTMLElement>(null);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el) return;
        registerGsap();

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const kopf = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-kunden-kopf]'));
            const baender = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-kunden-band]'));
            const spuren = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-kunden-spur]'));
            const linien = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-kunden-linie]'));

            gsap.set(kopf, { opacity: 0, y: 14 });
            gsap.set(baender, { opacity: 0 });
            // Die Linien wachsen vom Label nach außen: links von rechts nach links, rechts umgekehrt
            for (const l of linien) gsap.set(l, { scaleX: 0, transformOrigin: l.dataset.seite === 'l' ? 'right center' : 'left center' });

            const tl = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
            });
            tl.to(kopf, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, clearProps: 'transform,opacity' }, 0);
            if (linien.length) tl.to(linien, { scaleX: 1, duration: 1.1, ease: 'power2.out', clearProps: 'transform' }, 0.05);
            tl.to(baender, { opacity: 1, duration: 1.2, stagger: 0.12, clearProps: 'opacity' }, 0.25);

            const ausloeser = ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => tl.play() });

            // Außerhalb des Bildes pausieren die Spuren (spart Rechenzeit, keine Dauerschleife im Leerlauf).
            let beobachter: IntersectionObserver | null = null;
            if (spuren.length && typeof IntersectionObserver !== 'undefined') {
                beobachter = new IntersectionObserver(
                    ([eintrag]) => {
                        for (const spur of spuren) {
                            if (eintrag.isIntersecting) delete spur.dataset.lauf;
                            else spur.dataset.lauf = 'aus';
                        }
                    },
                    { rootMargin: '120px' },
                );
                beobachter.observe(el);
            }

            return () => {
                ausloeser.kill();
                tl.kill();
                beobachter?.disconnect();
                for (const spur of spuren) delete spur.dataset.lauf;
            };
        });

        return () => mm.revert();
    }, []);

    return (
        <section
            ref={wurzel}
            id="kunden"
            aria-labelledby="kunden-satz"
            className="relative scroll-mt-[calc(var(--header-h)+56px)] pb-8 pt-12 md:pb-8 md:pt-14"
        >
            <div className="wrap">
                <div data-kunden-kopf className="flex items-center gap-4 md:gap-6">
                    <span
                        aria-hidden="true"
                        data-kunden-linie
                        data-seite="l"
                        className="block h-px flex-1 bg-gradient-to-r from-transparent to-line-2"
                    />
                    <Label className="text-center">Referenzen der NX7.AGENCY</Label>
                    <span
                        aria-hidden="true"
                        data-kunden-linie
                        data-seite="r"
                        className="block h-px flex-1 bg-gradient-to-l from-transparent to-line-2"
                    />
                </div>
                <h2
                    id="kunden-satz"
                    data-kunden-kopf
                    className="mx-auto mt-5 max-w-[26ch] text-balance text-center text-[clamp(1.5rem,1rem+1.6vw,2.25rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink md:max-w-[34ch]"
                >
                    Projekte für Kommunen, Institutionen und Unternehmen
                </h2>

                {/* Die Bänder bleiben im Container (gleiche Kanten wie die Abschnitte darüber und darunter); die Ausblendmasken sitzen an den Containerkanten. */}
                <div className={`${styles.baender} mt-8 md:mt-10`}>
                    <div data-kunden-band className={styles.band}>
                        <div data-kunden-spur className={styles.spur}>
                            <Gruppe logos={KUNDEN_LOGOS} beschriftet />
                            <Gruppe logos={KUNDEN_LOGOS} beschriftet={false} />
                        </div>
                    </div>

                    {/* Zweite, gegenläufige Spur: gleiche Logos in anderer Reihenfolge, reine Dekoration. v3: ausgeblendet
                        (EINZELNES.kundenZweiteSpur), ein Logo-Band genügt (Plan 03-website-v3, Punkt 1e). */}
                    {EINZELNES.kundenZweiteSpur ? (
                        <div data-kunden-band aria-hidden="true" className={`${styles.band} ${styles.rueckwaerts} ${styles.zweite}`}>
                            <div data-kunden-spur className={styles.spur}>
                                <Gruppe logos={KUNDEN_LOGOS_SPUR_2} beschriftet={false} />
                                <Gruppe logos={KUNDEN_LOGOS_SPUR_2} beschriftet={false} />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
