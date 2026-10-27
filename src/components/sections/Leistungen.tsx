'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Award, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { AnkerLink } from '@/components/layout/AnkerLink';
import { Label } from '@/components/ui/Label';
import { RevealHeading } from '@/components/ui/Reveal';
import { waehleAnliegen } from '@/lib/kontakt';
import { handleAnchorClick } from '@/lib/scroll';
import { cn } from '@/lib/utils';
import { ABSCHNITT_WEISS, LABEL_GROSS } from './c2/abschnitt';
import { Gestaffelt } from './c2/Gestaffelt';
import s from './c2/Leistungen.module.css';
import kursFoto from './c2/kurs-schreibtisch.webp';
import { Licht } from './c2/Licht';
import { MiniBrowser } from './c2/MiniBrowser';
import { Parallax } from './c2/Parallax';

/**
 * Leistungen (id leistungen): Bento-Raster mit vier Karten unterschiedlicher Größe.
 *
 *  1. Groß: „Websites für Gemeinden“ mit dem Mini-Browser der Beispielgemeinde Musterbach (drei grüne Haken);
 *     die Ansicht schwebt beim Scrollen leicht gegen die Karte (Parallaxe, c2/Parallax.tsx, Art „schweben“).
 *  2. Mittel: „KI-Fortbildung“ mit einem scharfen Foto in warmem Ton (Ausschnitt des Schulungsbilds
 *     „Arbeitsalltag“, c2/kurs-schreibtisch.webp), das nur am linken Rand ins Weiß ausläuft und beim Scrollen
 *     ruhig wandert (Parallaxe, Art „bild“). Text und Link stehen zusammen, die Karte ist ab 1024 px 280 px hoch.
 *  3. Klein: „IT-Schulungen“, Link „Anfragen“ springt zum Kontakt und setzt das Anliegen „IT-Schulung“.
 *  4. Klein: „Rechtssicher“, Link springt zu „Recht & Sicherheit“.
 *
 * Jede Karte ist als Ganzes anklickbar (der Link in der Karte spannt sich über sie), beim Überfahren hebt
 * sie sich um 2 px und der Schatten wird md. Beim Hineinscrollen schweben die Karten gestaffelt herein
 * (c2/Gestaffelt.tsx, nach Reihen: die beiden kleinen Karten starten gleichzeitig und stehen nie versetzt
 * gegeneinander). Das Server-HTML zeigt alles fertig; ohne JavaScript und bei reduzierter Bewegung
 * bleibt es so.
 *
 * Bühne: Hinter dem Raster liegt ein warmes Lichtfeld mit Punktraster (c2/Licht.tsx), das die Karten vom
 * Weiß abhebt. Die Karten tragen einheitlichen Innenabstand (28 px am Handy) und eine Titelstufe je Größe
 * (groß 28 bis 40 px, mittel 24 bis 32 px, klein 24 bis 28 px).
 */

/** Textlink am Fuß einer Karte; der Link spannt sich über die ganze Karte (Pseudoelement). */
const KARTEN_LINK =
    "inline-flex min-h-[44px] items-center gap-2 text-[0.9375rem] font-semibold text-ink after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:content-['']";

/** Titel der kleinen Karten: dieselbe Stufe wie „KI-Fortbildung“, nur eine Spur kleiner (24 bis 28 px). */
const KLEIN_TITEL = 'mt-5 text-[clamp(1.5rem,1.3rem+0.6vw,1.75rem)] font-bold leading-[1.1] tracking-[-0.03em]';

function Pfeil() {
    return (
        <ArrowRight
            aria-hidden="true"
            size={16}
            strokeWidth={1.75}
            className="text-ink-3 transition-all duration-300 group-hover/karte:translate-x-1 group-hover/karte:text-brand-ink"
        />
    );
}

