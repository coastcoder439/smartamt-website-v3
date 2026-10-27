import { Label } from '@/components/ui/Label';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import ReferenzBand from './c3/ReferenzBand';
import { REFERENZEN } from './c3/referenzen-daten';

/**
 * Referenzen (id referenzen), CI v3: Stimmen aus Projekten der NX7.AGENCY. Kopf mit Label, Überschrift und
 * Unterzeile; darunter die Zitat-Karten als langsam laufende, ziehbare Reihe über die ganze Breite
 * (c3/ReferenzBand.tsx). Öffentliche Hand zuerst. Die Zitate stehen wörtlich in c3/referenzen-daten.ts
 * (docs/research/current-sites.md, Abschnitt 5.3). Die Sektion selbst ist statisch.
 */
export default function Referenzen() {
    return (
        <section id="referenzen" aria-labelledby="referenzen-titel" className="section surface-soft overflow-hidden">
            <div className="wrap">
                <Label>Referenzen</Label>
                <RevealHeading as="h2" id="referenzen-titel" className="mt-4 max-w-[16em]">
                    Was Kunden über unsere Arbeit sagen.
                </RevealHeading>
                <RevealText className="mt-6 max-w-[36em] text-lead">
                    Stimmen aus Projekten der NX7.AGENCY, von der Kommune bis zum Mittelstand.
                </RevealText>
            </div>

            <ReferenzBand eintraege={REFERENZEN} />
        </section>
    );
}
