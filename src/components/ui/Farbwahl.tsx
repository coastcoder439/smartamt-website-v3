'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { klasseVon, LOGO_HEUTE, LOGO_IDS, LOGO_KLASSEN, LOGO_STANDARD } from '@/lib/logos';

/**
 * Farbwahl: ein Werkzeug für Tobi und für den Vergleich, keine Funktion für Besucher.
 *
 * Ein kleiner runder Schalter unten links (Palette-Symbol, „Farben“ als Tooltip und für Hilfstechnik) öffnet ein
 * kompaktes Feld mit den vier Farbvarianten der Marke: Farbfleck, Name, die aktuelle ist markiert. Ein Klick
 * schaltet die Markenfarbe der ganzen Seite sofort um. Das Feld ist eine Radiogruppe mit Beschriftung (Pfeiltasten
 * wählen live), der Schalter trägt aria-expanded und aria-controls; Escape schließt und gibt den Fokus an den
 * Schalter zurück, ein Klick daneben oder Tab aus dem Feld schließt ebenfalls.
 *
 * Wo die Wahl steckt: nur in der Adresse (?farbe=orange | hellblau | violett | gruen). Beim Wechsel setzt
 * history.replaceState die Adresse neu (Orange ist der Standard und lässt den Parameter weg); beim Laden setzt das
 * kleine Skript im Kopf von app/layout.tsx data-farbe am html-Element, noch vor dem ersten Bild. Es gibt weder
 * Cookies noch Speicher im Browser und keinen Aufruf nach außen: Tobi kann einen Link mit seiner Farbe verschicken.
 *
 * Die Farben selbst stehen nur in styles/globals.css (Blöcke [data-farbe='…']); der Farbfleck trägt data-farbe und
 * bekommt dadurch die Tokens seiner Variante, ohne einen Wert zu wiederholen.
 *
 * Logo-Wahl im selben Feld (Owner 27.10.2026: „Es soll somit hier Logo und dann Varianten“): erst das Logo (Radiogruppe),
 * dann dessen Varianten (zweite Radiogruppe, nur wenn es mehr als eine gibt); ein neues Logo startet mit seiner
 * Hauptvariante. Die Wahl steht ebenso nur in der Adresse (?logo=…; der Standard aus lib/logos.ts lässt den Parameter weg) und
 * am html-Element (data-logo). Die Liste steht in lib/logos.ts.
 *
 * Ein-/ausgeblendet wird die Farbwahl über EINZELNES.farbwahl in lib/abschnitte.ts (layout.tsx); bei false steht
 * davon nichts im HTML. Lage: z-40, also über dem Inhalt (und dem schwebenden Anrufknopf, z-30), aber unter der
 * Kopfzeile samt geöffnetem Menü (z-50). Auf Fenstern unter 1400 px Breite weicht der Schalter aus, solange Kontakt
 * oder Fuß im Bild sind, damit er Formular und Fuß nie verdeckt. Bewegung nur mit transform und opacity und nur ohne
 * reduzierte Bewegung (globals.css).
 */

export type FarbId = 'orange' | 'hellblau' | 'violett' | 'gruen';

/** Die vier Varianten. Muss mit dem Skript im Kopf (layout.tsx) und den Blöcken data-farbe in globals.css übereinstimmen. */
export const FARBEN: ReadonlyArray<{ id: FarbId; name: string; hinweis: string }> = [
    { id: 'orange', name: 'Orange', hinweis: 'Standard der Marke' },
    { id: 'hellblau', name: 'Hellblau', hinweis: 'Himmel, freundlich und hell' },
    { id: 'violett', name: 'Violett', hinweis: 'Die Farbe von Tobis Seite' },
    { id: 'gruen', name: 'Grün', hinweis: 'Ruhiges Gemeinde-Grün' },
];

const PARAMETER = 'farbe';
const SCHMAL = '(max-width: 1399px)';

