import type { Metadata } from 'next';
import SeitenKopf from '@/components/seiten/SeitenKopf';
import SeitenSchluss from '@/components/seiten/SeitenSchluss';
import Lage from '@/components/sections/Lage';
import Leitbild from '@/components/sections/Leitbild';
import Team from '@/components/sections/Team';
import Vision from '@/components/sections/Vision';
import Deutschlandkarte from '@/components/sections/ueber/Deutschlandkarte';

export const metadata: Metadata = {
    title: 'Über uns',
    description:
        'SmartAmt digitalisiert Gemeinden, Ämter und Behörden: Websites, auf denen sich Bürgerinnen und Bürger überall zurechtfinden. Vorbild sind Dänemark und Estland. Ein Projekt der NX7.AGENCY aus Leipzig.',
    alternates: { canonical: '/ueber-uns/' },
};

/**
 * Über uns (Website v3, Plan 03-website-v3, Punkt 2): Identität von SmartAmt auf einer eigenen Seite. Owner 27.10.2026:
 * „Oder vielleicht das Ganze halt auch besser aufteilen mit auf Unterseiten einfach, so eine schöne Landingpage, dann
 * Mission, dann wer sind wir, etc.“
 *
 * Reihenfolge (Owner 27.10.2026: „also wir bereiten den Weg zum einheitlichen Start, dann einmal so dieses für Gemeinde zur
 * digitalen Verwaltung, dann dieses jetzt Platz 12 und dann unsere 5 Versprechen und dann wie Deutschland halt auf Platz 1
 * kommt mit dieser Kartenvisualisierung und dann unser Dings.“): Kopf → Mission (Vision.tsx, „Gemeinde für Gemeinde zur
 * digitalen Verwaltung.“) → Lage (Platz 12, UN-Ranking 2024, Lage.tsx) → Leitbild (fünf Versprechen) → Deutschlandkarte (Ziel
 * Platz 1, ueber/Deutschlandkarte.tsx) → Team (Tobias und Leon, Texte unverändert aus c3/personen.ts, mit der NX7.AGENCY) →
 * Schluss mit Knopf. Vision, Lage und Team sind dieselben Komponenten wie früher auf
 * der Startseite; dort sind sie über lib/abschnitte.ts ausgeblendet.
 */
export default function UeberUnsPage() {
    return (
        <>
            <SeitenKopf
                label="Über uns"
                titel="Wir bereiten den Weg zum einheitlichen digitalen Staat."
                satz="SmartAmt digitalisiert Gemeinden, Ämter und Behörden in Deutschland, dort, wo Bürgerinnen und Bürger sie erleben."
            />
            <Vision />
            <Lage />
            <Leitbild />
            <Deutschlandkarte />
            <Team />
            <SeitenSchluss />
        </>
    );
}
