'use client';

import { useRef, type ReactNode } from 'react';
import { Check, Eye, FileCheck2, GraduationCap, Rocket, SearchCheck, type LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { EINZELNES } from '@/lib/abschnitte';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';
import WebsiteKnopf from './b2/WebsiteKnopf';
import { ABSCHNITT_WEISS, LABEL_GROSS } from './c2/abschnitt';
import { BriefBild } from './c2/BriefBild';

/**
 * Ablauf (id ablauf): vier Schritte als weiße Karten 01 bis 04, daneben die Scroll-Linie. Das ist eine
 * echte Abfolge, deshalb mit Nummern (CI: Nummern nur bei Abfolgen, die Linie nur bei Abläufen).
 *
 * Website v2 (Entscheidung 7): Prüfung (kostenlos) · Vorschau mit Ihren Inhalten (kostenlos) · Freigabe per E-Mail oder im
 * Gespräch, erst dann gibt es einen Vertrag · Live etwa zwei Wochen nach der Freigabe. Der frühere Schritt „Schulung“ bleibt
 * mit Schalter im Code (`EINZELNES.ablaufSchrittSchulung`, lib/abschnitte.ts) und steht dann als letzter Schritt wieder da.
 * Die Zahl der Schritte (Zähler, Ring, Endzustand im Server-HTML) folgt der Liste.
 *
 * Aufbau: Links bleibt eine Spalte beim Scrollen stehen (Überschrift, Satz, Knopf, darunter der
 * Fortschrittszähler; ab 1024 px, per CSS sticky). Rechts stehen die Karten; in der Rinne links davon
 * sitzt je Schritt ein Nummernkreis, und zwischen zwei Kreisen verbindet ein senkrechtes Stück die Karten:
 * eine feine graue Spur mit der orangen Linie darüber. Jedes Stück gehört zu seinem Schritt (Mitte des
 * Kreises bis Mitte des nächsten Kreises).
 *
 * Bewegung (Vorbild: Leons AnsatzScroll, dort horizontal; hier senkrecht):
 *  - Die orange Linie zeichnet sich mit dem Scroll (scrub, scaleY von oben). Ihre Spitze liegt immer auf
 *    einer gedachten Linie bei 60 % der Fensterhöhe: Jedes Stück läuft von 0 auf 1, während sein Anfang
 *    (Kreis) und sein Ende (nächster Kreis) diese Linie überqueren.
 *  - Erreicht die Spitze einen Kreis, wird der Schritt aktiv (data-aktiv): Der Kreis füllt sich orange
 *    (Tinte auf Orange; die Füllung blüht von innen auf, scale 0,5 → 1 und opacity), die Karte hellt von ruhigem Grau auf Weiß auf. Der Text bleibt immer in voller
 *    Deckkraft (ruhig lesbar, Kontrast 8:1); nur Fläche der Karte und Symbol sind vorher gedämpft.
 *    Rückwärts scrollen nimmt die Aktivierung wieder zurück.
 *  - An der Spitze der Linie läuft ein Kopfpunkt mit einem Ring mit; er taucht hinter dem nächsten Kreis ab.
 *  - Der Fortschrittszähler in der stehenden Spalte (nur Zahlen: große Ziffer „03“ mit „/ 04“) hängt an der
 *    aktiven Karte: Die Ziffer rollt (y, 0,7 s), der orange Ring zeichnet sich mit dem Scroll (stroke-dashoffset,
 *    ein Schritt-Anteil je Schritt, kontinuierlich dazwischen). Er ist Zierde (aria-hidden), die Nummern der Karten
 *    tragen die Aussage.
 *  - Die Karten selbst schweben leicht herein (y 28 px → 0), nur transform.
 *  - Neben dem Zähler steht das Bild „Vom Brief zur neuen Website“ (c2/BriefBild.tsx): zuerst nur der Brief, ab
 *    Schritt 2 („Vorschau“) schwebt die neue Website darüber. Es hängt an derselben aktiven Karte (data-stufe).
 *  - Nur transform und opacity (Linien: scaleY und stroke-dashoffset).
 *
 * Ohne JavaScript und bei reduzierter Bewegung steht die Linie fertig gezeichnet da, alle Schritte sind
 * aktiv und der Zähler zeigt die letzte Nummer mit vollem Ring, das Bild zeigt Brief und Website: Das Server-HTML ist der
 * Endzustand, die Attribute setzt erst der Effekt.
 */

const ALLE_SCHRITTE: readonly { titel: string; text: ReactNode; Icon: LucideIcon; kostenlos?: true; nurSchulung?: true }[] = [
    {
        titel: 'Prüfung',
        text: 'Wir prüfen Ihre bestehende Website und fassen die Befunde verständlich zusammen.',
        Icon: SearchCheck,
        kostenlos: true,
    },
    {
        titel: 'Vorschau mit Ihren Inhalten',
        text: 'Sie sehen vorab, wie Ihre neue Website mit Ihren eigenen Inhalten aussieht, ohne die Befunde der alten.',
        Icon: Eye,
        kostenlos: true,
    },
    {
        titel: 'Freigabe',
        text: (
            <>
                Gefällt Ihnen die Vorschau, geben Sie sie per <span className="whitespace-nowrap">E-Mail</span> oder im Gespräch frei. Erst dann gibt es
                einen Vertrag.
            </>
        ),
        Icon: FileCheck2,
    },
    {
        titel: 'Live',
        text: 'Etwa zwei Wochen nach der Freigabe ist Ihre Website live. Danach kümmern wir uns um Technik und Updates.',
        Icon: Rocket,
    },
    // ausgeblendet in v2, nicht gelöscht
    {
        titel: 'Schulung',
        text: 'Auf Wunsch schulen wir Ihr Team, im Umgang mit der Website und mit KI im Arbeitsalltag.',
        Icon: GraduationCap,
        nurSchulung: true,
    },
];

export const SCHRITTE = ALLE_SCHRITTE.filter((schritt) => !schritt.nurSchulung || EINZELNES.ablaufSchrittSchulung);

/** Lage der gedachten Linie im Fenster, auf der die Spitze der orangen Linie läuft (60 % der Höhe). */
const LINIE = 0.6;

const GESAMT = SCHRITTE.length;
const GESAMT_TEXT = String(GESAMT).padStart(2, '0');
/** Ziffern, die im Zähler untereinander stehen (1 bis GESAMT); die Zehnerstelle „0“ steht fest davor. */
const ZIFFERN = Array.from({ length: GESAMT }, (_, i) => i + 1);

/** Endzustand der Ziffernspalte im Server-HTML: auf die letzte Ziffer gestellt (−(GESAMT − 1) em), als feste Klasse. */
const ZIFFERN_ENDE: Record<number, string> = {
    1: '[transform:translateY(0em)]',
    2: '[transform:translateY(-1em)]',
    3: '[transform:translateY(-2em)]',
    4: '[transform:translateY(-3em)]',
    5: '[transform:translateY(-4em)]',
};

const begrenze = (zahl: number, min: number, max: number) => Math.min(max, Math.max(min, zahl));

export default function Ablauf() {
    const listeRef = useRef<HTMLOListElement>(null);
    const zaehlerRef = useRef<HTMLDivElement>(null);
    const bildRef = useRef<HTMLDivElement>(null);

    useIsoLayoutEffect(() => {
        const liste = listeRef.current;
        if (!liste) return;
        const zaehler = zaehlerRef.current;
        const bild = bildRef.current;
        registerGsap();

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const schritte = Array.from(liste.querySelectorAll<HTMLElement>('[data-schritt]'));
            const kreise = schritte.map((li) => li.querySelector<HTMLElement>('[data-kreis]'));

            // Die orange Linie je Stück: scaleY 0 → 1 von oben, gekoppelt an den Scroll. Ein kleiner Kopfpunkt
            // läuft an ihrer Spitze mit (wie am Fuß des Hero) und verschwindet hinter dem nächsten Kreis.
            for (const stueck of liste.querySelectorAll<HTMLElement>('[data-stueck]')) {
                const fuell = stueck.querySelector<HTMLElement>('[data-fuell]');
                const kopf = stueck.querySelector<HTMLElement>('[data-kopf]');
                if (!fuell) continue;
                const spur = {
                    trigger: stueck,
                    start: `top ${LINIE * 100}%`,
                    end: `bottom ${LINIE * 100}%`,
                    scrub: 0.2,
                };
                gsap.fromTo(
                    fuell,
                    { scaleY: 0 },
                    { scaleY: 1, ease: 'none', transformOrigin: '50% 0%', scrollTrigger: spur },
                );
                if (kopf) {
                    gsap.fromTo(
                        kopf,
                        { y: 0 },
                        {
                            y: () => stueck.offsetHeight,
                            ease: 'none',
                            scrollTrigger: { ...spur, invalidateOnRefresh: true },
                        },
                    );
                }
            }

            // Fortschrittszähler: Ziffer rollt (y), Ring zeichnet sich (stroke-dashoffset, per quickTo weich).
            const ring = zaehler?.querySelector<SVGCircleElement>('[data-ring]') ?? null;
            const ziffern = zaehler?.querySelector<HTMLElement>('[data-ziffern]') ?? null;
            // Gemessen: quickTo direkt am Kreis ließ strokeDashoffset bei 0 stehen. Darum läuft der Wert über ein
            // Hilfsobjekt und wird selbst als Stil gesetzt (pathLength = 1: 0 = voller Ring, 1 = leer).
            const stand = { versatz: 0 };
            const ringZiel = ring
                ? gsap.quickTo(stand, 'versatz', {
                      duration: 0.5,
                      ease: 'power3.out',
                      onUpdate: () => {
                          ring.style.strokeDashoffset = stand.versatz.toFixed(4);
                      },
                  })
                : null;
            let angezeigt = GESAMT;
            const zeigeZiffer = (n: number) => {
                if (!ziffern || n === angezeigt) return;
                angezeigt = n;
                const hoehe = ziffern.firstElementChild instanceof HTMLElement ? ziffern.firstElementChild.offsetHeight : 0;
                gsap.to(ziffern, { y: -(n - 1) * hoehe, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
            };

            // Aktiv ist ein Schritt, sobald die Mitte seines Kreises über der gedachten Linie liegt.
            const mitte = (el: HTMLElement) => {
                const box = el.getBoundingClientRect();
                return box.top + box.height / 2;
            };
            const aktualisieren = () => {
                const grenze = window.innerHeight * LINIE;
                let aktive = 0;
                schritte.forEach((li, i) => {
                    const kreis = kreise[i];
                    if (!kreis) return;
                    const aktiv = mitte(kreis) <= grenze;
                    if (aktiv) aktive += 1;
                    const wert = aktiv ? 'true' : 'false';
                    if (li.dataset.aktiv !== wert) li.dataset.aktiv = wert;
                });

                // Zähler: Ring von 0 auf voll; Schritt 1 = ein Anteil, letzter Schritt = voll, dazwischen stetig.
                const erster = kreise[0];
                const letzter = kreise[kreise.length - 1];
                if (ringZiel && erster && letzter) {
                    const weg = mitte(letzter) - mitte(erster);
                    const fortschritt = weg > 0 ? begrenze((grenze - mitte(erster)) / weg, 0, 1) : 1;
                    const anteil = aktive === 0 ? 0 : 1 / GESAMT + (1 - 1 / GESAMT) * fortschritt;
                    ringZiel(1 - anteil);
                }
                zeigeZiffer(Math.max(1, aktive));

                // Bild „Brief → Website“: Stufe = aktive Karte (1 bis GESAMT); das CSS blendet die Website ab Stufe 2 ein
                if (bild) {
                    const stufe = String(Math.max(1, aktive));
                    if (bild.dataset.stufe !== stufe) bild.dataset.stufe = stufe;
                }
            };
            aktualisieren();
            const spur = ScrollTrigger.create({
                trigger: liste,
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: aktualisieren,
                onRefresh: aktualisieren,
            });

            // Karten schweben leicht herein (nur transform), je Karte beim Eintritt in den Bildschirm.
            for (const karte of liste.querySelectorAll<HTMLElement>('[data-karte]')) {
                gsap.from(karte, {
                    y: 28,
                    duration: 0.9,
                    ease: 'power3.out',
                    clearProps: 'transform',
                    scrollTrigger: { trigger: karte, start: 'top 92%', once: true },
                });
            }

            return () => {
                spur.kill();
                for (const li of schritte) li.removeAttribute('data-aktiv');
                bild?.removeAttribute('data-stufe');
                // Zähler zurück auf den Endzustand des Server-HTML (Klasse und Attribut gelten wieder)
                if (ziffern) {
                    gsap.killTweensOf(ziffern);
                    gsap.set(ziffern, { clearProps: 'transform' });
                }
                if (ring) {
                    gsap.killTweensOf(stand);
                    ring.style.removeProperty('stroke-dashoffset');
                }
            };
        });

        return () => mm.revert();
    }, []);

    return (
        <section id="ablauf" aria-labelledby="ablauf-titel" className={ABSCHNITT_WEISS}>
            <div className="wrap grid-12 items-start gap-y-12">
                {/* Linke Spalte: bleibt ab 1024 px beim Scrollen stehen */}
                <div className="col-span-12 lg:sticky lg:top-[calc(var(--header-h)+3.5rem)] lg:col-span-5">
                    <Label className={LABEL_GROSS}>Ablauf</Label>
                    <RevealHeading as="h2" id="ablauf-titel" className="mt-4">
                        Vom Brief zur neuen Website.
                    </RevealHeading>
                    <RevealText className="mt-6 max-w-[24em] text-lead text-ink">
                        Prüfung und Vorschau sind kostenlos.
                    </RevealText>
                    <div className="mt-8">
                        <WebsiteKnopf />
                    </div>

                    {/* Fortschrittszähler (nur Zahlen, Zierde) und Bild „Brief → Website“: hängen an der aktiven Karte.
                        Endzustand im Server-HTML: „04 / 04“ mit vollem Ring, Brief und Website zusammen. Die
                        Ziffernspalte ist per Klasse auf die letzte Ziffer gestellt (ZIFFERN_ENDE, −(GESAMT − 1) em); der Effekt
                        rollt sie per y und räumt danach wieder auf. */}
                    <div ref={bildRef} className="group/bild mt-12 hidden items-end gap-7 lg:flex">
                        <div
                            ref={zaehlerRef}
                            aria-hidden="true"
                            className="relative size-[9.25rem] flex-none"
                        >
                            <svg viewBox="0 0 148 148" focusable="false" className="absolute inset-0 size-full -rotate-90">
                                <circle cx="74" cy="74" r="69" fill="none" strokeWidth="2" className="stroke-line" />
                                <circle
                                    data-ring
                                    cx="74"
                                    cy="74"
                                    r="69"
                                    fill="none"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    pathLength={1}
                                    strokeDasharray="1 1"
                                    strokeDashoffset={0}
                                    className="stroke-brand"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="flex text-[3.5rem] font-bold leading-none tracking-[-0.05em] text-ink tabular-nums">
                                    <span className="block h-[1em]">0</span>
                                    <span className="block h-[1em] overflow-hidden">
                                        <span data-ziffern className={`block ${ZIFFERN_ENDE[GESAMT]}`}>
                                            {ZIFFERN.map((ziffer) => (
                                                <span key={ziffer} className="block h-[1em]">
                                                    {ziffer}
                                                </span>
                                            ))}
                                        </span>
                                    </span>
                                </div>
                                <span className="mt-2 font-mono text-[0.8125rem] tracking-[0.14em] text-ink-3">
                                    / {GESAMT_TEXT}
                                </span>
                            </div>
                        </div>
                        <BriefBild />
                    </div>
                </div>

                {/* Rechte Spalte: die Schritt-Karten und die Scroll-Linie */}
                <ol
                    ref={listeRef}
                    role="list"
                    className="col-span-12 space-y-5 pl-[3.75rem] md:pl-[4.5rem] lg:col-span-6 lg:col-start-7"
                >
                    {SCHRITTE.map(({ titel, text, Icon, kostenlos }, i) => {
                        const nummer = String(i + 1).padStart(2, '0');
                        const letzter = i === SCHRITTE.length - 1;
                        return (
                            <li
                                key={titel}
                                data-schritt
                                className="group/schritt relative [--c:2.5rem] [--gx:3.75rem] [--t:1.375rem] md:[--c:2.75rem] md:[--gx:4.5rem] md:[--t:1.625rem]"
                            >
                                {/* Stück der Linie: von der Mitte dieses Kreises bis zur Mitte des nächsten */}
                                {letzter ? null : (
                                    <span
                                        aria-hidden="true"
                                        data-stueck
                                        className="pointer-events-none absolute z-0 w-[2px] rounded-full"
                                        style={{
                                            left: 'calc(var(--gx) * -1 + var(--c) / 2 - 1px)',
                                            top: 'calc(var(--t) + var(--c) / 2)',
                                            height: 'calc(100% + 1.25rem)',
                                        }}
                                    >
                                        <span className="absolute inset-0 rounded-full bg-line-2" />
                                        <span data-fuell className="absolute inset-0 origin-top rounded-full bg-brand" />
                                        <span
                                            data-kopf
                                            className="absolute left-1/2 top-0 -ml-[0.625rem] -mt-[0.625rem] flex size-5 items-center justify-center rounded-full border-[1.5px] border-brand bg-white"
                                            style={{ boxShadow: '0 0 0 4px var(--brand-100)' }}
                                        >
                                            <span className="size-[0.4375rem] rounded-full bg-brand" />
                                        </span>
                                    </span>
                                )}

                                {/* Nummernkreis: weiß mit Rahmen, aktiv füllt sich eine orange Schicht darüber */}
                                <span
                                    aria-hidden="true"
                                    data-kreis
                                    className="absolute z-10 flex items-center justify-center rounded-full border border-line-2 bg-white font-mono text-[0.8125rem] font-medium text-ink-3"
                                    style={{
                                        left: 'calc(var(--gx) * -1)',
                                        top: 'var(--t)',
                                        width: 'var(--c)',
                                        height: 'var(--c)',
                                    }}
                                >
                                    <span
                                        className="absolute -inset-px rounded-full bg-brand opacity-100 transition-[opacity,transform] duration-500 ease-out group-data-[aktiv=false]/schritt:scale-50 group-data-[aktiv=false]/schritt:opacity-0"
                                        style={{ boxShadow: '0 0 0 0.3125rem var(--brand-100)' }}
                                    />
                                    <span className="relative text-on-brand transition-colors duration-500 group-data-[aktiv=false]/schritt:text-ink">
                                        {nummer}
                                    </span>
                                </span>

                                <div data-karte className="karte relative overflow-hidden rounded-[1.25rem] p-6 md:p-7">
                                    {/* Graue Fläche über dem Weiß, solange der Schritt nicht erreicht ist (nur opacity). Der Text
                                        liegt darüber und behält volle Deckkraft. */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 bg-bg-2 opacity-0 transition-opacity duration-500 ease-out group-data-[aktiv=false]/schritt:opacity-100"
                                    />
                                    <div className="relative flex items-start justify-between gap-4">
                                        <h3 className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                            <span className="sr-only">Schritt {i + 1}: </span>
                                            {titel}
                                            {kostenlos ? (
                                                <span className="chip chip-ok">
                                                    <Check aria-hidden="true" size={12} strokeWidth={2.5} />
                                                    Kostenlos
                                                </span>
                                            ) : null}
                                        </h3>
                                        <Icon
                                            aria-hidden="true"
                                            size={22}
                                            strokeWidth={1.75}
                                            className="mt-0.5 flex-none text-ink-3 transition-opacity duration-500 ease-out group-data-[aktiv=false]/schritt:opacity-50"
                                        />
                                    </div>
                                    <p className="relative mt-3 max-w-[40ch] text-ink-2">{text}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
