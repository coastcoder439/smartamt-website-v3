import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, ExternalLink, Mail, Phone } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Magnet } from '@/components/ui/Magnet';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { EINZELNES } from '@/lib/abschnitte';
import { LEON, TOBIAS } from '@/lib/site';
import { Staffel } from './b3/Staffel';
import KontaktFormular from './b3/KontaktFormular';
import Beraterkarte from './c3/Beraterkarte';
import { ANSPRECHPARTNER } from './c3/personen';

/**
 * Kontakt (id kontakt), CI v3, in zwei Teilen:
 *
 *  1. Oben das Erstgespräch-Band, hell (weißer Grund mit Punktraster und einem weichen warmen Licht, wie der
 *     Hero): „Erstgespräch in 25 Minuten.“, der Text, der Knopf „Erstgespräch buchen“ (cal.com, neuer Tab, wie
 *     bisher) und „Kostenlos. Unverbindlich. Direkt mit den Machern.“ Rechts die weiße Beraterkarte, die alle
 *     4 Sekunden zwischen den Ansprechpartnern wechselt (c3/Beraterkarte.tsx). Orange nur als Akzent:
 *     das Wort „25 Minuten.“, der Knopf, das Licht im Hintergrund. Es gibt keine dunkle Fläche in diesem Abschnitt
 *     (Owner: „Ein helles, freundliches Design“).
 *  2. Darunter hell (ruhige Fläche) „Sprechen wir über Ihre Gemeinde.“ mit den direkten Wegen (Leon Pösken zuerst:
 *     Telefon und E-Mail, dann Tobias Steffen: Telefon, dazu der Kennenlerntermin) und das bestehende
 *     Anfrageformular im neuen Stil (b3/KontaktFormular.tsx, Logik und Feldnamen unverändert; Website v2: nur noch
 *     „Vorschau anfragen“ und „Etwas anderes“, siehe b3/anliegen.ts).
 *
 * Website v2 (aufgeräumt, nichts doppelt): Die Beraterkarte und die Zeile „Kennenlerntermin buchen“ sind ausgeblendet
 * (lib/abschnitte.ts, EINZELNES). Tobias und Leon stehen schon im Team und in den direkten Wegen, und der Knopf
 * „Erstgespräch buchen“ führt zum selben Termin. Ohne Beraterkarte nimmt der Text des Bandes mehr Breite ein.
 *
 * Der Abschnitt selbst ist statisch und steht auch ohne JavaScript fertig da. Der Link zum Kennenlerntermin
 * öffnet den externen Anbieter cal.com in einem neuen Tab; der Hinweis darauf steht sichtbar am Link. Die Seite
 * lädt dort nichts ein (kein Frame, kein Skript).
 */

const KENNENLERNEN_URL = 'https://cal.com/tobias-steffen/kennenlernen';

const ZEILE =
    'group flex items-center gap-4 rounded-2xl border border-line bg-bg p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-line-2 hover:shadow-md sm:p-5';
const SYMBOL =
    'grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-bg-2 text-ink transition-colors group-hover:bg-brand-50 group-hover:text-brand-ink';
const WERT =
    'block text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] font-semibold leading-tight tracking-[-0.02em] text-ink [overflow-wrap:anywhere]';
const ZUSATZ = 'mt-1 block font-mono text-klein text-ink-3';
/** v3: direkter Weg in der Ansprechpartner-Karte (Tippfläche 44 px). */
const WEG = 'inline-flex min-h-[2.75rem] items-center gap-3 text-[1.0625rem] font-medium text-ink';

