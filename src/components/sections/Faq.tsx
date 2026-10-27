import { Phone } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';
import { EINZELNES } from '@/lib/abschnitte';
// v3: Die Nummer in der Seitenleiste ist das Festnetz (KONTAKT); Leons Handynummer steht nur beim Ansprechpartner im Kontakt.
import { KONTAKT } from '@/lib/site';
import WebsiteKnopf from './b2/WebsiteKnopf';
import { Staffel } from './b3/Staffel';
import { AkkordeonKarte } from './c3/Akkordeon';

/**
 * Häufige Fragen (id faq), CI v3: helle Akkordeon-Karten (c3/Akkordeon.tsx) aus echten <details>/<summary>.
 * Das ist ohne JavaScript bedienbar und von Haus aus tastaturbedienbar (Tab zur Frage, Enter oder Leertaste
 * klappt auf und zu, der Fokus ist über die globale :focus-visible-Regel sichtbar). Das Plus dreht sich beim
 * Öffnen zum Minus. Jede Frage lässt sich einzeln öffnen, es gibt keine Gruppe, die andere schließt; die
 * erste steht offen. Links bleibt die Überschrift beim Scrollen stehen (ab 1024 px) und trägt darunter die
 * direkten Wege: den Knopf „Vorschau anfragen“ (springt zum Kontakt, setzt das Anliegen) und Leons Telefonnummer.
 *
 * Website v2 (Entscheidung 10): sechs Fragen ohne KI und Schulungen, Antworten nach den Angebotsfakten
 * (bauauftrag-v2.md). Die Fragen zu KI und Schulungen bleiben als Thema „schulung“ im Code und erscheinen wieder, wenn
 * `EINZELNES.faqSchulung` in lib/abschnitte.ts auf `true` steht; „archiv“ ist die frühere Frage „Wer steht hinter
 * SmartAmt?“ (steht in „Über uns“).
 *
 * Die Karten schweben gestaffelt herein (Staffel.tsx); das Server-HTML ist der Endzustand.
 */

type Thema = 'website' | 'schulung' | 'archiv';

