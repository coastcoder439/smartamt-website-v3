import type { Metadata } from 'next';
import SeitenKopf from '@/components/seiten/SeitenKopf';
import SeitenSchluss from '@/components/seiten/SeitenSchluss';
import Faq from '@/components/sections/Faq';
import Recht from '@/components/sections/Recht';

export const metadata: Metadata = {
    title: 'Häufige Fragen',
    description:
        'Kosten, Ausschreibung, Inhalte, Domain, Laufzeit und Betreuung: Antworten für Gemeinden. Dazu die Vorgaben für Websites öffentlicher Stellen zu Barrierefreiheit, Datenschutz und Recht.',
    alternates: { canonical: '/fragen/' },
};

/**
 * Fragen (Website v3, Plan 03-website-v3, Punkt 3): die sechs Fragen der Startseite v2 (Faq.tsx) und der Abschnitt
 * Recht & Sicherheit (Recht.tsx: Barrierefreiheit, Datenschutz, Recht), der in v2 ausgeblendet war. Beide sind dieselben
 * Komponenten wie früher auf der Startseite; dort sind sie über lib/abschnitte.ts ausgeblendet.
 */
export default function FragenPage() {
    return (
        <>
            <SeitenKopf
                label="Fragen"
                titel="Fragen und Antworten."
                satz="Was Gemeinden vor dem Start wissen wollen: Kosten, Inhalte, Vertrag und die rechtlichen Vorgaben."
            />
            <Faq />
            <Recht weiss />
            <SeitenSchluss />
        </>
    );
}
