'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Check, ChevronsLeftRight, Info } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';
import { getLenis } from '@/lib/scroll';
import BefundKarten from './BefundKarten';
import { AUSSAGE_PFLICHT, BEFUNDE, HINWEIS_DEMO } from './befunde-daten';
import { NachherSeite, VorherSeite } from './MusterbachSeiten';
import s from './Vergleich.module.css';

/**
 * Vorher/Nachher-Ansicht „Musterbach“ samt Befunden (Abschnitt Websites), das zweite große Bewegungsbild.
 *
 * Website v2, Nachtrag 2 (Owner 26.10.2026: „Die Befunde, das ist falsch, das ist nicht so wie bei Tobi … Das ist mit dem
 * Scroll verbunden, aber kein Mensch, es kann gar keiner sehen, weil es in der nächsten Sektion sitzt“; „dieses
 * Vorher-Nachher-Ding, das könnte auch mal ein bisschen größer noch“). Aufbau wie bei Tobi (nur Aufbau und Verhalten, nicht
 * sein Stil): oben die gezeichnete Seite mit dem Regler, in ihrem unteren Rand die Leiste „Vorher | 6 von 6 Befunden offen |
 * Nachher“, direkt darunter die sechs Befund-Karten (drei Spalten, zwei Zeilen). Wisch UND Karten stehen im selben angehefteten
 * Bild: Man sieht beim Scrollen beides zugleich. Es gibt keine Browser-Leiste und keine Kästchen um die Seite.
 *
 * Zwei Zustände, beide aus demselben Markup (das Styling steht in Vergleich.module.css):
 *
 *  1. Standard (Server-HTML, ohne JavaScript, reduzierte Bewegung, Handy, Tablet, kleine Fenster): Die Seiten stehen
 *     untereinander, ab 1024 px nebeneinander; darunter die Leiste und die Karten. Ohne JavaScript und bei reduzierter Bewegung
 *     steht der Endzustand („0 von 6“, alle Karten erfüllt). Mit JavaScript kippt jede Karte, wenn sie beim Scrollen 72 % der
 *     Bildschirmhöhe erreicht (Zähler folgt).
 *  2. Angeheftet (ab 1200 × 800 px, bewegungsfreundlich): Der Bereich wird angeheftet (pin) und läuft etwa 180 vh. Der
 *     Regler fährt mit dem Scroll (scrub) von rechts („Vorher“) nach links; rechts von der Linie ist schon „Nachher“ zu sehen. Das
 *     geschieht nur mit transform (kein clip-path, kein left, kein Paint je Frame): „Nachher“ steckt in einem Rahmen mit
 *     overflow:hidden (data-frei), der von rechts hereinfährt (x +Breite → 0); der Inhalt darin fährt gegenläufig
 *     (x −Breite → 0) und steht dadurch still. Der Regler fährt mit x von der Breite auf 0. Alle Tweens laufen mit gleicher Dauer
 *     und Ease in einer Zeitleiste.
 *     Zähler und Karten folgen der Position der Linie mit denselben Schwellen wie bei Tobi (88, 76, 63, 50, 37, 24 % der Breite
 *     von links): Eine Karte ist erfüllt, wenn die Linie links von ihrer Schwelle steht; bei 0 offenen wird der Zähler grün.
 *     Der Griff ist ziehbar (Pointer Capture) und per Pfeiltasten, Pos1 und Ende bedienbar (role="slider", aria-valuenow).
 *     Er setzt dabei nur die Scroll-Position; die Zeitleiste bleibt die einzige Wahrheit (Scroll → Zeitleiste → Linie, Zähler).
 *
 * Die Startzustände setzt erst dieser Effekt (data-pinned, x der drei Teile, Zähler 6). Scheitert er, bleibt Zustand 1 stehen.
 */

/**
 * Scrollweg des angehefteten Bereichs in Bildschirmhöhen. v2: 1,8 (etwa 180 vh). v3: 0,65, damit die Startseite bei 1440 × 900
 * höchstens 8 Bildschirme lang ist (Plan 03-website-v3, Punkt 1); der Regler fährt dieselbe Strecke, nur schneller.
 */
