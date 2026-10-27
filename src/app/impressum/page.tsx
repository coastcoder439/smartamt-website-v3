import type { Metadata } from 'next';
import LegalPage from '@/components/layout/LegalPage';
import { KONTAKT } from '@/lib/site';

export const metadata: Metadata = {
    title: 'Impressum',
    alternates: { canonical: '/impressum/' },
};

// Text wörtlich aus docs/packages/01-smartamt-website/design/legal-texts.md („/impressum/“).
export default function ImpressumPage() {
    return (
        <LegalPage titel="Impressum">
            <h2>Angaben gemäß § 5 DDG</h2>
            <address>
                Tobias Steffen
                <br />
                {KONTAKT.strasse}
                <br />
                {KONTAKT.plz} {KONTAKT.ort}
            </address>
            <p>
                SmartAmt ist ein Projekt der NX7.AGENCY und wird über das Einzelunternehmen von Tobias Steffen betrieben.
            </p>

            <h2>Kontakt</h2>
            <p>
                Telefon: <a href={KONTAKT.telefonHref}>{KONTAKT.telefonInternational}</a>
                <br />
                E-Mail: <a href={`mailto:${KONTAKT.email}`}>{KONTAKT.email}</a>
            </p>

            <h2>Umsatzsteuer-Identifikationsnummer</h2>
            <p>gemäß § 27a Umsatzsteuergesetz: DE305821623</p>

            <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p>Tobias Steffen, Anschrift wie oben</p>
        </LegalPage>
    );
}
