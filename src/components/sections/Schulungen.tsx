'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, MapPin, Route, Users } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Leitlinie } from '@/components/ui/Leitlinie';
import { Magnet } from '@/components/ui/Magnet';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { handleAnchorClick } from '@/lib/scroll';
import { setzeAnliegen, type AnliegenWert } from './b3/anliegen';
import { Staffel } from './b3/Staffel';

/**
 * Schulungen (id schulungen), CI v3: Die KI-Fortbildung für Verwaltungen. Hell, ruhige Fläche (surface-soft).
 *
 * Aufbau:
 *  - Kopf: Label, Überschrift („Nicht fürchten.“ als einzelnes Wort in Orange), Text.
 *  - Die drei Module als weiße Karten mit Foto (in zarter, leicht gedämpfter Farbe, beim Überfahren voll farbig; so
 *    wirkt die Reihe warm und freundlich statt nüchtern) in einer Reihe. Die Fotos
 *    sind in Ton und Ausschnitt angeglichen (4:3, gleiche mittlere Helligkeit, matte Tiefen; erzeugt von
 *    scripts/gleiche-schulungsbilder-an.mjs aus den Rohbildern modul-*.png), damit die Reihe ruhig wirkt. Sie
 *    sind eine echte Abfolge des Schulungstags („Modul 1“ bis „Modul 3“); darüber verbindet die orange
 *    Leitlinie die drei Knoten (sie zeichnet sich beim Scrollen von links nach rechts, ab 768 px).
 *  - Die Preis-Karte: weiß, 1 px oranger Rand, „1.800 €“ groß, rechts die Eckdaten und links der Hauptknopf.
 *  - Der Hinweis zur KI-Verordnung als ruhige Zeile mit orangem Punkt.
 *  - Unten der Block „IT-Schulungen“ mit Textlink, der das Anliegen „IT-Schulung“ vorbelegt.
 *
 * Bewegung: Einblendung der Überschrift und des Textes (Reveal.tsx), gestaffeltes Hereinschweben der Karten
 * (Staffel.tsx) und die Leitlinie. Das Server-HTML ist der Endzustand: Ohne JavaScript und bei reduzierter
 * Bewegung steht alles fertig da. Texte wörtlich aus website-copy-b2-b3.md.
 */

const MODULE = [
    {
        titel: 'KI-Grundlagen',
        text: 'Was KI kann und was nicht. Wie große Sprachmodelle funktionieren, wie man richtig mit ihnen arbeitet und wo die Grenzen liegen.',
        bild: '/images/schulung/karte-grundlagen.webp',
        // Das Rohbild ist schwarz-weiß und unscharf: ein warmer Ton (Sepia) fügt es zu den farbigen Nachbarn.
        ton: 'sepia-[0.32] saturate-[1.15] brightness-[1.04] group-hover/modul:sepia-[0.2]',
        breite: 1200,
        hoehe: 900,
        alt: 'Eine Schulung in einem Seminarraum, im Vordergrund unscharf die Teilnehmenden, vorn die Referentin an der Leinwand',
    },
    {
        titel: 'Anwendung im Arbeitsalltag',
        text: 'Texte, E-Mails, Recherche, Zusammenfassungen und Entscheidungsvorlagen, datenschutzkonform im Behördenalltag.',
        bild: '/images/schulung/karte-arbeitsalltag.webp',
        ton: 'saturate-[0.92] group-hover/modul:saturate-100',
        breite: 1200,
        hoehe: 900,
        alt: 'Ein Schreibtisch aus hellem Holz mit aufgeklapptem Laptop, Kaffeetasse, Notizblock und Pflanze',
    },
    {
        titel: 'Unterlagen und Zertifikat',
        text: 'Handout, Spickzettel für den Alltag und ein Teilnahmezertifikat für jede Person.',
        bild: '/images/schulung/karte-zertifikat.webp',
        // Das Heft liegt auf einem dunklen Tisch: heller belichtet, damit es neben Modul 2 nicht abfällt.
        ton: 'saturate-[0.92] brightness-[1.1] contrast-[0.97] group-hover/modul:saturate-100',
        breite: 1200,
        hoehe: 900,
        alt: 'Die Schulungsunterlagen als Broschüre auf einem Schreibtisch, daneben ein Füllfederhalter',
    },
] as const;