export default function Kontakt() {
    return (
        <section id="kontakt" aria-labelledby="kontakt-titel">
            {/* Das helle Band: Erstgespräch */}
            {/* v3: das große Band „Erstgespräch in 25 Minuten“ ist ausgeblendet (EINZELNES.kontaktErstgespraechBand); der
                Termin-Link steht klein unter den direkten Wegen. */}
            {EINZELNES.kontaktErstgespraechBand ? (
                <div className="relative overflow-hidden bg-bg py-[clamp(4.5rem,9vw,8rem)]">
                    <div
                        aria-hidden="true"
                        className="dot-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(70%_80%_at_25%_35%,black,transparent)]"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full opacity-70 blur-3xl"
                        style={{ background: 'radial-gradient(closest-side, var(--brand-100), transparent)' }}
                    />

                    <div className="wrap relative">
                        <div className="grid-12 items-center gap-y-14">
                            <div
                                className={
                                    EINZELNES.kontaktBeraterkarte ? 'col-span-12 lg:col-span-7' : 'col-span-12 lg:col-span-10'
                                }
                            >
                                <Label>Nächster Schritt</Label>
                                <RevealHeading
                                    as="h2"
                                    id="kontakt-titel"
                                    className="mt-4 text-[clamp(2.5rem,1.6rem+4vw,4.75rem)] leading-[1] tracking-[-0.045em]"
                                >
                                    Erstgespräch in <span className="text-brand-600">25&nbsp;Minuten.</span>
                                </RevealHeading>
                                <RevealText className="mt-6 max-w-[32em] text-lead">
                                    Keine Folien, nur Klartext. Wir schauen uns Ihre Website an und sagen Ihnen ehrlich, was
                                    sinnvoll ist. Danach bereiten wir Ihre kostenlose Vorschau vor.
                                </RevealText>
                                <RevealText as="div" className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
                                    <Magnet>
                                        <ButtonLink href={KENNENLERNEN_URL} target="_blank" rel="noopener">
                                            Erstgespräch buchen
                                            <span className="pfeil" aria-hidden="true">
                                                →
                                            </span>
                                            <span className="sr-only"> (öffnet in neuem Tab)</span>
                                        </ButtonLink>
                                    </Magnet>
                                    <p className="text-klein text-ink-2">Kostenlos. Unverbindlich. Direkt mit den Machern.</p>
                                </RevealText>
                            </div>

                            {EINZELNES.kontaktBeraterkarte ? (
                                <div className="col-span-12 lg:col-span-4 lg:col-start-9">
                                    <Beraterkarte />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Hell: direkte Wege und das Formular */}

            <div className="surface-soft pb-[clamp(3rem,5vw,4rem)] pt-[clamp(3rem,5vw,4.5rem)]">
                <div className="wrap">
                    <div className="grid-12 gap-y-14">
                        <div className="col-span-12 lg:col-span-5">
                            <Label>Kontakt</Label>
                            <RevealHeading
                                as="h2"
                                id={EINZELNES.kontaktErstgespraechBand ? undefined : 'kontakt-titel'}
                                className="mt-4"
                            >
                                Sprechen wir über Ihre Gemeinde.
                            </RevealHeading>
                            <RevealText className="mt-6 max-w-[34em] text-lead">
                                Schreiben Sie uns oder rufen Sie an. Wir antworten innerhalb von 24 Stunden.
                            </RevealText>

                            {EINZELNES.kontaktGesichter ? (
                                // v3: Ansprechpartner mit Gesicht (Leon zuerst, wie ANSPRECHPARTNER in c3/personen.ts). Name und Rolle aus
                                // personen.ts, keine Sätze; Telefon und E-Mail als Zeilen in der Karte.
                                <Staffel as="ul" role="list" kinder=":scope > li" className="mt-10 grid gap-3">
                                    {ANSPRECHPARTNER.map((person) => (
                                        <li key={person.name} className="rounded-2xl border border-line bg-bg p-4 shadow-sm sm:p-5">
                                            <div className="flex items-center gap-4">
                                                <Image
                                                    src={person.foto}
                                                    width={person.breite}
                                                    height={person.hoehe}
                                                    alt={person.alt}
                                                    sizes="80px"
                                                    className="h-16 w-16 flex-none rounded-full object-cover ring-1 ring-line sm:h-[4.5rem] sm:w-[4.5rem]"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
                                                        {person.name}
                                                    </p>
                                                    <p className={ZUSATZ}>{person.rolle}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-x-7 gap-y-0 border-t border-line pt-3">
                                                {person.telefon && person.telefonHref ? (
                                                    <a href={person.telefonHref} className={WEG}>
                                                        <Phone aria-hidden="true" size={18} strokeWidth={1.75} className="flex-none text-brand-ink" />
                                                        <span className="link">{person.telefon}</span>
                                                    </a>
                                                ) : null}
                                                {person.email ? (
                                                    <a href={`mailto:${person.email}`} className={WEG}>
                                                        <Mail aria-hidden="true" size={18} strokeWidth={1.75} className="flex-none text-brand-ink" />
                                                        <span className="link [overflow-wrap:anywhere]">{person.email}</span>
                                                    </a>
                                                ) : null}
                                            </div>
                                        </li>
                                    ))}
                                </Staffel>
                            ) : (
                                <Staffel as="ul" role="list" kinder=":scope > li" className="mt-10 grid gap-3">
                                    <li>
                                        <a href={LEON.telefonHref} className={ZEILE}>
                                            <span aria-hidden="true" className={SYMBOL}>
                                                <Phone size={22} strokeWidth={1.75} />
                                            </span>
                                            <span className="min-w-0">
                                                <span className={WERT}>{LEON.telefon}</span>
                                                <span className={ZUSATZ}>{LEON.name}, Telefon</span>
                                            </span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href={`mailto:${LEON.email}`} className={ZEILE}>
                                            <span aria-hidden="true" className={SYMBOL}>
                                                <Mail size={22} strokeWidth={1.75} />
                                            </span>
                                            <span className="min-w-0">
                                                <span className={WERT}>{LEON.email}</span>
                                                <span className={ZUSATZ}>{LEON.name}, E-Mail</span>
                                            </span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href={TOBIAS.telefonHref} className={ZEILE}>
                                            <span aria-hidden="true" className={SYMBOL}>
                                                <Phone size={22} strokeWidth={1.75} />
                                            </span>
                                            <span className="min-w-0">
                                                <span className={WERT}>{TOBIAS.telefon}</span>
                                                <span className={ZUSATZ}>{TOBIAS.name}, Telefon</span>
                                            </span>
                                        </a>
                                    </li>
                                    {EINZELNES.kontaktKennenlernZeile ? (
                                        <li>
                                            <a href={KENNENLERNEN_URL} target="_blank" rel="noopener" className={ZEILE}>
                                                <span aria-hidden="true" className={SYMBOL}>
                                                    <CalendarCheck size={22} strokeWidth={1.75} />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className={WERT}>
                                                        Kennenlerntermin buchen
                                                        <ExternalLink
                                                            aria-hidden="true"
                                                            size={18}
                                                            strokeWidth={1.75}
                                                            className="ml-2 inline-block align-[-0.12em] text-ink-3"
                                                        />
                                                        <span className="sr-only"> (öffnet in neuem Tab)</span>
                                                    </span>
                                                    <span className={ZUSATZ}>externer Anbieter cal.com</span>
                                                </span>
                                            </a>
                                        </li>
                                    ) : null}
                                </Staffel>
                            )}

                            {!EINZELNES.kontaktErstgespraechBand ? (
                                <p className="mt-6 text-klein text-ink-2">
                                    Lieber gleich ein Termin?{' '}
                                    <a href={KENNENLERNEN_URL} target="_blank" rel="noopener" className="link font-semibold">
                                        Erstgespräch buchen (25 Minuten)
                                        <span className="sr-only"> (öffnet in neuem Tab)</span>
                                    </a>
                                </p>
                            ) : null}
                            {EINZELNES.kontaktGesichter ? (
                                <p className="mt-3 text-klein">
                                    <Link href="/ueber-uns/" className="link inline-flex items-center gap-1 font-semibold text-ink">
                                        Mehr über uns
                                        <ArrowRight aria-hidden="true" size="1em" strokeWidth={1.75} />
                                    </Link>
                                </p>
                            ) : null}
                        </div>

                        <div className="col-span-12 lg:col-span-7">
                            <KontaktFormular />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
