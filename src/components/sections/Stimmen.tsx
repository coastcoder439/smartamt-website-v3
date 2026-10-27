import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RevealText } from '@/components/ui/Reveal';
import { Staffel } from './b3/Staffel';
import { Karte } from './c3/ReferenzBand';
import { REFERENZEN } from './c3/referenzen-daten';

/**
 * Stimmen (id referenzen), Website v3, Teil „Vertrauen“ (Plan 03-website-v3, Punkt 1e): direkt unter dem Logo-Band der
 * Kunden (Kunden.tsx) stehen zwei Kundenzitate der öffentlichen Hand nebeneinander, statt des laufenden Bandes mit sieben
 * Zitaten (Referenzen.tsx, ausgeblendet über EINZELNES.referenzenBand). Darunter die eine Zeile Identität mit dem Link auf
 * „Über uns“ (Owner 27.10.2026: „Und ein ganz bisschen nur die Identität von SmartAmt.“).
 *
 * Die Zitate stehen wörtlich in c3/referenzen-daten.ts (Beleg docs/research/current-sites.md, Abschnitt 5.3); die Karte ist
 * dieselbe wie im Band (c3/ReferenzBand.tsx, Karte). Die Karten schweben gestaffelt herein (b3/Staffel.tsx).
 */
const OEFFENTLICH = REFERENZEN.filter((r) => r.oeffentlich).slice(0, 2);

export default function Stimmen() {
    return (
        <section id="referenzen" aria-label="Kundenstimmen" className="pb-[clamp(3.5rem,5vw,4.5rem)] pt-2">
            <div className="wrap">
                <Staffel as="div" kinder=":scope > figure" className="grid gap-4 md:grid-cols-2 md:gap-5">
                    {OEFFENTLICH.map((r) => (
                        <Karte
                            key={r.name}
                            e={r}
                            klasse="flex flex-col [&>blockquote]:mb-6 [&>blockquote]:text-[1.125rem] [&>figcaption]:mt-auto"
                        />
                    ))}
                </Staffel>

                <RevealText className="mx-auto mt-8 max-w-[44em] text-center text-lead text-ink-2 md:mt-10">
                    SmartAmt ist ein Projekt der NX7.AGENCY aus Leipzig. Unser Ziel: Bürgerinnen und Bürger finden sich auf jeder
                    Gemeinde-Website zurecht.{' '}
                    <Link href="/ueber-uns/" className="link inline-flex items-center gap-1 whitespace-nowrap font-semibold text-ink">
                        Über uns
                        <ArrowRight aria-hidden="true" size="1em" strokeWidth={1.75} />
                    </Link>
                </RevealText>
            </div>
        </section>
    );
}
