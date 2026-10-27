'use client';

import { useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';
import { AUSSAGE_PFLICHT, BEFUNDE, HINWEIS_DEMO } from './befunde-daten';
import s from './Befunde.module.css';

/**
 * Befund-Liste unter dem Vorher/Nachher (Abschnitt Websites), Website v2, Nachtrag 1 (N4): sechs Zeilen mit Befund, Vorher
 * und Nachher und ein Zähler „6 von 6 Befunden offen“, der beim Scrollen auf „0 von 6“ springt.
 *
 * Bernstein heißt offen, Grün heißt erfüllt (der Zustand steht auch im Zeichen: Punkt oder Haken, nicht nur in der Farbe).
 * Jede Zeile schaltet in dem Moment von offen auf erfüllt, in dem ihre Oberkante 72 % der Bildschirmhöhe erreicht; der Zähler
 * und die dünne Linie in der Markenfarbe unter der Kopfzeile folgen. Wer zurückscrollt, sieht die Zeilen wieder offen: Der Zustand
 * folgt der Scroll-Position, nicht der Zeit. Die Zeilen fahren beim Hineinscrollen zusätzlich gestaffelt herein (Reveal).
 *
 * Das Server-HTML ist der Endzustand (alle sechs erfüllt, „0 von 6“): Ohne JavaScript und bei reduzierter Bewegung steht er da
 * und jede Zeile ist lesbar. Die Startzustände setzt erst der Effekt (ScrollTrigger). Die Zeile „Vorher“ ist im Endzustand
 * gedämpft, bleibt aber lesbar (Tinte-3, mindestens 4,5:1).
 *
 * Die Zahlen sind eine Demo und tragen den Hinweis HINWEIS_DEMO (befunde-daten.ts).
 */

const ANZAHL = BEFUNDE.length;

export default function Befunde() {
    const wurzel = useRef<HTMLDivElement>(null);
    // Anzahl der erfüllten Zeilen. Start im Server-HTML: alle (Endzustand).
    const [erledigt, setErledigt] = useState(ANZAHL);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!el) return;
        registerGsap();

        const zeilen = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-befund]'));

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const schalter: ScrollTrigger[] = [];

            // Erfüllt ist, was die Auslöselinie schon überschritten hat (robust beim Laden mitten auf der Seite)
            const abgleich = () => setErledigt(schalter.filter((t) => t.scroll() >= t.start).length);

            for (const zeile of zeilen) {
                // Reveal: der Inhalt der Zeile fährt herein (die Zeile selbst steht still, damit die Auslöselinie nicht wandert)
                const innen = zeile.querySelector<HTMLElement>('[data-befund-innen]');
                if (innen) {
                    gsap.from(innen, {
                        y: 22,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        clearProps: 'transform,opacity',
                        scrollTrigger: { trigger: zeile, start: 'top 94%', once: true },
                    });
                }
                // onUpdate zusätzlich zu onToggle: Ein Sprung von weit unten nach weit oben (Pos1, Anker, Scrollleiste) lässt die
                // Zeile nie „aktiv“ werden, ändert aber ihren Fortschritt; so springt der Zähler auch dann zurück.
                schalter.push(
                    ScrollTrigger.create({ trigger: zeile, start: 'top 72%', onToggle: abgleich, onUpdate: abgleich, onRefresh: abgleich }),
                );
            }
            abgleich();

            return () => {
                setErledigt(ANZAHL);
            };
        });

        return () => mm.revert();
    }, []);

    const offen = ANZAHL - erledigt;

    return (
        <div>
            <div ref={wurzel} className={`karte ${s.karte}`} role="group" aria-labelledby="befunde-titel">
                <div className={s.kopf}>
                    <h3 id="befunde-titel" className={s.titel}>
                        Befunde an der Beispielgemeinde
                    </h3>
                    <p className={s.zaehler} data-fertig={offen === 0 ? 'true' : undefined}>
                        {/* Der Zähler läuft nur fürs Auge; Hilfstechnik liest den Endzustand */}
                        <span aria-hidden="true" className={s.zaehlerSicht}>
                            <span key={offen} className={s.zahl}>
                                {offen}
                            </span>
                            <span className={s.zaehlerText}>
                                von {ANZAHL} Befunden offen
                            </span>
                        </span>
                        <span className="sr-only">0 von {ANZAHL} Befunden offen</span>
                    </p>
                </div>

                <div aria-hidden="true" className={s.spur}>
                    <span className={s.fuell} style={{ transform: `scaleX(${erledigt / ANZAHL})` }} />
                </div>

                <div aria-hidden="true" className={s.spaltenKopf}>
                    <span />
                    <span>Befund</span>
                    <span>Vorher</span>
                    <span>Nachher</span>
                </div>

                <ul role="list" className={s.liste}>
                    {BEFUNDE.map((b, i) => (
                        <li key={b.id} data-befund data-state={i < erledigt ? 'ok' : 'offen'} className={s.zeile}>
                            <div data-befund-innen className={s.zeileInnen}>
                                <span aria-hidden="true" className={s.status}>
                                    <span className={s.statusPunkt} />
                                    <svg viewBox="0 0 24 24" className={s.statusHaken} fill="none">
                                        <path
                                            d="M6.5 12.5l4 4 7.5-9"
                                            stroke="currentColor"
                                            strokeWidth="2.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            pathLength={1}
                                            strokeDasharray={1}
                                        />
                                    </svg>
                                </span>
                                <p className={s.befund}>{b.befund}</p>
                                <p className={s.vorher}>
                                    <span className={s.zellenLabel}>Vorher: </span>
                                    {b.vorher}
                                </p>
                                <p className={s.nachher}>
                                    <span className={s.zellenLabel}>Nachher: </span>
                                    {b.nachher}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>

                <p className={s.pflicht}>{AUSSAGE_PFLICHT}</p>
            </div>

            <p className={s.hinweis}>
                <Info aria-hidden="true" size={15} strokeWidth={2} className="flex-none text-ink-3" />
                {HINWEIS_DEMO}
            </p>
        </div>
    );
}