const SCROLLWEG_VH = 0.65;
/** Zeitleiste: Beginn und Dauer der Reglerfahrt und Gesamtlänge (kurze Ruhe davor und danach). */
const T0 = 0.1;
const DAUER = 1;
const GESAMT = 1.2;
/** Schwellen wie bei Tobi in % der Breite von links; eine Karte ist erfüllt, wenn die Linie links davon steht. */
const SCHWELLEN = [88, 76, 63, 50, 37, 24];
const ANZAHL = BEFUNDE.length;

const klemme = (zahl: number) => Math.min(1, Math.max(0, zahl));

type Steuerung = {
    /** Linienposition als Anteil der Breite von links (1 = ganz rechts = Vorher, 0 = ganz links = Nachher), aus der Scroll-Position. */
    anteil: () => number;
    /** Scrollt so, dass die Linie bei diesem Anteil steht. */
    setze: (anteil: number) => void;
    /** Hilfsgröße: Breite und linker Rand der Fläche in Pixeln. */
    lage: () => { links: number; breite: number } | null;
};

function scrolleZu(y: number) {
    const lenis = getLenis() as { scrollTo?: (ziel: number, opt?: Record<string, unknown>) => void } | null;
    if (lenis && typeof lenis.scrollTo === 'function') lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
}

function Ebene({ art }: { art: 'vorher' | 'nachher' }) {
    const vorher = art === 'vorher';
    const nameId = `musterbach-${art}`;

    return (
        <div className={s.ebene} role="group" aria-labelledby={nameId}>
            <div className={s.innen}>
                <Label as="p" id={nameId} className={s.name}>
                    {vorher ? 'Vorher' : 'Nachher'}
                </Label>

                {/* Die gezeichnete Seite ist Bild, nicht Inhalt: Die Aussagen stehen in den Karten darunter. */}
                <div className={s.fenster} aria-hidden="true">
                    {vorher ? <VorherSeite /> : <NachherSeite />}
                </div>
                <p className="sr-only">
                    {vorher
                        ? 'Gezeichnete alte Gemeinde-Seite mit Laufschrift, Linkleiste und Besucherzähler.'
                        : 'Gezeichnete neue Gemeinde-Seite mit Hinweisleiste, Bild, Suchfeld und Kacheln.'}
                </p>
            </div>
        </div>
    );
}

