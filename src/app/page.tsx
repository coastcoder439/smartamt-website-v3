import type { Metadata } from 'next';
import Ablauf from '@/components/sections/Ablauf';
import Angebot from '@/components/sections/Angebot';
import Faq from '@/components/sections/Faq';
import Hero from '@/components/sections/Hero';
import Kontakt from '@/components/sections/Kontakt';
import Kunden from '@/components/sections/Kunden';
import Lage from '@/components/sections/Lage';
import Leistungen from '@/components/sections/Leistungen';
import Problem from '@/components/sections/Problem';
import Recht from '@/components/sections/Recht';
import Referenzen from '@/components/sections/Referenzen';
import Schulungen from '@/components/sections/Schulungen';
import Team from '@/components/sections/Team';
import Vision from '@/components/sections/Vision';
import Websites from '@/components/sections/Websites';
import Stimmen from '@/components/sections/Stimmen';
import { ABSCHNITTE, EINZELNES } from '@/lib/abschnitte';

export const metadata: Metadata = {
    alternates: { canonical: '/' },
};

/**
 * Reihenfolge der Website v3 (docs/packages/03-website-v3/PACKAGE.md, Plan Punkt 1): Hero → Problem („Was Ihre Gemeinde
 * hinter sich lässt.“, drei Zeilen) → Beweis (Websites: Vorher/Nachher mit Befund-Karten) → Angebot samt Ablauf (vier
 * Vorteile, vier Schritte) → Vertrauen (Logo-Band der Kunden, zwei Zitate, eine Zeile Identität mit Link auf „Über uns“) →
 * Kontakt. Owner 27.10.2026: „Also quasi aufgeräumter, ne, wirklich auf den Fokus auf das Wesentliche und die Selling
 * Points und den Sales legen.“
 *
 * Ausgeblendet, nicht gelöscht (Owner 26.10.2026: „Die kannst du ja alle quasi ausblenden, archivieren“): Leistungen,
 * Schulungen, Lage, Recht, Vision (seit v2); Team und Fragen stehen in v3 auf /ueber-uns und /fragen, Lage und Vision auf
 * /ueber-uns, Recht auf /fragen. Die Schalter stehen in lib/abschnitte.ts; jede Komponente erscheint an ihrer alten Stelle
 * wieder, wenn ihr Schalter auf `true` steht.
 */
export default function HomePage() {
    return (
        <>
            <Hero />
            {EINZELNES.kundenUnterHero ? <Kunden /> : null}
            <Problem />
            {ABSCHNITTE.leistungen ? <Leistungen /> : null}
            {ABSCHNITTE.websites ? <Websites /> : null}
            {ABSCHNITTE.angebot ? <Angebot /> : null}
            {ABSCHNITTE.ablauf && EINZELNES.ablaufEigenerAbschnitt ? <Ablauf /> : null}
            {ABSCHNITTE.schulungen ? <Schulungen /> : null}
            {ABSCHNITTE.lage ? <Lage /> : null}
            {ABSCHNITTE.recht ? <Recht /> : null}
            {ABSCHNITTE.vision ? <Vision /> : null}
            {!EINZELNES.kundenUnterHero ? <Kunden /> : null}
            {ABSCHNITTE.referenzen ? EINZELNES.referenzenBand ? <Referenzen /> : <Stimmen /> : null}
            {ABSCHNITTE['ueber-uns'] ? <Team /> : null}
            {ABSCHNITTE.faq ? <Faq /> : null}
            {ABSCHNITTE.kontakt ? <Kontakt /> : null}
        </>
    );
}
