import { Label } from '@/components/ui/Label';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { EINZELNES } from '@/lib/abschnitte';
import Befunde from './b2/Befunde';
import Pruefliste from './b2/Pruefliste';
import Vergleich from './b2/Vergleich';
import WebsiteKnopf from './b2/WebsiteKnopf';
import { ABSCHNITT_SOFT, LABEL_GROSS } from './c2/abschnitt';

/**
 * Websites (id websites): Prüfliste, Vorher/Nachher-Ansicht der erfundenen Gemeinde Musterbach und darunter die Befund-Liste, hell.
 *
 *  - Oben links die Aussage (5 Spalten), rechts die Prüfliste: vier Zeilen mit grünen Haken in einer
 *    weißen Karte (b2/Pruefliste.tsx).
 *  - Darunter, in einem Bild, die Vorher/Nachher-Ansicht und die sechs Beispielbefunde (b2/Vergleich.tsx, b2/BefundKarten.tsx;
 *    Nachtrag 1, N4, und Nachtrag 2: „so wie bei Tobi“, Wisch und Karten im selben angehefteten Bild). Am Desktop wird es
 *    angeheftet; ein Regler in der Markenfarbe fährt mit dem Scroll von rechts nach links und legt „Nachher“ frei, in der Leiste
 *    steht „Vorher | 6 von 6 Befunden offen | Nachher“, darunter kippen die sechs Karten mit dem Regler auf erfüllt. Der Griff ist
 *    ziehbar und per Tastatur bedienbar. Am Handy stehen beide Ansichten untereinander, bei reduzierter Bewegung nebeneinander,
 *    statisch, mit den Karten darunter. Ohne Browserleiste und ohne Kästchen um das Bild (Nachtrag 1, N6). Die frühere
 *    Befund-Tabelle (b2/Befunde.tsx) ist über `EINZELNES.befundTabelle` ausgeblendet.
 *  - Der Hauptknopf zum Kontakt (Anliegen „Website“) steht nur im Ablauf direkt darunter; hier gibt es ihn
 *    nicht noch einmal.
 *
 * Texte im Verkäufer-Ton (Nachtrag 1, N8): Aussagen statt Absätze, höchstens zehn Wörter je Zeile, keine neuen Tatsachen.
 *
 * Die linke Spalte bleibt ab 1024 px stehen (sticky, wie im Ablauf), solange die Prüfliste rechts vorbeizieht:
 * so entsteht unter dem Absatz keine tote Fläche.
 *
 * Die Fläche ist ruhiges Hellgrau (surface-soft): Die weißen Fenster und die weiße Befund-Karte heben sich davon ab.
 * Abstand oben 72 bis 112 px (statt bisher bis 168 px) und Anker-Rand: siehe c2/abschnitt.ts.
 */
export default function Websites() {
    return (
        <section id="websites" aria-labelledby="websites-titel" className={`surface-soft ${ABSCHNITT_SOFT}`}>
            {EINZELNES.websitesPruefliste ? (
                <div className="wrap grid-12 items-start gap-y-12">
                    <div className="col-span-12 lg:sticky lg:top-[calc(var(--header-h)+56px)] lg:col-span-5">
                        <Label className={LABEL_GROSS}>Websites für Gemeinden</Label>
                        <RevealHeading as="h2" id="websites-titel" className="mt-4">
                            Eine Website, die Ihre Gemeinde gut vertritt.
                        </RevealHeading>
                        <RevealText className="mt-6 max-w-[34em]">
                            Wir bauen neu oder bringen Ihre Website in Ordnung. Ihre Inhalte bleiben, wir übernehmen Technik und
                            Pflichtangaben.
                        </RevealText>
                    </div>

                    <div className="col-span-12 lg:col-span-7">
                        <Pruefliste />
                    </div>
                </div>
            ) : (
                // v3: Überschrift links, ein Satz und der Knopf rechts, unten bündig (wie im Angebot); die Prüfliste ist ausgeblendet.
                <div className="wrap">
                    <Label className={LABEL_GROSS}>Websites für Gemeinden</Label>
                    <div className="grid-12 mt-4 items-end gap-y-6">
                        <div className="col-span-12 lg:col-span-7">
                            <RevealHeading as="h2" id="websites-titel">
                                Eine Website, die Ihre Gemeinde gut vertritt.
                            </RevealHeading>
                        </div>
                        <div className="col-span-12 lg:col-span-5 lg:pb-2">
                            <RevealText className="max-w-[32ch] text-lead text-ink-2">
                                Wir bauen neu oder bringen Ihre Website in Ordnung. Ihre Inhalte bleiben.
                            </RevealText>
                            <div className="mt-6">
                                <WebsiteKnopf />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Wisch und sechs Befund-Karten in einem Bild; bewusst breiter als der Textspalten-Rahmen (nur der Seitenrand bleibt) */}
            <div className="mx-auto mt-[clamp(40px,4vw,64px)] max-w-[110rem] px-[var(--gutter)]">
                <Vergleich />
            </div>

            {/* Die frühere Befund-Tabelle (ausgeblendet, nicht gelöscht; Schalter `befundTabelle`) */}
            {EINZELNES.befundTabelle ? (
                <div className="wrap mt-[clamp(40px,5vw,72px)] lg:pb-8">
                    <Befunde />
                </div>
            ) : null}
        </section>
    );
}