const FRAGEN: readonly { frage: string; antwort: string; thema: Thema }[] = [
    {
        thema: 'website',
        frage: 'Was kostet die Website?',
        antwort:
            'Feste Jahreslizenz plus einmalige Einrichtung, beide Beträge vorher fest. Ihr Angebot kommt mit der kostenlosen Vorschau.',
    },
    {
        thema: 'website',
        frage: 'Müssen wir das ausschreiben?',
        antwort:
            'In der Regel nicht: kleiner, fester Auftragswert, meist direkt vergebbar. Landesregeln und Ihre Vergaberegel klären wir vorab mit Ihnen (keine Rechtsberatung).',
    },
    {
        thema: 'website',
        frage: 'Was passiert mit unseren Inhalten?',
        antwort:
            'Wir übernehmen Texte, Bekanntmachungen, Bilder und Dokumente; die Vorschau zeigt sie schon. Wünsche besprechen wir bei der Einrichtung, größere Änderungen nach Aufwand, vorher abgesprochen.',
    },
    {
        thema: 'website',
        frage: 'Wem gehören Inhalte und Domain?',
        antwort:
            'Ihnen. Texte, Bilder, Daten und Domain bleiben bei der Gemeinde. Zum Vertragsende bekommen Sie alles in offenen Formaten zurück.',
    },
    {
        thema: 'website',
        frage: 'Wie lange binden wir uns?',
        antwort:
            'Zwölf Monate ab Livegang, per E-Mail kündbar mit drei Monaten Frist. Keine Rückbaukosten, keine Herausgabegebühr.',
    },
    {
        thema: 'website',
        frage: 'Wer kümmert sich nach dem Livegang?',
        antwort:
            'Wir: Updates, Sicherheit und Hosting sind in der Lizenz enthalten. Inhalte pflegen Sie selbst oder schicken sie uns per E-Mail. Die alte Seite läuft bis zum Livegang weiter, danach leiten alte Adressen auf die neue.',
    },
    // ---- ausgeblendet in v2, nicht gelöscht ----
    {
        thema: 'schulung',
        frage: 'Was kostet die KI-Fortbildung?',
        antwort:
            '1.800 € zzgl. 19 % MwSt. für die komplette Fortbildung mit drei Modulen und drei Stunden, danach eine Stunde Einzelberatung. Der Preis gilt unabhängig von der Teilnehmerzahl.',
    },
    {
        thema: 'schulung',
        frage: 'Gibt es eine Anfahrtspauschale?',
        antwort:
            'Im Umkreis von 100 km um Leipzig ist die Anfahrt inklusive. Bei weiteren Entfernungen nennen wir eine eventuelle Pauschale vorab im Angebot.',
    },
    {
        thema: 'schulung',
        frage: 'Was brauchen Sie bei uns vor Ort?',
        antwort: 'Einen Raum mit Beamer oder Bildschirm und WLAN. Die Unterlagen bringen wir mit.',
    },
    {
        thema: 'schulung',
        frage: 'Wie schnell kann es losgehen?',
        antwort:
            'Auf Anfragen antworten wir innerhalb von 24 Stunden. Termine für die Fortbildung sind in der Regel ab 10 Werktagen im Voraus möglich.',
    },
    {
        thema: 'schulung',
        frage: 'Ist die Fortbildung datenschutzkonform?',
        antwort:
            'Ja. Wir zeigen ausschließlich Werkzeuge und Methoden, die sich datenschutzkonform in der Verwaltung einsetzen lassen.',
    },
    {
        thema: 'archiv',
        frage: 'Wer steht hinter SmartAmt?',
        antwort: 'SmartAmt ist ein Projekt der NX7.AGENCY von Tobias Steffen in Leipzig.',
    },
];

const SICHTBARE_FRAGEN = FRAGEN.filter((f) => f.thema === 'website' || (f.thema === 'schulung' && EINZELNES.faqSchulung));

export default function Faq() {
    return (
        <section id="faq" aria-labelledby="faq-titel" className="section surface-soft">
            <div className="wrap">
                <div className="grid-12 gap-y-10">
                    <div className="col-span-12 lg:col-span-4">
                        <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
                            <Label>Häufige Fragen</Label>
                            <RevealHeading as="h2" id="faq-titel" className="mt-4">
                                Kurz beantwortet.
                            </RevealHeading>
                            <RevealText as="div" className="mt-8 flex flex-col items-start gap-3">
                                <WebsiteKnopf label="Vorschau anfragen" />
                                <a
                                    href={KONTAKT.telefonHref}
                                    className="group/tel inline-flex min-h-[2.75rem] items-center gap-3 font-medium text-ink"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-bg text-brand-ink shadow-sm transition-colors group-hover/tel:border-brand"
                                    >
                                        <Phone size={18} strokeWidth={1.75} />
                                    </span>
                                    <span>
                                        <span className="block font-mono text-label uppercase text-ink-3">Telefon</span>
                                        <span className="link">{KONTAKT.telefon}</span>
                                    </span>
                                </a>
                            </RevealText>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-8">
                        <Staffel kinder=":scope > details" className="grid gap-3">
                            {SICHTBARE_FRAGEN.map((eintrag, index) => (
                                <AkkordeonKarte
                                    key={eintrag.frage}
                                    offen={index === 0}
                                    kopf={<h3 className="pt-1.5 text-[1.125rem] font-semibold leading-snug sm:text-[1.25rem]">{eintrag.frage}</h3>}
                                >
                                    <p className="max-w-[58ch] sm:pr-14">{eintrag.antwort}</p>
                                </AkkordeonKarte>
                            ))}
                        </Staffel>
                    </div>
                </div>
            </div>
        </section>
    );
}
