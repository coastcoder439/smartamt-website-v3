import Image from 'next/image';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { ABSENDER, KONTAKT } from '@/lib/site';
import { Staffel } from './b3/Staffel';
import { PERSONEN } from './c3/personen';

/**
 * Über uns (id ueber-uns), CI v3: links Label, Überschrift „Ein Projekt der NX7.AGENCY.“ und der Text, rechts
 * zwei weiße Karten mit den Porträts von Tobias Steffen und Leon Pösken (schwarz-weiß, gleicher Schnitt; beim
 * Überfahren hebt sich die Karte um 2 px und das Foto wird einen Hauch größer). Darunter Name, Rolle in Mono, der
 * Satz und die Wege zur Person (Telefon, bei Leon auch E-Mail). Unter allem Sitz, E-Mail des Hauses und der Link zur
 * NX7.AGENCY. Website v2: Eremiya Rifat ist ausgeblendet (personen.ts, lib/abschnitte.ts), Leon steht an ihrer Stelle.
 *
 * Bewegung: Überschrift und Text blenden ein (Reveal.tsx), die Karten schweben gestaffelt herein (Staffel.tsx).
 * Das Server-HTML ist der Endzustand. Texte und Rollen laut bauauftrag-v2.md (Entscheidung 8), Fotos aus
 * public/images/team/ (Teamfotos, keine Stockfotos).
 */
export default function Team() {
    return (
        <section id="ueber-uns" aria-labelledby="ueber-uns-titel" className="section">
            <div className="wrap">
                <div className="grid-12 gap-y-12">
                    <div className="col-span-12 self-start lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:col-span-5">
                        <Label>Über uns</Label>
                        <RevealHeading as="h2" id="ueber-uns-titel" className="mt-4">
                            Ein Projekt der NX7.AGENCY.
                        </RevealHeading>
                        <RevealText className="mt-6 max-w-[34em] text-lead">
                            SmartAmt gehört zur NX7.AGENCY aus Leipzig. NX7 automatisiert Geschäftsprozesse für Mittelstand
                            und öffentliche Verwaltung. SmartAmt bündelt dieses Wissen für Gemeinden: Websites, die halten,
                            was sie versprechen.
                        </RevealText>

                        {/* v3: Sitz und Link zur NX7.AGENCY stehen in der linken Spalte (vorher als Zeile unter dem Team); die Spalte
                            bleibt ab 1024 px beim Scrollen stehen. Owner 27.10.2026: „Da sind noch so viele leere Flächen“. */}
                        <div className="mt-10 flex flex-col items-start gap-3 border-t border-line pt-6">
                            <p className="font-mono text-klein text-ink-2">
                                Sitz: {KONTAKT.strasse}, {KONTAKT.plz} {KONTAKT.ort} · E-Mail{' '}
                                <a href={`mailto:${KONTAKT.email}`} className="link">
                                    {KONTAKT.email}
                                </a>
                            </p>
                            <a
                                href={ABSENDER.url}
                                target="_blank"
                                rel="noopener"
                                className="link inline-flex min-h-[2.75rem] items-center gap-2 font-semibold"
                            >
                                NX7.AGENCY besuchen
                                <ExternalLink aria-hidden="true" size={18} strokeWidth={1.75} />
                                <span className="sr-only">(öffnet in neuem Tab)</span>
                            </a>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7">
                        <Staffel as="ul" role="list" kinder=":scope > li" className="grid gap-5 sm:grid-cols-2">
                            {PERSONEN.map((person) => (
                                <li key={person.name}>
                                    <article className="karte group/person flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md">
                                        <div className="relative aspect-square overflow-hidden bg-bg-3">
                                            <Image
                                                src={person.foto}
                                                width={person.breite}
                                                height={person.hoehe}
                                                alt={person.alt}
                                                sizes="(min-width: 1280px) 300px, (min-width: 640px) 40vw, 100vw"
                                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/person:scale-[1.04]"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                                            <h3 className="text-[clamp(1.375rem,1.2rem+0.6vw,1.75rem)] font-bold leading-tight">
                                                {person.name}
                                            </h3>
                                            <p className="mt-2 font-mono text-[0.75rem] font-medium uppercase leading-relaxed tracking-[0.08em] text-brand-ink">
                                                {person.rolle.split(' · ').map((teil) => (
                                                    <span key={teil} className="block">
                                                        {teil}
                                                    </span>
                                                ))}
                                            </p>
                                            <p className="mt-5 text-[1.0625rem] leading-relaxed">{person.satz}</p>
                                            {person.telefon || person.email || person.link ? (
                                                <ul role="list" className="mt-auto space-y-0.5 pt-5 text-klein">
                                                    {person.telefon && person.telefonHref ? (
                                                        <li>
                                                            <a
                                                                href={person.telefonHref}
                                                                className="link inline-flex min-h-[2.75rem] items-center gap-2.5 whitespace-nowrap font-semibold sm:min-h-[2.25rem]"
                                                            >
                                                                <Phone aria-hidden="true" size={16} strokeWidth={1.75} className="text-brand-ink" />
                                                                {person.telefon}
                                                            </a>
                                                        </li>
                                                    ) : null}
                                                    {person.email ? (
                                                        <li>
                                                            <a
                                                                href={`mailto:${person.email}`}
                                                                className="link inline-flex min-h-[2.75rem] items-center gap-2.5 font-semibold [overflow-wrap:anywhere] sm:min-h-[2.25rem]"
                                                            >
                                                                <Mail aria-hidden="true" size={16} strokeWidth={1.75} className="text-brand-ink" />
                                                                {person.email}
                                                            </a>
                                                        </li>
                                                    ) : null}
                                                    {person.link ? (
                                                        <li>
                                                            <a
                                                                href={person.link.href}
                                                                target="_blank"
                                                                rel="noopener"
                                                                className="link inline-flex min-h-[2.75rem] items-center gap-2.5 font-semibold sm:min-h-[2.25rem]"
                                                            >
                                                                <ExternalLink aria-hidden="true" size={16} strokeWidth={1.75} className="text-brand-ink" />
                                                                {person.link.label}
                                                                <span className="sr-only"> (öffnet in neuem Tab)</span>
                                                            </a>
                                                        </li>
                                                    ) : null}
                                                </ul>
                                            ) : null}
                                        </div>
                                    </article>
                                </li>
                            ))}
                        </Staffel>
                    </div>
                </div>

            </div>
        </section>
    );
}
