import type { Metadata } from 'next';
import LegalPage from '@/components/layout/LegalPage';
import { KONTAKT } from '@/lib/site';

export const metadata: Metadata = {
    title: 'Barrierefreiheit',
    alternates: { canonical: '/barrierefreiheit/' },
};

// Text wörtlich aus docs/packages/01-smartamt-website/design/legal-texts.md („/barrierefreiheit/“).
//
// Das Prüfergebnis trägt der Orchestrator nach der Prüfung ein: hier als Satz eintragen, er erscheint dann
// hinter dem Satz zu den WCAG. Solange die Konstante leer ist, steht auf der Seite nichts davon (kein
// Platzhalter).
const PRUEFERGEBNIS: string = '';

export default function BarrierefreiheitPage() {
    return (
        <LegalPage titel="Barrierefreiheit">
            <p>
                SmartAmt setzt sich für barrierefreie Websites ein, auch bei der eigenen. Als privates Unternehmen sind
                wir dazu gesetzlich nicht verpflichtet. Wir halten uns trotzdem freiwillig an die Anforderungen, die für
                öffentliche Stellen gelten.
            </p>

            <h2>Stand der Vereinbarkeit</h2>
            <p>
                Diese Website wurde nach den Web Content Accessibility Guidelines (WCAG) 2.1, Stufe AA, gestaltet.
                {PRUEFERGEBNIS ? ` ${PRUEFERGEBNIS}` : null}
            </p>

            <h2>Bewegung</h2>
            <p>
                Animationen auf dieser Seite folgen Ihrer Systemeinstellung. Wenn Sie in Ihrem Betriebssystem „Bewegung
                reduzieren“ eingeschaltet haben, zeigen wir alle Inhalte ohne Animation.
            </p>

            <h2>Rückmeldung</h2>
            <p>
                Ist Ihnen eine Barriere aufgefallen? Schreiben Sie uns an{' '}
                <a href={`mailto:${KONTAKT.email}`}>{KONTAKT.email}</a> oder rufen Sie an unter{' '}
                <a href={KONTAKT.telefonHref}>{KONTAKT.telefonInternational}</a>. Wir antworten innerhalb von 24 Stunden.
            </p>

            <p>Stand dieser Erklärung: Oktober 2026</p>
        </LegalPage>
    );
}
