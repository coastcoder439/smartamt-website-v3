'use client';

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Check } from 'lucide-react';
import { KONTAKT } from '@/lib/site';
import { ANLIEGEN, setzeAnliegen, useAnliegenWert, type AnliegenWert } from './anliegen';
import { Fehlertext, Haken, Kartengruppe, Textbereich, Texteingabe } from './formular-bausteine';
import {
    baueKontaktNutzlast,
    baueMailto,
    baueSchulungNutzlast,
    FELD_REIHENFOLGE,
    fruehesterTermin,
    GRENZEN,
    heuteIso,
    leereWerte,
    sendeAdresse,
    sendeJson,
    validiere,
    waehleSendeweg,
    ZEITFENSTER,
    type FeldName,
    type Werte,
    type Zeitfenster,
} from './kontakt-regeln';

/**
 * Das Anfrageformular.
 *
 *  - Auswahl „Ihr Anliegen“ als Optionsknöpfe (v2: „Vorschau anfragen“ und „Etwas anderes“, b3/anliegen.ts). Vorbelegt wird über lib/kontakt.ts (Hero, Angebot,
 *    Adresse `#kontakt?anliegen=…`); jede Wahl im Formular wird dorthin zurückgemeldet, damit eine
 *    spätere Vorbelegung von außen immer greift.
 *  - Prüfung im Browser (kontakt-regeln.ts). Meldungen stehen am Feld, hängen per aria-describedby
 *    daran, das Feld bekommt aria-invalid. Geprüft wird beim Verlassen eines Feldes und beim Absenden;
 *    nach dem Absenden prüft jede Eingabe sofort neu. Der erste Fehler bekommt den Fokus.
 *  - Honeypot `company_url`: ist er gefüllt, wird nichts gesendet und der Erfolg angezeigt.
 *  - Senden: KI-Fortbildung an NEXT_PUBLIC_FORM_WEBHOOK_URL, alle anderen Anliegen an
 *    NEXT_PUBLIC_CONTACT_WEBHOOK_URL, sonst bereitet der Knopf eine E-Mail vor (kontakt-regeln.ts).
 *  - Ohne JavaScript bleibt das Formular lesbar. Als Rückfall sendet es per `mailto:` im Textformat
 *    (die CSP erlaubt `form-action mailto:`), mit der Prüfung des Browsers; sobald die Seite im
 *    Browser läuft, schaltet `noValidate` auf die eigene Prüfung um.
 *  - Kein Speicher im Browser, keine Cookies.
 */

type Status = 'bereit' | 'sendet' | 'erfolg' | 'fehler';

const nichtsAbonnieren = () => () => undefined;

/** Heutiges Datum erst im Browser (auf dem Server leer), ohne Effekt und ohne Abweichung beim Hydrieren. */
function useHeute(): string {
    return useSyncExternalStore(nichtsAbonnieren, heuteIso, () => '');
}

/** false im Server-HTML und beim Hydrieren, danach true. */
function useImBrowser(): boolean {
    return useSyncExternalStore(
        nichtsAbonnieren,
        () => true,
        () => false,
    );
}