export default function Leistungen() {
    const zuKontaktItSchulung = (e: React.MouseEvent<HTMLAnchorElement>) => {
        waehleAnliegen('it-schulung');
        handleAnchorClick(e, 'kontakt');
    };

    return (
        <section id="leistungen" aria-labelledby="leistungen-titel" className={ABSCHNITT_WEISS}>
            <Licht stark />
            <div className="wrap">
                <Label className={LABEL_GROSS}>Leistungen</Label>
                <RevealHeading as="h2" id="leistungen-titel" className="mt-4">
                    Was wir für Ihre Gemeinde tun.
                </RevealHeading>

                <Gestaffelt as="div" className={cn(s.bento, 'mt-12 lg:mt-16')}>
                    {/* 1. Groß: Websites */}
                    <article
                        data-st
                        data-reihe="0"
                        className={cn(
                            'karte group/karte flex flex-col overflow-hidden rounded-[20px] p-7 sm:p-9',
                            'md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center md:gap-9 lg:flex lg:flex-col lg:items-stretch lg:gap-0',
                            s.karte,
                            s.gross,
                        )}
                    >
                        <div className="flex flex-col items-start">
                            <h3 className="max-w-[16ch] text-[clamp(1.75rem,1.25rem+1.5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.035em]">
                                Websites für Gemeinden
                            </h3>
                            <p className="mt-4 max-w-[30em] text-ink-2">
                                Sicher, barrierefrei und rechtssicher: neu gebaut oder in Ordnung gebracht.
                            </p>
                            <AnkerLink id="websites" className={cn(KARTEN_LINK, 'mt-3 self-start')}>
                                Mehr erfahren
                                <Pfeil />
                            </AnkerLink>
                        </div>
                        <MiniBrowser />
                    </article>

                    {/* 2. Mittel: KI-Fortbildung mit Foto */}
                    <article
                        data-st
                        data-reihe="1"
                        className={cn(
                            'karte group/karte flex flex-col overflow-hidden rounded-[20px]',
                            'lg:min-h-[280px]',
                            s.karte,
                            s.mittel,
                        )}
                    >
                        <div
                            className={cn(
                                s.foto,
                                'relative order-first h-[190px] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[48%]',
                            )}
                        >
                            <Parallax className="h-full w-full">
                                <Image
                                    src={kursFoto}
                                    alt="Schreibtisch mit aufgeklapptem Laptop, Kaffeetasse, Pflanze und Notizblock"
                                    sizes="(min-width: 1024px) 40vw, 100vw"
                                    className="h-full w-full object-cover object-[30%_45%]"
                                />
                            </Parallax>
                        </div>
                        <div className="relative z-10 flex flex-1 flex-col p-7 sm:p-9 lg:max-w-[58%] lg:justify-center lg:p-8 xl:p-9">
                            <h3 className="whitespace-nowrap text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-bold leading-[1.1] tracking-[-0.03em]">
                                KI-Fortbildung
                            </h3>
                            <p className="mt-3 text-ink-2">
                                Drei Module, vor Ort, mit Teilnahmezertifikat. 1.800&nbsp;€ zzgl. MwSt., egal wie viele
                                mitmachen.
                            </p>
                            <AnkerLink id="schulungen" className={cn(KARTEN_LINK, 'mt-2 self-start')}>
                                Mehr erfahren
                                <Pfeil />
                            </AnkerLink>
                        </div>
                        <span
                            aria-hidden="true"
                            className="absolute bottom-5 right-5 z-10 hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[0.8125rem] font-semibold text-ink shadow-sm lg:inline-flex"
                        >
                            <Award size={14} strokeWidth={1.75} className="text-brand-ink" />
                            Teilnahmezertifikat
                        </span>
                    </article>

                    {/* 3. Klein: IT-Schulungen */}
                    <article
                        data-st
                        data-reihe="2"
                        className={cn(
                            'karte group/karte flex flex-col overflow-hidden rounded-[20px] p-7',
                            s.karte,
                            s.klein1,
                        )}
                    >
                        <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-bg-2 text-ink">
                            <MonitorSmartphone aria-hidden="true" size={20} strokeWidth={1.75} />
                        </span>
                        <h3 className={KLEIN_TITEL}>IT-Schulungen</h3>
                        <p className="mt-2 text-klein text-ink-2">Inhalt und Umfang nach Ihrem Bedarf.</p>
                        <Link
                            href="/#kontakt"
                            onClick={zuKontaktItSchulung}
                            className={cn(KARTEN_LINK, 'mt-auto self-start pt-4')}
                        >
                            Anfragen
                            <Pfeil />
                        </Link>
                    </article>

                    {/* 4. Klein: Rechtssicher */}
                    <article
                        data-st
                        data-reihe="2"
                        className={cn(
                            'karte group/karte flex flex-col overflow-hidden rounded-[20px] p-7',
                            s.karte,
                            s.klein2,
                        )}
                    >
                        <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-bg-2 text-ink">
                            <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.75} />
                        </span>
                        <h3 className={KLEIN_TITEL}>Rechtssicher</h3>
                        <p className="mt-2 text-klein text-ink-2">
                            DSGVO, Barrierefreiheit, KI-Verordnung: Wir kennen die Paragraphen.
                        </p>
                        <AnkerLink id="recht" className={cn(KARTEN_LINK, 'mt-auto self-start pt-4')}>
                            Mehr erfahren
                            <Pfeil />
                        </AnkerLink>
                    </article>
                </Gestaffelt>
            </div>
        </section>
    );
}
