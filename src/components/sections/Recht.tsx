'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { EINZELNES } from '@/lib/abschnitte';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { AkkordeonKarte } from './c3/Akkordeon';
import { Staffel } from './b3/Staffel';

/**
 * Recht und Sicherheit (id recht), CI v3: hell, zweispaltig.
 *
 * Links steht die Überschrift mit dem Text und bleibt beim Scrollen stehen (ab 1024 px, wenn die Fensterhöhe
 * reicht). Darunter führt eine senkrechte Leitlinie mit fünf Knoten, einer je Grundlage (die Chips aus den Karten,
 * keine neuen Zahlen): Der Knoten der geöffneten Karte ist orange, die Linie füllt sich bis zu ihm, und ein Klick
 * auf einen Knoten öffnet die Karte. Rechts liegen die fünf
 * Rechtsgrundlagen als weiße Akkordeon-Karten (c3/Akkordeon.tsx, echte <details>): Mono-Chip mit der Grundlage,
 * Titel, beim Aufklappen die Erklärung und „Was wir tun“ mit grünem Haken. Es ist immer nur eine Karte offen
 * (gleicher name), die erste steht offen. Das Paragraphenzeichen steht nur dort, wo es wirklich ein Paragraph ist
 * (§ 25 TDDDG); die übrigen Quellen sind Artikel, Richtlinie oder Urteil und stehen so im Text.
 *
 * Bewegung: Die Karten schweben gestaffelt herein (Staffel.tsx), das Plus dreht sich zum Minus. Das Server-HTML
 * ist der Endzustand; ohne JavaScript bleiben die Karten per Tastatur und Maus auf- und zuklappbar.
 * Texte wörtlich aus website-copy-b2-b3.md.
 */

const ALLE_EINTRAEGE = [
    {
        grundlage: 'Art. 32 DSGVO',
        titel: 'Sicherheit nach dem Stand der Technik',
        erklaerung:
            'Wer personenbezogene Daten verarbeitet, etwa über ein Kontaktformular, muss sie mit Maßnahmen schützen, die den Stand der Technik berücksichtigen.',
        wir: 'Aktuelle Software, regelmäßige Updates, Verschlüsselung, Sicherheits-Header.',
    },
    {
        grundlage: 'Richtlinie (EU) 2016/2102 · Landesrecht',
        titel: 'Barrierefreiheit',
        erklaerung:
            'Gemeinden müssen ihre Websites barrierefrei gestalten und eine Erklärung zur Barrierefreiheit mit Rückmeldemöglichkeit veröffentlichen. Die Länder überwachen das.',
        wir: 'Barrierefreie Gestaltung, Erklärung und Feedback-Formular.',
    },
    {
        grundlage: '§ 25 TDDDG',
        titel: 'Keine Cookies ohne Einwilligung',
        erklaerung:
            'Informationen auf den Geräten der Besucherinnen und Besucher dürfen nur mit Einwilligung gespeichert werden, außer sie sind unbedingt erforderlich.',
        wir: 'Websites, die ohne einwilligungspflichtige Cookies auskommen.',
    },
    {
        grundlage: 'Art. 6 DSGVO · LG München I',
        titel: 'Keine Daten an fremde Server',
        erklaerung:
            'Behörden können sich bei ihren Aufgaben nicht auf ein berechtigtes Interesse stützen. Schon das Laden von Schriften bei Google überträgt die IP-Adresse; das LG München I sah darin 2022 einen Rechtsverstoß (Az. 3 O 17493/20).',
        wir: 'Schriften und Inhalte vom eigenen Server, kein Tracking.',
    },
    {
        grundlage: 'Art. 4 KI-Verordnung',
        titel: 'KI-Kompetenz im Team',
        erklaerung:
            'Wer KI-Systeme einsetzt, muss Maßnahmen ergreifen, um die KI-Kompetenz der Mitarbeitenden zu unterstützen. Das gilt seit Februar 2025, auch in der Verwaltung.',
        wir: 'KI-Fortbildung vor Ort, mit Teilnahmezertifikat zur Dokumentation.',
    },
] as const;

// v3: Der Eintrag „KI-Kompetenz im Team“ wirbt für die KI-Fortbildung, die derzeit nicht angeboten wird; er bleibt im Code
// und erscheint wieder mit EINZELNES.rechtKi.
const EINTRAEGE = ALLE_EINTRAEGE.filter((e) => EINZELNES.rechtKi || e.grundlage !== 'Art. 4 KI-Verordnung');

