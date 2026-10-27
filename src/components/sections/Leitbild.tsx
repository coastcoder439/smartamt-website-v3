import Link from 'next/link';
import { Label } from '@/components/ui/Label';
import { RevealHeading } from '@/components/ui/Reveal';
import { Staffel } from './b3/Staffel';

/**
 * Leitbild (id leitbild), Website v3, Seite /ueber-uns: wofür SmartAmt steht, in fünf Punkten.
 *
 * Quelle der Punkte (Plan 03-website-v3, Punkt 2): die Owner-Nachricht vom 27.10.2026 (Wortlaut in
 * docs/packages/03-website-v3/OWNER.md: Digitalisierung Deutschlands, überall einheitlich zurechtfinden, Ämter wissen, dass
 * sie rechtlich richtig liegen, immer auf dem neuesten Stand der Technik) und das Konzept docs/concept/CONCEPT.md: Intent
 * (Gemeinden, Ämter und Behörden digitalisieren, den Weg zu einem einheitlichen digitalen Staat bereiten), 1.3 (Mission und
 * Vision), 1.5 (Kernbotschaft) und Entscheidung E1 (Vorbild sind Dänemark und Estland). Der Owner nannte „Estland und
 * Norwegen“; bestätigt und belegt ist E1: Dänemark Platz 1, Estland Platz 2 im UN E-Government Survey 2024
 * (docs/research/facts-context.md, Abschnitt 2). Auf der Seite heißt es „rechtskonform“ (Owner 26.10.2026: „nicht zweimal
 * sicher hintereinander“).
 *
 * Aufbau: oben Label und Überschrift, darunter die fünf Punkte als Raster ohne leere Zelle (ab 1024 px zwei breite und drei
 * schmale Felder, ab 768 px zwei Spalten, der fünfte Punkt über beide) mit Nummer,
 * Titel und einem Satz, je mit feiner Linie darüber. Die Punkte steigen gestaffelt auf (b3/Staffel.tsx).
 */
const PUNKTE: readonly { titel: string; text: React.ReactNode }[] = [
    {
        titel: 'Deutschland digital machen',
        text: 'Wir digitalisieren Gemeinden, Ämter und Behörden dort, wo Bürgerinnen und Bürger sie erleben: auf der Website ihrer Gemeinde.',
    },
    {
        titel: 'Überall gleich gut zurechtfinden',
        text: 'Wer eine Gemeinde-Website von uns öffnet, findet sich sofort zurecht: gleiche Wege, klare Sprache, barrierefrei.',
    },
    {
        titel: 'Ämter wissen, dass alles rechtskonform ist',
        text: (
            <>
                Barrierefreiheit, Datenschutz und Pflichtangaben setzen wir technisch um.{' '}
                <Link href="/fragen/#recht" className="link whitespace-nowrap font-semibold text-ink">
                    Die Vorgaben im Einzelnen
                </Link>
            </>
        ),
    },
    {
        titel: 'Immer auf dem neuesten Stand der Technik',
        text: 'Technik, Updates und Sicherheit halten wir laufend aktuell, nicht nur am Tag des Livegangs.',
    },
    {
        titel: 'Vorbild Dänemark und Estland',
        text: (
            <>
                Dort gehören digitale Behördengänge zum Alltag. Beide führen das{' '}
                <span className="whitespace-nowrap">E-Government-Ranking</span> der Vereinten Nationen 2024 an.
            </>
        ),
    },
];

export default function Leitbild() {
    return (
        <section id="leitbild" aria-labelledby="leitbild-titel" className="section surface-soft">
            {/* v3: Überschrift oben, die fünf Punkte als Raster darunter (3 + 2), statt einer leeren linken Spalte neben einer
                langen Liste. Owner 27.10.2026: „Da sind noch so viele leere Flächen“. */}
            <div className="wrap">
                <Label>Wofür wir stehen</Label>
                <RevealHeading as="h2" id="leitbild-titel" className="mt-4">
                    Fünf Versprechen.
                </RevealHeading>

                <Staffel as="ol" kinder=":scope > li" className="mt-10 grid gap-x-8 gap-y-2 md:grid-cols-2 lg:mt-12 lg:grid-cols-6">
                    {PUNKTE.map((p, i) => (
                        <li key={p.titel} className={`border-t border-line-2 pb-6 pt-6 ${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'} ${i === 4 ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                            <span aria-hidden="true" className="font-mono text-[0.8125rem] tracking-[0.12em] text-brand-ink">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className="mt-3 text-[clamp(1.25rem,1.1rem+0.6vw,1.625rem)] font-bold leading-[1.18] tracking-[-0.025em]">
                                {p.titel}
                            </h3>
                            <p className="mt-2 max-w-[34em] text-[1.0625rem] leading-[1.55] text-ink-2">{p.text}</p>
                        </li>
                    ))}
                </Staffel>
            </div>
        </section>
    );
}