export default function Vergleich() {
    const vergleichRef = useRef<HTMLDivElement>(null);
    const ebenenRef = useRef<HTMLDivElement>(null);
    const griffRef = useRef<HTMLButtonElement>(null);
    const steuerRef = useRef<Steuerung | null>(null);
    const ziehtRef = useRef(false);
    // Anzahl der erfüllten Karten. Start im Server-HTML: alle (Endzustand).
    const [erledigt, setErledigt] = useState(ANZAHL);

    useIsoLayoutEffect(() => {
        const vergleich = vergleichRef.current;
        const ebenen = ebenenRef.current;
        const griff = griffRef.current;
        if (!vergleich || !ebenen) return;
        registerGsap();

        const mm = gsap.matchMedia();

        // ---- Angeheftet: der Regler fährt mit dem Scroll, Zähler und Karten folgen ----
        mm.add('(min-width: 1200px) and (min-height: 800px) and (prefers-reduced-motion: no-preference)', () => {
            // Anordnung auf übereinanderliegende Ebenen umschalten, bevor gemessen wird.
            vergleich.setAttribute('data-pinned', 'true');
            setErledigt(0);

            // Höhe der festen Kopfzeile in Pixeln. --header-h steht in rem (Breitbild: wächst mit der Wurzelschrift), darum
            // wird sie an einem unsichtbaren Messkörper gelesen statt aus dem Text der Variable.
            const kopfHoehe = () => {
                const messer = document.createElement('div');
                messer.setAttribute('aria-hidden', 'true');
                messer.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0;height:var(--header-h)';
                document.body.appendChild(messer);
                const hoehe = messer.offsetHeight;
                messer.remove();
                return hoehe > 0 ? hoehe : 76;
            };

            const zeit = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: vergleich,
                    // Der Bereich heftet an, sobald er unter der festen Kopfzeile steht.
                    start: () => `top top+=${kopfHoehe()}`,
                    end: () => `+=${Math.round(window.innerHeight * SCROLLWEG_VH)}`,
                    pin: true,
                    scrub: 0.4,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            // Der Regler fährt von rechts nach links; „Nachher“ ist rechts von ihm. Nur transform (x in Pixeln aus der Breite
            // der Fläche; Funktionswerte werden bei jedem Refresh neu gemessen).
            const breite = () => ebenen.offsetWidth;
            const frei = ebenen.querySelector<HTMLElement>('[data-frei]');
            const freiInnen = ebenen.querySelector<HTMLElement>('[data-frei-innen]');
            const linie = vergleich.querySelector<HTMLElement>('[data-pruefung]');
            if (frei) zeit.fromTo(frei, { x: () => breite() }, { x: 0, duration: DAUER }, T0);
            if (freiInnen) zeit.fromTo(freiInnen, { x: () => -breite() }, { x: 0, duration: DAUER }, T0);
            if (linie) {
                zeit.fromTo(linie, { x: () => breite() }, { x: 0, duration: DAUER }, T0);
                // Die Linie blendet am Anfang und am Ende weich ein und aus (nur opacity), damit sie nicht am Rand klebt.
                zeit.fromTo(linie, { opacity: 0 }, { opacity: 1, duration: 0.06 }, T0);
                zeit.to(linie, { opacity: 0, duration: 0.06 }, T0 + DAUER - 0.06);
            }
            zeit.set({}, {}, GESAMT);

            // Zähler und Karten: Anteil der Breite, an dem die Linie gerade steht (aus der geglätteten Zeit der Zeitleiste)
            const abgleich = () => {
                const anteil = klemme(1 - (zeit.time() - T0) / DAUER);
                const fertig = SCHWELLEN.filter((schwelle) => anteil * 100 < schwelle).length;
                setErledigt(fertig);
                if (griff) {
                    const prozent = Math.round((1 - anteil) * 100);
                    griff.setAttribute('aria-valuenow', String(prozent));
                    griff.setAttribute('aria-valuetext', `Nachher zu ${prozent} Prozent, ${ANZAHL - fertig} von ${ANZAHL} Befunden offen`);
                }
            };
            zeit.eventCallback('onUpdate', abgleich);
            abgleich();

            // Steuerung für Ziehen und Tastatur: setzt nur die Scroll-Position, die Zeitleiste folgt
            const st = zeit.scrollTrigger;
            steuerRef.current = st
                ? {
                      anteil: () => klemme(1 - ((klemme((window.scrollY - st.start) / (st.end - st.start)) * GESAMT) - T0) / DAUER),
                      setze: (anteil) => {
                          const zeitpunkt = T0 + (1 - klemme(anteil)) * DAUER;
                          scrolleZu(st.start + (zeitpunkt / GESAMT) * (st.end - st.start));
                      },
                      lage: () => {
                          const r = ebenen.getBoundingClientRect();
                          return { links: r.left, breite: r.width };
                      },
                  }
                : null;

            return () => {
                steuerRef.current = null;
                vergleich.removeAttribute('data-pinned');
                setErledigt(ANZAHL);
            };
        });

        // ---- Nicht angeheftet (Handy, Tablet, kleine Fenster): jede Karte kippt, wenn sie 72 % der Fensterhöhe erreicht ----
        mm.add(
            [
                '(prefers-reduced-motion: no-preference) and (max-width: 1199px)',
                '(prefers-reduced-motion: no-preference) and (max-height: 799px)',
            ].join(', '),
            () => {
                const karten = gsap.utils.toArray<HTMLElement>(vergleich.querySelectorAll('[data-befund]'));
                const schalter: ScrollTrigger[] = [];

                // Erfüllt ist, was die Auslöselinie schon überschritten hat (robust beim Laden mitten auf der Seite und bei Sprüngen)
                const abgleich = () => setErledigt(schalter.filter((t) => t.scroll() >= t.start).length);

                for (const karte of karten) {
                    const innen = karte.querySelector<HTMLElement>('[data-befund-innen]');
                    if (innen) {
                        gsap.from(innen, {
                            y: 18,
                            opacity: 0,
                            duration: 0.7,
                            ease: 'power3.out',
                            clearProps: 'transform,opacity',
                            scrollTrigger: { trigger: karte, start: 'top 94%', once: true },
                        });
                    }
                    schalter.push(
                        ScrollTrigger.create({ trigger: karte, start: 'top 72%', onToggle: abgleich, onUpdate: abgleich, onRefresh: abgleich }),
                    );
                }
                abgleich();

                return () => {
                    setErledigt(ANZAHL);
                };
            },
        );

        return () => mm.revert();
    }, []);

    // ---- Griff: ziehen (Pointer Capture) und Tastatur ----
    const beiZiehen = (e: PointerEvent<HTMLButtonElement>) => {
        if (!ziehtRef.current) return;
        const lage = steuerRef.current?.lage();
        if (!lage || lage.breite <= 0) return;
        steuerRef.current?.setze((e.clientX - lage.links) / lage.breite);
    };
    const beiTaste = (e: KeyboardEvent<HTMLButtonElement>) => {
        const steuer = steuerRef.current;
        if (!steuer) return;
        const schritt = e.shiftKey ? 0.15 : 0.05;
        let ziel: number | null = null;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ziel = steuer.anteil() - schritt;
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') ziel = steuer.anteil() + schritt;
        else if (e.key === 'Home') ziel = 1;
        else if (e.key === 'End') ziel = 0;
        if (ziel === null) return;
        e.preventDefault();
        steuer.setze(ziel);
    };

    const offen = ANZAHL - erledigt;

    return (
        <div ref={vergleichRef} className={s.vergleich}>
            <div className={s.buehne} role="group" aria-labelledby="befunde-karten-titel">
                <h3 id="befunde-karten-titel" className="sr-only">
                    Befunde an der Beispielgemeinde Musterbach, vorher und nachher
                </h3>

                <div className={s.flaeche}>
                    <div ref={ebenenRef} className={s.ebenen}>
                        <Ebene art="vorher" />
                        {/* Rahmen für „Nachher“: standardmäßig unsichtbar im Layout (display: contents), angeheftet
                            ein Fenster mit overflow:hidden, das mit dem Regler von rechts hereinfährt. */}
                        <div className={s.frei} data-frei>
                            <div className={s.freiInnen} data-frei-innen>
                                <Ebene art="nachher" />
                            </div>
                        </div>
                    </div>

                    {/* Regler: Linie mit rundem Griff, nur angeheftet sichtbar. Der Griff ist ziehbar und per Tastatur bedienbar.
                        Er liegt außerhalb von .ebenen (dessen overflow-x: clip würde den Griff an den Rändern abschneiden). */}
                    <div className={s.spur}>
                        <div className={s.pruefung} data-pruefung>
                            <button
                                ref={griffRef}
                                type="button"
                                className={s.griff}
                                role="slider"
                                aria-label="Vorher und Nachher vergleichen"
                                aria-orientation="horizontal"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={100}
                                onPointerDown={(e) => {
                                    ziehtRef.current = true;
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                }}
                                onPointerMove={beiZiehen}
                                onPointerUp={(e) => {
                                    ziehtRef.current = false;
                                    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
                                }}
                                onPointerCancel={() => {
                                    ziehtRef.current = false;
                                }}
                                onKeyDown={beiTaste}
                            >
                                <ChevronsLeftRight aria-hidden="true" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    {/* Leiste im unteren Rand der Fläche: Vorher | n von 6 Befunden offen | Nachher */}
                    <div className={s.leiste} data-fertig={offen === 0 ? 'true' : undefined}>
                        <span className={`${s.leisteSeite} ${s.leisteVorher}`} aria-hidden="true">
                            <i className={s.leistePunkt} />
                            Vorher
                        </span>
                        <p className={s.zaehler}>
                            {/* Der Zähler läuft nur fürs Auge; Hilfstechnik liest den Endzustand */}
                            <span aria-hidden="true" className={s.zaehlerSicht}>
                                <span key={offen} className={s.zahl}>
                                    {offen}
                                </span>
                                <span className={s.zaehlerText}>von {ANZAHL} Befunden offen</span>
                            </span>
                            <span className="sr-only">0 von {ANZAHL} Befunden offen</span>
                        </p>
                        <span className={`${s.leisteSeite} ${s.leisteNachher}`} aria-hidden="true">
                            Nachher
                            <Check strokeWidth={2.5} />
                        </span>
                    </div>
                </div>

                <BefundKarten erledigt={erledigt} />

                <p id="musterbach-unterschrift" className={s.unterschrift}>
                    <Info aria-hidden="true" size={14} strokeWidth={2} className={s.unterschriftZeichen} />
                    <span>
                        {HINWEIS_DEMO}. {AUSSAGE_PFLICHT}
                    </span>
                </p>
            </div>
        </div>
    );
}
