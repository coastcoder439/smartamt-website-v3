import { Label } from '@/components/ui/Label';
import { EINZELNES } from '@/lib/abschnitte';
import { RevealText } from '@/components/ui/Reveal';
import Rangliste from './b2/Rangliste';
import { ABSCHNITT_WEISS, LABEL_GROSS } from './c2/abschnitt';
import { Licht } from './c2/Licht';
import { Zaehler } from './c2/Zaehler';

/**
 * Lage (id lage): Wo Deutschland im E-Government-Ranking der Vereinten Nationen steht. Hell.
 *
 * Links die Aussage (6 Spalten): die große Zahl „Platz 12.“ zählt beim Hineinscrollen von 22 herunter (Platz 22
 * im Jahr 2022), darunter die Unterzeile und der Text aus der Copy. Rechts die Ansicht (6 Spalten): die
 * Rangliste als horizontale Balken (b2/Rangliste.tsx, Deutschland orange) und die zweite Kennzahl
 * „10.753 Gemeinden“, die hochzählt. Die Quellenzeile steht in Mono unter dem Abschnitt.
 *
 * Der starke Moment: „Platz 12.“ füllt die ganze Textspalte (bis 176 px Schrift, vorher 144 px) und steht auf
 * einem warmen Lichtfeld mit Punktraster, das hinter der Rangliste leuchtet (c2/Licht.tsx, stark).
 *
 * Die Zahl der Überschrift ist für Sehende animiert (aria-hidden), Screenreader lesen den Endwert „Platz 12.“.
 * Die Schriftgröße der großen Zahl folgt der Breite der Textspalte (Container-Einheit cqw): „Platz 12.“ füllt
 * sie, auch am Handy. Das Server-HTML zeigt die Endwerte; bei reduzierter Bewegung und ohne JavaScript bleiben
 * sie stehen.
 */
export default function Lage() {
    return (
        <section id="lage" aria-labelledby="lage-titel" className={ABSCHNITT_WEISS}>
            {/* warmes Lichtfeld mit Punktraster hinter der Rangliste */}
            <Licht seite="rechts" stark />

            <div className="wrap grid-12 items-start gap-y-14">
                <div className="col-span-12 [container-type:inline-size] lg:col-span-6">
                    <Label className={LABEL_GROSS}>Die Lage</Label>
                    <h2 id="lage-titel" className="mt-4">
                        <span className="sr-only">Platz 12.</span>
                        <span
                            aria-hidden="true"
                            className="block text-[clamp(3.5rem,calc(100cqw/3.9),11rem)] font-bold leading-[0.92] tracking-[-0.055em] text-ink"
                        >
                            Platz <Zaehler von={22} bis={12} start="top 80%" className="text-brand-600" />.
                        </span>
                    </h2>
                    <RevealText className="mt-8 text-[clamp(1.375rem,1.1rem+1.1vw,1.875rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
                        So steht Deutschland im <span className="whitespace-nowrap">E-Government-Ranking</span> der
                        Vereinten Nationen. Dänemark führt, Estland folgt.
                    </RevealText>
                    <RevealText className="mt-6 max-w-[34em]">
                        Deutschland hat aufgeholt, von Platz 22 im Jahr 2022 auf Platz 12 im Jahr 2024. Entschieden wird
                        der Rest vor Ort: in 10.753 Gemeinden, die oft mit wenig Personal viel leisten. Genau dort
                        setzen wir an, mit Technik, die einfach funktioniert
                        {EINZELNES.lageSchulungen ? ', und mit Schulungen, die entlasten' : ''}.
                    </RevealText>
                </div>

                <div className="col-span-12 lg:col-span-6 lg:pt-1">
                    <Rangliste />

                    {/* Zweite Kennzahl: Anzahl der Gemeinden in Deutschland (Destatis, 31.12.2025) */}
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 rounded-[20px] border border-line bg-bg-2 px-6 py-6 sm:px-8">
                        <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                            <span className="sr-only">10.753 </span>
                            <span
                                aria-hidden="true"
                                className="text-[clamp(2.75rem,2rem+3vw,4.5rem)] font-bold leading-none tracking-[-0.05em] text-ink"
                            >
                                <Zaehler von={0} bis={10753} dauer={2.2} start="top 90%" />
                            </span>
                            <span className="text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">Gemeinden</span>
                        </p>
                        <p className="font-mono text-[0.8125rem] text-ink-2">Stand 31.12.2025</p>
                    </div>
                </div>

                <p className="col-span-12 max-w-[72ch] font-mono text-klein text-ink-2">
                    Quellen: UN E-Government Survey 2024 (EGDI, 193 Staaten); Statistisches Bundesamt,
                    Verwaltungsgliederung am 31.12.2025.
                </p>
            </div>
        </section>
    );
}
