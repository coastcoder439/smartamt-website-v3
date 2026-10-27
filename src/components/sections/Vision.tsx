'use client';

import { useRef } from 'react';
import { Label } from '@/components/ui/Label';
import { Leitlinie } from '@/components/ui/Leitlinie';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { bewegungReduziert, gsap, registerGsap, SplitText } from '@/lib/gsap';

/**
 * Unsere Mission (id vision), CI v3: hell. Oben stehen Label und die H2 über die volle Breite (ab 768 px in zwei
 * bewusst gesetzten Zeilen: „Gemeinde für Gemeinde / zur digitalen Verwaltung.“, weil jede Hälfte als Ganzes
 * zusammenbleibt; am Handy gleicht text-wrap: balance die Zeilen aus). Darunter läuft der große Absatz (24 bis 36 px) in den acht rechten Spalten; links daneben steht
 * als ruhige Randnotiz die Quellenzeile (ab 1024 px bleibt sie beim Scrollen stehen, am Handy folgt sie dem Absatz).
 * Beim Scrollen färben sich die Wörter nacheinander von blass (ink bei Deckkraft 0,25) zu Tinte (SplitText words,
 * scrub), wie ein Text, der beim Lesen „gefüllt“ wird. Daneben zeichnet sich eine orange Leitlinie entlang des
 * Absatzes (ab 768 px). Hinter dem Ganzen liegt ein gut sichtbares Punktraster als Bühne, das zu den Rändern hin
 * ausblendet (nie hart abgeschnitten). Kein Schild, keine Fläche.
 *
 * Das Server-HTML ist der Endzustand (volle Tinte): Ohne JavaScript und bei reduzierter Bewegung ist der
 * Absatz sofort ganz lesbar. Den blassen Startzustand setzt erst der Effekt (nur Deckkraft, scrub, ohne
 * Verzögerung); Aufräumen mit gsap.context().revert() und SplitText.revert(). SplitText hängt am Absatz
 * einen aria-label mit dem vollen Text, die Wörter sind für Hilfstechnik ausgeblendet.
 * Texte wörtlich aus website-copy-b2-b3.md.
 */

export default function Vision() {
    const absatz = useRef<HTMLParagraphElement>(null);

    useIsoLayoutEffect(() => {
        const el = absatz.current;
        if (!el || bewegungReduziert()) return;
        registerGsap();

        let teilung: SplitText | null = null;
        const ctx = gsap.context(() => {
            teilung = SplitText.create(el, { type: 'words', wordsClass: 'mission-wort' });
            gsap.fromTo(
                teilung.words,
                { opacity: 0.25 },
                {
                    opacity: 1,
                    ease: 'none',
                    stagger: 0.12,
                    scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: 0.5 },
                },
            );
        }, el);

        return () => {
            ctx.revert();
            teilung?.revert();
        };
    }, []);

    return (
        <section id="vision" aria-labelledby="vision-titel" className="section relative overflow-hidden">
            {/* Punktraster: sichtbare Bühne hinter Überschrift und Absatz, zu allen Rändern hin ausblendend */}
            <div
                aria-hidden="true"
                className="dot-grid pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,#c3c3c9_1.2px,transparent_0)] [mask-image:radial-gradient(ellipse_70%_65%_at_66%_58%,black,transparent_78%)]"
            />

            <div className="wrap relative">
                <Label>Unsere Mission</Label>
                <RevealHeading as="h2" id="vision-titel" className="mt-4 max-w-[11em] [text-wrap:balance] md:max-w-[14em]">
                    <span className="md:whitespace-nowrap">Gemeinde für Gemeinde</span>{' '}
                    <span className="md:whitespace-nowrap">zur digitalen Verwaltung.</span>
                </RevealHeading>

                <div className="grid-12 mt-12 gap-y-8 md:mt-16 lg:mt-20">
                    <div className="col-span-12 lg:col-span-10 lg:col-start-1 lg:row-start-1">
                        <div className="flex gap-6 md:gap-8">
                            <Leitlinie
                                staerke={2}
                                ausloeser={absatz}
                                start="top 82%"
                                ende="bottom 52%"
                                className="hidden w-[2px] flex-none self-stretch rounded-full bg-line text-brand md:block"
                            />
                            <p
                                ref={absatz}
                                className="max-w-[28em] text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] font-medium leading-[1.25] tracking-[-0.025em] text-ink [text-wrap:pretty]"
                            >
                                In Dänemark und Estland gehören digitale Behördengänge zum Alltag. Deutschland zieht nach: Seit
                                2024 verpflichtet das geänderte Onlinezugangsgesetz Bund und Länder, ihre Leistungen elektronisch
                                anzubieten, ohne Medienbruch und barrierefrei, bis hin zu den Gemeinden. Entscheidend ist, dass
                                das vor Ort ankommt, auf der Website jeder Gemeinde und bei den Menschen, die dort arbeiten.
                                Dafür gibt es SmartAmt.
                            </p>
                        </div>
                    </div>

                    {/* Randnotiz: Quellenzeile, am Anfang des Absatzes ausgerichtet */}
                    <div className="col-span-12 lg:col-span-10 lg:col-start-1 lg:row-start-2">
                        <div>
                            <RevealText className="max-w-[34ch] border-t border-line-2 pt-4 font-mono text-klein text-ink-3 md:ml-[calc(2px+2rem)]">
                                Quellen: UN E-Government Survey 2024; § 1a Onlinezugangsgesetz in der Fassung vom 19.07.2024.
                            </RevealText>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