/** Die Variante, die das Skript im Kopf (oder ein Klick) am html-Element gesetzt hat; sonst Orange. */
function liesFarbe(): FarbId {
    const wert = document.documentElement.getAttribute('data-farbe');
    const treffer = FARBEN.find((f) => f.id === wert);
    return treffer ? treffer.id : 'orange';
}

// Die Wahl lebt am html-Element (data-farbe), nicht im React-Zustand: Das Skript im Kopf setzt sie vor dem ersten Bild,
// ein Klick setzt sie neu und meldet es mit diesem Ereignis. useSyncExternalStore liest sie ohne Zustand im Effekt;
// der Server und das erste Rendern beim Hydrieren kennen die Wahl nicht und zeigen Orange.
const AENDERUNG = 'farbwahl:aenderung';
function abonniere(melden: () => void) {
    window.addEventListener(AENDERUNG, melden);
    return () => window.removeEventListener(AENDERUNG, melden);
}
function serverFarbe(): FarbId {
    return 'orange';
}

/** Die Logo-Variante am html-Element (Skript im Kopf oder Klick); sonst der Standard (lib/logos.ts). */
const LOGO_PARAMETER = 'logo';
const LOGO_AENDERUNG = 'logowahl:aenderung';
function liesLogo(): string {
    const wert = document.documentElement.getAttribute('data-logo') ?? '';
    return LOGO_IDS.includes(wert) ? wert : LOGO_STANDARD;
}
function serverLogo(): string {
    return LOGO_STANDARD;
}
function abonniereLogo(melden: () => void) {
    window.addEventListener(LOGO_AENDERUNG, melden);
    return () => window.removeEventListener(LOGO_AENDERUNG, melden);
}

/** Schreibt eine Wahl in die Adresse (replaceState, kein neuer Eintrag im Verlauf). Der Standard lässt den Parameter weg. */
function schreibeAdresse(parameter: string, wert: string, standard: string) {
    try {
        const url = new URL(window.location.href);
        if (wert === standard) url.searchParams.delete(parameter);
        else url.searchParams.set(parameter, wert);
        const neu = url.pathname + url.search + url.hash;
        const alt = window.location.pathname + window.location.search + window.location.hash;
        if (neu !== alt) window.history.replaceState(window.history.state, '', neu);
    } catch {
        // Die Adresse bleibt, wie sie ist; die Farbe gilt trotzdem.
    }
}

