import type { Metadata } from 'next';
import LegalPage from '@/components/layout/LegalPage';
import { EINZELNES } from '@/lib/abschnitte';
import { KONTAKT } from '@/lib/site';

export const metadata: Metadata = {
    title: 'Datenschutzerklärung',
    alternates: { canonical: '/datenschutz/' },
};

// Text wörtlich aus docs/packages/01-smartamt-website/design/legal-texts.md („/datenschutz/“).
//
// Der Abschnitt „Hosting und Server-Protokolle“ hat zwei Fassungen. Die Build-Variable
// NEXT_PUBLIC_HOSTING wählt: `hetzner` ist Standard (Live-Betrieb auf Tobis Server), `vercel` gilt für
// die Vorschau auf Vercel. Jeder andere Wert und eine leere Variable ergeben `hetzner`.
const HOSTING: 'hetzner' | 'vercel' = process.env.NEXT_PUBLIC_HOSTING === 'vercel' ? 'vercel' : 'hetzner';

// Website v2: Die Schulungs-Anliegen sind ausgeblendet (lib/abschnitte.ts). Solange beide aus sind, nennt Abschnitt 4 nur
// die Felder, die das Formular wirklich abfragt; der Wortlaut für die Schulungsfelder bleibt hier im Code.
const SCHULUNGSFELDER = EINZELNES.anliegenSchulung || EINZELNES.anliegenItSchulung;

function HostingAbschnitt() {
    if (HOSTING === 'vercel') {
        return (
            <p>
                Die Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet. Beim Aufruf
                der Seiten verarbeitet Vercel technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit, aufgerufene
                Adresse, übertragene Datenmenge und Browser-Kennung, um die Website auszuliefern und vor Missbrauch zu
                schützen. Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und stabilen Betrieb (Art. 6
                Abs. 1 lit. f DSGVO). Vercel ist nach dem EU-US Data Privacy Framework zertifiziert; die Übermittlung in
                die USA stützt sich auf den Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO). Mit Vercel besteht
                ein Vertrag zur Auftragsverarbeitung.
            </p>
        );
    }
    return (
        <p>
            Die Website wird auf einem Server der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, in einem
            Rechenzentrum in Deutschland gehostet. Beim Aufruf der Seiten verarbeitet der Server technisch notwendige Daten
            wie IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, übertragene Datenmenge und Browser-Kennung, um die
            Website auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist unser berechtigtes Interesse an einem
            sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Mit Hetzner besteht ein Vertrag zur
            Auftragsverarbeitung.
        </p>
    );
}

// Die Überschrift trägt einen unsichtbaren Trennstrich (U+00AD) nach „Datenschutz“: Auf Telefonen ab 320 px
// Breite passt das lange Wort sonst nicht in die Zeile. Auf breiten Fenstern ist er nicht zu sehen.
const TITEL = 'Datenschutz­erklärung';

export default function DatenschutzPage() {
    return (
        <LegalPage titel={TITEL}>
            <p>Stand: Oktober 2026</p>

            <h2>1. Verantwortlicher</h2>
            <p>
                Tobias Steffen, {KONTAKT.strasse}, {KONTAKT.plz} {KONTAKT.ort}
                <br />
                Telefon: <a href={KONTAKT.telefonHref}>{KONTAKT.telefonInternational}</a> · E-Mail:{' '}
                <a href={`mailto:${KONTAKT.email}`}>{KONTAKT.email}</a>
            </p>

            <h2>2. Das Wichtigste in Kürze</h2>
            <p>
                Diese Website setzt keine Cookies, verwendet kein Tracking und keine Analyse-Werkzeuge und lädt keine
                Inhalte von fremden Servern. Schriften liegen auf unserem eigenen Server. Personenbezogene Daten
                verarbeiten wir nur, wenn Sie uns schreiben, anrufen oder das Anfrageformular nutzen, und nur, um Ihre
                Anfrage zu bearbeiten.
            </p>

            <h2>3. Hosting und Server-Protokolle</h2>
            <HostingAbschnitt />

            <h2>4. Anfrageformular</h2>
            <p>
                Wenn Sie das Formular nutzen, verarbeiten wir die Angaben, die Sie eintragen: Name, Gemeinde oder Behörde,
                E-Mail, Telefon, Ihr Anliegen, Ihre Nachricht und je nach Anliegen die Adresse Ihrer Website
                {SCHULUNGSFELDER ? ' oder Schulungsort, Teilnehmerzahl, Wunschtermin und Zeitfenster' : null}. Die
                Angaben werden verschlüsselt an einen vom
                Verantwortlichen betriebenen Server bei der Hetzner Online GmbH in Deutschland übermittelt und dort
                verarbeitet, um Ihre Anfrage zu beantworten und Ihnen ein Angebot zu erstellen. Rechtsgrundlage ist die
                Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage (Art. 6 Abs. 1 lit. b DSGVO) sowie Ihre
                Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit mit Wirkung für die Zukunft widerrufen können.
                Wir löschen die Daten, wenn Ihre Anfrage abschließend bearbeitet ist, soweit keine gesetzlichen
                Aufbewahrungspflichten bestehen.
            </p>

            <h2>5. Kontakt per E-Mail oder Telefon</h2>
            <p>
                Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben, um Ihr Anliegen zu
                bearbeiten (Art. 6 Abs. 1 lit. b DSGVO, bei sonstigen Anliegen Art. 6 Abs. 1 lit. f DSGVO). Bereitet das
                Formular eine E-Mail vor, öffnet sich Ihr eigenes E-Mail-Programm; gesendet wird erst, wenn Sie dort auf
                Senden klicken.
            </p>

            <h2>6. Links zu anderen Websites</h2>
            <p>
                Wir verlinken auf die Website der NX7.AGENCY, auf die Website von Tobias Steffen (tobiassteffen.com) und auf den Terminbuchungsdienst Cal.com. Erst wenn Sie einen
                solchen Link anklicken, verlassen Sie unsere Website. Dann gilt die Datenschutzerklärung des jeweiligen
                Anbieters.
            </p>

            <h2>7. Ihre Rechte</h2>
            <p>
                Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17),
                Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen
                Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21). Eine Einwilligung können Sie jederzeit
                widerrufen (Art. 7 Abs. 3). Schreiben Sie dafür an <a href={`mailto:${KONTAKT.email}`}>{KONTAKT.email}</a>.
                Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO).
            </p>

            <h2>8. Verschlüsselung</h2>
            <p>Diese Website wird ausschließlich über eine verschlüsselte Verbindung (HTTPS) ausgeliefert.</p>
        </LegalPage>
    );
}