/** `weiss`: weiße statt hellgrauer Fläche (v3, /fragen: direkt unter den grauen Fragen, damit keine graue Doppelfläche entsteht). */
export default function Recht({ weiss = false }: { weiss?: boolean }) {
    // Index der geöffneten Karte (-1: alle zu). Der Zustand der Karten selbst lebt im Browser (<details>); hier wird er
    // nur für die Leitlinie gespiegelt. Die erste Karte steht offen.
    const [aktiv, setAktiv] = useState(0);
    // Ein <details open> meldet sein Öffnen schon beim ersten Einlesen. Das ist der Ausgangszustand (aktiv = 0) und
    // wird ignoriert, bis die Komponente gemountet ist (sonst ein Zustandswechsel mitten in der Hydrierung).
    const bereit = useRef(false);
    useEffect(() => {
        bereit.current = true;
    }, []);

    const oeffne = (index: number) => {
        EINTRAEGE.forEach((_, i) => {
            const karte = document.getElementById(`recht-${i}`) as HTMLDetailsElement | null;
            if (karte) karte.open = i === index;
        });
        setAktiv(index);
    };

    return (
        <section id="recht" aria-labelledby="recht-titel" className={`section ${weiss ? 'bg-bg' : 'surface-soft'}`}>
            <div className="wrap">
                <div className="grid-12 gap-y-12">
                    <div className="col-span-12 lg:col-span-5">
                        <div className="lg:[@media(min-height:840px)]:sticky lg:[@media(min-height:840px)]:top-[calc(var(--header-h)+40px)]">
                            <Label>Recht &amp; Sicherheit</Label>
                            <RevealHeading as="h2" id="recht-titel" className="mt-4">
                                Rechtskonform heißt: Wir kennen die Paragraphen.
                            </RevealHeading>
                            <RevealText className="mt-6 max-w-[30em] text-lead">
                                Für Websites öffentlicher Stellen gelten klare Regeln. Wir setzen sie technisch um, damit Sie
                                sich darauf verlassen können.
                            </RevealText>
                            <RevealText className="mt-6 font-mono text-klein text-ink-3">
                                Diese Übersicht ersetzt keine Rechtsberatung. Stand: Oktober 2026.
                            </RevealText>

                            {/* Leitlinie: ein Knoten je Grundlage; der offene ist orange, die Linie füllt sich bis dorthin. */}
                            <nav aria-label="Rechtsgrundlagen" className="mt-8 hidden lg:block">
                                <ol role="list" className="relative">
                                    <span aria-hidden="true" className="absolute bottom-[19px] left-[7px] top-[19px] w-[2px] rounded-full bg-line-2" />
                                    <span
                                        aria-hidden="true"
                                        className="absolute bottom-[19px] left-[7px] top-[19px] w-[2px] origin-top rounded-full bg-brand transition-transform duration-700 ease-out"
                                        style={{ transform: `scaleY(${aktiv < 0 ? 0 : aktiv / (EINTRAEGE.length - 1)})` }}
                                    />
                                    {EINTRAEGE.map((eintrag, index) => {
                                        const istAktiv = index === aktiv;
                                        const erreicht = aktiv >= 0 && index <= aktiv;
                                        return (
                                            <li key={eintrag.grundlage}>
                                                <button
                                                    type="button"
                                                    onClick={() => oeffne(index)}
                                                    aria-current={istAktiv ? 'true' : undefined}
                                                    className="group/knoten flex min-h-[38px] w-full items-center gap-4 rounded-lg text-left"
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={`relative z-10 h-4 w-4 flex-none rounded-full border-2 bg-bg transition-[border-color,background-color,box-shadow] duration-500 ${
                                                            istAktiv
                                                                ? 'border-brand bg-brand shadow-[0_0_0_4px_var(--brand-100)]'
                                                                : erreicht
                                                                  ? 'border-brand'
                                                                  : 'border-line-2 group-hover/knoten:border-ink-3'
                                                        }`}
                                                    />
                                                    <span
                                                        className={`font-mono text-[0.75rem] font-medium leading-snug transition-colors duration-300 ${
                                                            istAktiv ? 'text-ink' : 'text-ink-3 group-hover/knoten:text-ink-2'
                                                        }`}
                                                    >
                                                        {eintrag.grundlage}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </nav>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7">
                        <Staffel kinder=":scope > details" className="grid gap-3">
                            {EINTRAEGE.map((eintrag, index) => (
                                <AkkordeonKarte
                                    key={eintrag.grundlage}
                                    id={`recht-${index}`}
                                    gruppe="recht"
                                    offen={index === 0}
                                    onToggle={(e) => {
                                        if (!bereit.current) return;
                                        const offen = e.currentTarget.open;
                                        setAktiv((aktuell) => (offen ? index : aktuell === index ? -1 : aktuell));
                                    }}
                                    kopf={
                                        <>
                                            <p className="inline-block max-w-full rounded-md border border-line bg-bg-2 px-2.5 py-1 font-mono text-[0.75rem] font-medium leading-snug text-ink-2">
                                                {eintrag.grundlage}
                                            </p>
                                            <h3 className="mt-3">{eintrag.titel}</h3>
                                        </>
                                    }
                                >
                                    <p className="max-w-[52ch]">{eintrag.erklaerung}</p>
                                    <div className="mt-5 flex items-start gap-3.5 rounded-xl bg-ok-50 px-4 py-4">
                                        <span
                                            aria-hidden="true"
                                            className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-ok text-white"
                                        >
                                            <Check size={14} strokeWidth={3} />
                                        </span>
                                        <div>
                                            <p className="font-mono text-label font-medium uppercase text-ok">Was wir tun</p>
                                            <p className="mt-1.5 font-medium leading-snug text-ink">{eintrag.wir}</p>
                                        </div>
                                    </div>
                                </AkkordeonKarte>
                            ))}
                        </Staffel>
                    </div>
                </div>
            </div>
        </section>
    );
}