export default function Farbwahl() {
    const pfad = usePathname();
    const wurzelRef = useRef<HTMLDivElement>(null);
    const knopfRef = useRef<HTMLButtonElement>(null);
    const feldRef = useRef<HTMLDivElement>(null);
    const [offen, setOffen] = useState(false);
    const farbe = useSyncExternalStore(abonniere, liesFarbe, serverFarbe);
    const logo = useSyncExternalStore(abonniereLogo, liesLogo, serverLogo);
    const logoKlasse = klasseVon(logo);
    const [ausweichen, setAusweichen] = useState(false);

    // Nach einem Seitenwechsel innerhalb der Seite die Wahl wieder in die Adresse schreiben, damit ein kopierter Link stimmt.
    useEffect(() => {
        if (farbe !== 'orange') schreibeAdresse(PARAMETER, farbe, 'orange');
        if (logo !== LOGO_STANDARD) schreibeAdresse(LOGO_PARAMETER, logo, LOGO_STANDARD);
    }, [pfad, farbe, logo]);

    // Offen: Fokus auf die gewählte Farbe; Escape schließt und gibt den Fokus zurück; ein Klick daneben schließt.
    useEffect(() => {
        if (!offen) return;
        const bild = window.requestAnimationFrame(() =>
            feldRef.current?.querySelector<HTMLInputElement>('input:checked')?.focus(),
        );
        const beiTaste = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOffen(false);
                knopfRef.current?.focus();
            }
        };
        const beiZeiger = (e: PointerEvent) => {
            if (wurzelRef.current && !wurzelRef.current.contains(e.target as Node)) setOffen(false);
        };
        window.addEventListener('keydown', beiTaste);
        document.addEventListener('pointerdown', beiZeiger);
        return () => {
            window.cancelAnimationFrame(bild);
            window.removeEventListener('keydown', beiTaste);
            document.removeEventListener('pointerdown', beiZeiger);
        };
    }, [offen]);

    // Schmale Fenster: ausweichen, solange Kontakt (Formular) oder Fuß im Bild sind. Direkt über den Beobachter, ohne Messen im Scroll.
    useEffect(() => {
        const schmal = window.matchMedia(SCHMAL);
        const ziele = [document.getElementById('kontakt'), document.querySelector('footer')].filter(
            (el): el is HTMLElement => el !== null,
        );
        const belegt = new Map<Element, boolean>();
        const pruefen = () => setAusweichen(schmal.matches && Array.from(belegt.values()).some(Boolean));
        const beobachter = new IntersectionObserver((eintraege) => {
            for (const e of eintraege) belegt.set(e.target, e.isIntersecting);
            pruefen();
        });
        for (const el of ziele) beobachter.observe(el);
        schmal.addEventListener('change', pruefen);
        return () => {
            beobachter.disconnect();
            schmal.removeEventListener('change', pruefen);
        };
    }, [pfad]);

    const waehle = (neu: FarbId) => {
        document.documentElement.setAttribute('data-farbe', neu);
        window.dispatchEvent(new Event(AENDERUNG));
        schreibeAdresse(PARAMETER, neu, 'orange');
    };

    const waehleLogo = (neu: string) => {
        document.documentElement.setAttribute('data-logo', neu);
        window.dispatchEvent(new Event(LOGO_AENDERUNG));
        schreibeAdresse(LOGO_PARAMETER, neu, LOGO_STANDARD);
    };

    // Tab aus dem Feld heraus schließt es (der Fokus geht dabei auf ein anderes Element; ohne Ziel bleibt es offen).
    const beiFokusVerlust = (e: React.FocusEvent<HTMLDivElement>) => {
        const ziel = e.relatedTarget as Node | null;
        if (offen && ziel && !e.currentTarget.contains(ziel)) setOffen(false);
    };

    return (
        <div
            ref={wurzelRef}
            data-verdeckt={ausweichen && !offen ? 'true' : 'false'}
            className="farbwahl fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-40"
            onBlur={beiFokusVerlust}
        >
            <div id="farbwahl-feld" ref={feldRef} tabIndex={-1} data-offen={offen ? 'true' : 'false'} className="farbwahl-panel">
                <fieldset>
                    <legend className="mb-2.5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink-3">
                        Markenfarbe
                    </legend>
                    <div className="grid gap-1.5">
                        {FARBEN.map((f) => {
                            const an = farbe === f.id;
                            const inputId = `farbe-${f.id}`;
                            return (
                                <div key={f.id} className="relative">
                                    <input
                                        id={inputId}
                                        type="radio"
                                        name="markenfarbe"
                                        value={f.id}
                                        checked={an}
                                        onChange={() => waehle(f.id)}
                                        className="peer sr-only"
                                    />
                                    <label
                                        htmlFor={inputId}
                                        className={cn(
                                            'flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors',
                                            'peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-ink',
                                            an ? 'border-brand bg-brand-50' : 'border-line bg-bg hover:border-line-2 hover:bg-bg-2',
                                        )}
                                    >
                                        <span className="farbfleck" data-farbe={f.id} aria-hidden="true" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[0.9375rem] font-semibold leading-tight text-ink">{f.name}</span>
                                            <span className="mt-0.5 block text-[0.8125rem] leading-tight text-ink-3">{f.hinweis}</span>
                                        </span>
                                        {an ? <Check aria-hidden="true" size={18} strokeWidth={2.25} className="flex-none text-brand-ink" /> : null}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
                <fieldset className="mt-4">
                    <legend className="mb-2.5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink-3">
                        Logo
                    </legend>
                    <div className="grid grid-cols-2 gap-1.5">
                        {LOGO_KLASSEN.map((k) => {
                            const an = logoKlasse.id === k.id;
                            const inputId = `logo-${k.id}`;
                            return (
                                <div key={k.id} className="relative">
                                    <input
                                        id={inputId}
                                        type="radio"
                                        name="logo"
                                        value={k.id}
                                        checked={an}
                                        onChange={() => waehleLogo(k.varianten[0].id)}
                                        className="peer sr-only"
                                    />
                                    <label
                                        htmlFor={inputId}
                                        title={k.hinweis}
                                        className={cn(
                                            'flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-colors',
                                            'peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-ink',
                                            an ? 'border-brand bg-brand-50' : 'border-line bg-bg hover:border-line-2 hover:bg-bg-2',
                                        )}
                                    >
                                        <span className="logo grid h-8 w-8 flex-none place-items-center" aria-hidden="true">
                                            {k.id === LOGO_HEUTE ? (
                                                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                                            ) : (
                                                <svg viewBox="0 0 64 64" className="h-8 w-8" focusable="false">
                                                    <use href={`#lz-${k.varianten[0].id}`} />
                                                </svg>
                                            )}
                                        </span>
                                        <span className="min-w-0 text-[0.875rem] font-semibold leading-tight text-ink">{k.name}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
                {logoKlasse.varianten.length > 1 ? (
                    <fieldset className="mt-3">
                        <legend className="mb-2 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink-3">
                            Variante
                        </legend>
                        <div className="flex flex-wrap gap-1.5">
                            {logoKlasse.varianten.map((v, i) => {
                                const an = logo === v.id;
                                const inputId = `logo-variante-${v.id}`;
                                return (
                                    <div key={v.id} className="relative">
                                        <input
                                            id={inputId}
                                            type="radio"
                                            name="logo-variante"
                                            value={v.id}
                                            checked={an}
                                            onChange={() => waehleLogo(v.id)}
                                            className="peer sr-only"
                                        />
                                        <label
                                            htmlFor={inputId}
                                            className={cn(
                                                'flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-1 transition-colors',
                                                'peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-ink',
                                                an ? 'border-brand bg-brand-50' : 'border-line bg-bg hover:border-line-2 hover:bg-bg-2',
                                            )}
                                        >
                                            <span className="logo" aria-hidden="true">
                                                <svg viewBox="0 0 64 64" className="h-7 w-7" focusable="false">
                                                    <use href={`#lz-${v.id}`} />
                                                </svg>
                                            </span>
                                            <span className="text-[0.8125rem] font-medium leading-tight text-ink">
                                                {v.name}
                                                {i === 0 ? <span className="text-ink-3"> · Haupt</span> : null}
                                            </span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </fieldset>
                ) : null}
                <p className="mt-3 text-[0.8125rem] leading-snug text-ink-3">
                    Die Wahl steht nur im Link (<span className="font-mono">?farbe=…</span>, <span className="font-mono">?logo=…</span>).
                    Es wird nichts gespeichert.
                </p>
            </div>

            <button
                ref={knopfRef}
                type="button"
                aria-expanded={offen}
                aria-controls="farbwahl-feld"
                onClick={() => setOffen((v) => !v)}
                className="group/fw relative grid h-11 w-11 place-items-center rounded-full border border-line-2 bg-white text-ink-2 shadow-md transition-colors hover:border-ink-3 hover:text-ink"
            >
                <Palette aria-hidden="true" size={20} strokeWidth={1.75} />
                {/* Kleiner Punkt in der aktuellen Markenfarbe: zeigt, welche Variante gerade gilt */}
                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand" />
                <span className="sr-only">Farben</span>
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[0.8125rem] font-medium text-white opacity-0 shadow-md motion-safe:transition-opacity group-hover/fw:opacity-100 group-focus-visible/fw:opacity-100 group-aria-expanded/fw:hidden"
                >
                    Farben
                </span>
            </button>
        </div>
    );
}