export default function KontaktFormular() {
    const kennung = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const anliegen = useAnliegenWert();
    const heute = useHeute();
    const imBrowser = useImBrowser();

    const formRef = useRef<HTMLFormElement>(null);
    const erfolgRef = useRef<HTMLDivElement>(null);
    const [werte, setWerte] = useState<Werte>(leereWerte);
    const [beruehrt, setBeruehrt] = useState<Partial<Record<FeldName, boolean>>>({});
    const [versucht, setVersucht] = useState(false);
    const [status, setStatus] = useState<Status>('bereit');

    const fehler = useMemo(() => validiere(anliegen, werte, heute), [anliegen, werte, heute]);
    const weg = waehleSendeweg(anliegen);
    const hatFehler = Object.keys(fehler).length > 0;

    const feldId = (feld: string) => `${kennung}-${feld}`;
    const zeige = (feld: FeldName) => (versucht || beruehrt[feld] ? fehler[feld] : undefined);
    const beruehre = (feld: FeldName) => () => setBeruehrt((alt) => (alt[feld] ? alt : { ...alt, [feld]: true }));
    const setze = <K extends keyof Werte>(feld: K, wert: Werte[K]) => setWerte((alt) => ({ ...alt, [feld]: wert }));

    // Nach dem Erfolg bekommt die Bestätigung den Fokus, damit Screenreader sie vorlesen.
    useEffect(() => {
        if (status === 'erfolg') erfolgRef.current?.focus();
    }, [status]);

    const waehleAnliegenAus = (wert: AnliegenWert) => {
        setzeAnliegen(wert);
        beruehre('anliegen')();
    };

    const schalteZeitfenster = (wert: Zeitfenster, an: boolean) => {
        setWerte((alt) => ({
            ...alt,
            timeSlots: an ? [...alt.timeSlots.filter((z) => z !== wert), wert] : alt.timeSlots.filter((z) => z !== wert),
        }));
        beruehre('timeSlots')();
    };

    const fokussiereErstenFehler = () => {
        const erster = FELD_REIHENFOLGE.find((feld) => fehler[feld]);
        if (!erster) return;
        formRef.current?.querySelector<HTMLElement>(`[name="${erster}"]`)?.focus();
    };

    const absenden = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === 'sendet') return;
        setVersucht(true);

        if (hatFehler || !anliegen) {
            fokussiereErstenFehler();
            return;
        }

        // Honeypot: Menschen sehen das Feld nicht. Gefüllt heißt Bot, also still „Erfolg“ melden.
        if (werte.company_url.trim() !== '') {
            setStatus('erfolg');
            return;
        }

        if (weg === 'mailto') {
            window.location.assign(baueMailto(anliegen, werte));
            return;
        }

        setStatus('sendet');
        try {
            const nutzlast = weg === 'webhook-schulung' ? baueSchulungNutzlast(werte) : baueKontaktNutzlast(anliegen, werte);
            await sendeJson(sendeAdresse(weg), nutzlast);
            setStatus('erfolg');
        } catch {
            setStatus('fehler');
        }
    };

    if (status === 'erfolg') {
        return (
            <div className="karte !rounded-[1.25rem] p-6 shadow-md sm:p-8 lg:p-10">
                <div ref={erfolgRef} tabIndex={-1} role="status">
                    <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-ok-50 text-ok">
                        <Check size={28} strokeWidth={2.5} />
                    </span>
                    <p className="mt-6 max-w-[30em] text-lead">
                        <span className="block text-h3 text-ink">Danke.</span> Ihre Anfrage ist angekommen. Wir melden
                        uns innerhalb von 24 Stunden.
                    </p>
                </div>
            </div>
        );
    }

    const knopfText = status === 'sendet' ? 'Wird gesendet …' : weg === 'mailto' ? 'E-Mail vorbereiten' : 'Anfrage senden';
    const frueherTermin = heute ? fruehesterTermin(heute) : undefined;

    return (
        <div className="karte !rounded-[1.25rem] p-6 shadow-md sm:p-8 lg:p-10">
            <form
                ref={formRef}
                method="post"
                action={`mailto:${KONTAKT.email}`}
                encType="text/plain"
                noValidate={imBrowser}
                onSubmit={absenden}
                aria-label="Anfrage an SmartAmt"
                className="relative"
            >
                <div className="grid gap-7">
                    <Kartengruppe<AnliegenWert>
                        idPrefix={feldId('anliegen')}
                        name="anliegen"
                        legende="Ihr Anliegen"
                        typ="radio"
                        optionen={ANLIEGEN}
                        gewaehlt={anliegen ? [anliegen] : []}
                        zweispaltig
                        fehler={zeige('anliegen')}
                        onWaehlen={waehleAnliegenAus}
                        onVerlassen={beruehre('anliegen')}
                    />

                    <div className="grid gap-7 sm:grid-cols-2">
                        <Texteingabe
                            id={feldId('name')}
                            name="name"
                            label="Name"
                            wert={werte.name}
                            autoComplete="name"
                            maxLength={GRENZEN.name.max}
                            fehler={zeige('name')}
                            onAendern={(w) => setze('name', w)}
                            onVerlassen={beruehre('name')}
                        />
                        <Texteingabe
                            id={feldId('organization')}
                            name="organization"
                            label="Gemeinde oder Behörde"
                            wert={werte.organization}
                            autoComplete="organization"
                            maxLength={GRENZEN.organization.max}
                            fehler={zeige('organization')}
                            onAendern={(w) => setze('organization', w)}
                            onVerlassen={beruehre('organization')}
                        />
                        <Texteingabe
                            id={feldId('email')}
                            name="email"
                            typ="email"
                            label="E-Mail"
                            wert={werte.email}
                            autoComplete="email"
                            inputMode="email"
                            maxLength={254}
                            fehler={zeige('email')}
                            onAendern={(w) => setze('email', w)}
                            onVerlassen={beruehre('email')}
                        />
                        <Texteingabe
                            id={feldId('phone')}
                            name="phone"
                            typ="tel"
                            label="Telefon"
                            wert={werte.phone}
                            autoComplete="tel"
                            inputMode="tel"
                            maxLength={GRENZEN.phone.max}
                            fehler={zeige('phone')}
                            onAendern={(w) => setze('phone', w)}
                            onVerlassen={beruehre('phone')}
                        />
                    </div>

                    {anliegen === 'website' ? (
                        <Texteingabe
                            id={feldId('website')}
                            name="website"
                            label="Adresse Ihrer Website"
                            wert={werte.website}
                            autoComplete="url"
                            inputMode="url"
                            placeholder="z. B. www.gemeinde.de"
                            maxLength={GRENZEN.website.max}
                            fehler={zeige('website')}
                            onAendern={(w) => setze('website', w)}
                            onVerlassen={beruehre('website')}
                        />
                    ) : null}

                    {anliegen === 'schulung' ? (
                        <>
                            <Texteingabe
                                id={feldId('address')}
                                name="address"
                                label="Schulungsort"
                                wert={werte.address}
                                autoComplete="off"
                                maxLength={GRENZEN.address.max}
                                fehler={zeige('address')}
                                onAendern={(w) => setze('address', w)}
                                onVerlassen={beruehre('address')}
                            />
                            <div className="grid gap-7 sm:grid-cols-2">
                                <Texteingabe
                                    id={feldId('participants')}
                                    name="participants"
                                    typ="number"
                                    label="Teilnehmende"
                                    hinweis="5 bis 35 Personen"
                                    wert={werte.participants}
                                    inputMode="numeric"
                                    min={GRENZEN.participants.min}
                                    max={GRENZEN.participants.max}
                                    step={1}
                                    autoComplete="off"
                                    fehler={zeige('participants')}
                                    onAendern={(w) => setze('participants', w)}
                                    onVerlassen={beruehre('participants')}
                                />
                                <Texteingabe
                                    id={feldId('date')}
                                    name="date"
                                    typ="date"
                                    label="Wunschtermin"
                                    hinweis="Frühestens 10 Werktage ab heute, Montag bis Freitag"
                                    wert={werte.date}
                                    min={frueherTermin}
                                    autoComplete="off"
                                    fehler={zeige('date')}
                                    onAendern={(w) => setze('date', w)}
                                    onVerlassen={beruehre('date')}
                                />
                            </div>
                            <Kartengruppe<Zeitfenster>
                                idPrefix={feldId('timeSlots')}
                                name="timeSlots"
                                legende="Zeitfenster"
                                hinweis="Mehrfachauswahl möglich"
                                typ="checkbox"
                                optionen={ZEITFENSTER}
                                gewaehlt={werte.timeSlots}
                                fehler={zeige('timeSlots')}
                                onWaehlen={schalteZeitfenster}
                                onVerlassen={beruehre('timeSlots')}
                            />
                        </>
                    ) : null}

                    <Textbereich
                        id={feldId('message')}
                        name="message"
                        label="Nachricht (optional)"
                        wert={werte.message}
                        maxLength={GRENZEN.message.max}
                        fehler={zeige('message')}
                        onAendern={(w) => setze('message', w)}
                        onVerlassen={beruehre('message')}
                    />

                    <Haken
                        id={feldId('acceptPrivacy')}
                        name="acceptPrivacy"
                        an={werte.acceptPrivacy}
                        fehler={zeige('acceptPrivacy')}
                        onAendern={(an) => setze('acceptPrivacy', an)}
                        onVerlassen={beruehre('acceptPrivacy')}
                    >
                        Ich habe die{' '}
                        <a href="/datenschutz/" target="_blank" rel="noopener" className="link font-semibold">
                            Datenschutzerklärung
                            <span className="sr-only"> (öffnet in neuem Tab)</span>
                        </a>{' '}
                        gelesen und bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verarbeitet werden.
                    </Haken>

                    {/* Honeypot: für Menschen und Hilfstechnik unsichtbar und nicht erreichbar, Bots füllen ihn aus. */}
                    <div aria-hidden="true" inert className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
                        <label htmlFor={feldId('company_url')}>Bitte nicht ausfüllen</label>
                        <input
                            id={feldId('company_url')}
                            name="company_url"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={werte.company_url}
                            onChange={(e) => setze('company_url', e.target.value)}
                        />
                    </div>

                    <div>
                        {versucht && hatFehler ? (
                            <div role="alert" className="mb-5">
                                <Fehlertext id={feldId('sammelfehler')} text="Bitte prüfen Sie die markierten Felder." />
                            </div>
                        ) : null}

                        {status === 'fehler' ? (
                            <p
                                role="alert"
                                className="mb-5 rounded-knopf border border-warn-dot bg-warn-50 px-4 py-3 font-medium leading-snug text-warn"
                            >
                                Die Anfrage ließ sich nicht senden. Rufen Sie uns bitte an unter{' '}
                                <a href={KONTAKT.telefonHref} className="link whitespace-nowrap font-semibold">
                                    {KONTAKT.telefon}
                                </a>{' '}
                                oder schreiben Sie an{' '}
                                <a href={`mailto:${KONTAKT.email}`} className="link font-semibold">
                                    {KONTAKT.email}
                                </a>
                                .
                            </p>
                        ) : null}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <button
                                type="submit"
                                className="btn btn-primary aria-disabled:cursor-wait"
                                aria-disabled={status === 'sendet' ? true : undefined}
                            >
                                {knopfText}
                            </button>
                            {weg === 'mailto' ? (
                                <p className="text-klein text-ink-3">Ihr E-Mail-Programm öffnet sich mit Ihrer Anfrage.</p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </form>

            <p className="mt-8 border-t border-line pt-6 font-mono text-klein text-ink-3">
                Keine Cookies, kein Tracking. Ihre Angaben nutzen wir nur für Ihre Anfrage.
            </p>
        </div>
    );
}