const ECKDATEN: readonly { begriff: string; wert: string; symbol: typeof Clock }[] = [
    { begriff: 'Dauer', wert: '3 Stunden Fortbildung, danach 1 Stunde Einzelberatung', symbol: Clock },
    { begriff: 'Ort', wert: 'bei Ihnen vor Ort', symbol: MapPin },
    { begriff: 'Gruppe', wert: '5 bis 35 Personen', symbol: Users },
    { begriff: 'Anfahrt', wert: 'im Umkreis von 100 km um Leipzig inklusive', symbol: Route },
    { begriff: 'Termin', wert: 'in der Regel ab 10 Werktagen Vorlauf', symbol: CalendarDays },
];

export default function Schulungen() {
    const reihe = useRef<HTMLDivElement>(null);

    const zumKontakt = (anliegen: AnliegenWert) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        setzeAnliegen(anliegen);
        handleAnchorClick(e, 'kontakt');
    };

    return (
        <section id="schulungen" aria-labelledby="schulungen-titel" className="section surface-soft relative overflow-hidden">
            <div className="wrap">
                <Label>Schulungen</Label>
                <RevealHeading as="h2" id="schulungen-titel" className="mt-4 max-w-[14em]">
                    KI verstehen. <span className="text-brand-600">Nicht fürchten.</span>
                </RevealHeading>
                <RevealText className="mt-6 max-w-[40em] text-lead">
                    Unsere KI-Fortbildung für Verwaltungen findet bei Ihnen vor Ort statt, ist praxisnah und auf Ihren
                    Arbeitsalltag zugeschnitten. Sie ist für Teams von 5 bis 35 Personen, zu einem festen Preis.
                </RevealText>

                {/* Die drei Module: eine echte Abfolge, deshalb nummeriert und durch die Leitlinie verbunden. */}
                <div ref={reihe} className="relative mt-14 md:mt-20 md:pt-10">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[7px] hidden md:block">
                        <span className="absolute inset-x-0 top-0 h-[2px] rounded-full bg-line-2" />
                        <Leitlinie
                            richtung="waagerecht"
                            staerke={2}
                            ausloeser={reihe}
                            start="top 80%"
                            ende="top 25%"
                            className="h-[2px] w-full text-brand"
                        />
                    </div>

                    <Staffel as="ol" role="list" kinder=":scope > li" className="grid gap-5 md:grid-cols-3">
                        {MODULE.map((modul, index) => (
                            <li key={modul.titel} className="relative">
                                <span
                                    aria-hidden="true"
                                    className="absolute -top-10 left-0 hidden h-4 w-4 rounded-full border-2 border-brand bg-bg ring-4 ring-bg-2 md:block"
                                />
                                <article className="karte group/modul flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-bg-3">
                                        <Image
                                            src={modul.bild}
                                            width={modul.breite}
                                            height={modul.hoehe}
                                            alt={modul.alt}
                                            sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
                                            className={`h-full w-full scale-[1.01] object-cover object-center transition-[transform,filter] duration-700 ease-out group-hover/modul:scale-[1.04] ${modul.ton}`}
                                        />
                                        <span className="absolute left-4 top-4 rounded-full bg-bg px-3 py-1 font-mono text-label font-medium uppercase text-ink shadow-sm">
                                            Modul {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                                        <h3>{modul.titel}</h3>
                                        <p className="mt-3 text-[1.0625rem] leading-relaxed">{modul.text}</p>
                                    </div>
                                </article>
                            </li>
                        ))}
                    </Staffel>
                </div>

                {/* Preis-Karte: weiß, 1 px oranger Rand, die Zahl groß. */}
                <RevealText
                    as="div"
                    className="relative mt-10 overflow-hidden rounded-[20px] border border-brand bg-bg shadow-md lg:mt-12"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-70 blur-3xl"
                        style={{ background: 'radial-gradient(closest-side, var(--brand-100), transparent)' }}
                    />
                    <div className="relative grid lg:grid-cols-12">
                        <div className="p-7 sm:p-9 lg:col-span-5 lg:p-11">
                            <Label>Eckdaten</Label>
                            <p className="mt-7 text-[clamp(3.5rem,2.4rem+5vw,6.25rem)] font-bold leading-[0.9] tracking-[-0.05em] text-ink">
                                <span className="sr-only">Preis: </span>1.800&nbsp;€
                            </p>
                            <p className="mt-4 max-w-[22em] text-[1.0625rem] font-medium leading-snug text-ink-2">
                                zzgl. 19 % MwSt., unabhängig von der Teilnehmerzahl
                            </p>
                            <div className="mt-8">
                                <Magnet>
                                    <ButtonLink href="/#kontakt" onClick={zumKontakt('schulung')}>
                                        KI-Fortbildung anfragen
                                        <span className="pfeil" aria-hidden="true">
                                            →
                                        </span>
                                    </ButtonLink>
                                </Magnet>
                            </div>
                        </div>

                        <dl className="grid content-center gap-x-8 gap-y-6 border-t border-line p-7 sm:grid-cols-2 sm:p-9 lg:col-span-7 lg:border-l lg:border-t-0 lg:p-11">
                            {ECKDATEN.map((zeile, index) => {
                                const Symbol = zeile.symbol;
                                return (
                                    <div key={zeile.begriff} className={index === 0 ? 'sm:col-span-2' : undefined}>
                                        <dt className="flex items-center gap-2.5 font-mono text-label font-medium uppercase text-ink-3">
                                            <Symbol aria-hidden="true" size={16} strokeWidth={1.75} className="text-brand-ink" />
                                            {zeile.begriff}
                                        </dt>
                                        <dd className="mt-2 text-[1.0625rem] font-medium leading-snug text-ink">{zeile.wert}</dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </div>
                </RevealText>

                {/* Hinweis zur KI-Verordnung: ruhige Zeile mit orangem Punkt */}
                <RevealText className="mt-8 flex max-w-[44em] items-start gap-3.5 text-[1.0625rem] leading-relaxed text-ink-2">
                    <span
                        aria-hidden="true"
                        className="mt-[0.62em] h-2 w-2 flex-none rounded-full bg-brand"
                        style={{ boxShadow: '0 0 0 4px var(--brand-100)' }}
                    />
                    <span>
                        Seit Februar 2025 verlangt die KI-Verordnung Maßnahmen zur KI-Kompetenz, auch in Behörden. Fortbildung
                        und Zertifikat helfen Ihnen, das zu dokumentieren.
                    </span>
                </RevealText>

                {/* IT-Schulungen */}
                <RevealText as="div" className="karte mt-14 lg:mt-20">
                    <div className="grid-12 items-center gap-y-5 p-7 sm:p-9">
                        <div className="col-span-12 lg:col-span-4">
                            <h3>IT-Schulungen</h3>
                        </div>
                        <div className="col-span-12 lg:col-span-5">
                            <p className="max-w-[34em]">
                                Neben KI bieten wir IT-Schulungen für Verwaltungsteams an. Inhalt und Umfang stimmen wir mit
                                Ihnen ab.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-3 lg:justify-self-end">
                            <Link
                                href="/#kontakt"
                                onClick={zumKontakt('it-schulung')}
                                className="link inline-flex min-h-[44px] items-center gap-2 font-semibold"
                            >
                                IT-Schulung anfragen
                                <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
                            </Link>
                        </div>
                    </div>
                </RevealText>
            </div>
        </section>
    );
}
