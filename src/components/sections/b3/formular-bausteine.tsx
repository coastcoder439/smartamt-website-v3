import { Check, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Bausteine des Kontaktformulars. Jedes Feld hat ein sichtbares Label, optional einen Hinweis und eine
 * Fehlermeldung direkt darunter. Hinweis und Fehler hängen per aria-describedby am Feld, ein Fehler
 * setzt zusätzlich aria-invalid. Fehler sind nie nur farbig: Symbol, Text und ein dicker Rahmen.
 *
 * Stil CI v3: Formularfelder sind weiß mit 1 px Rahmen (`.feld` in globals.css, Fokus: Rahmen und weicher Hof in
 * Orange), Auswahlknöpfe sind weiße Karten mit feiner Linie; gewählt: oranger Rand, warmer Grund und ein Haken im
 * orangen Kästchen (Zustand also nie nur über die Farbe). Fehler stehen klein und rot am Feld, mit Symbol und Text.
 * Der Fokus ist immer sichtbar (3 px, 2 px Abstand).
 */

const LABEL_KLASSE = 'block text-[0.9375rem] font-semibold leading-snug text-ink';
const HINWEIS_KLASSE = 'mt-1 text-klein text-ink-3';
const FOKUS_AM_NACHBARN =
    'peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-ink';

function beschreibung(...ids: (string | undefined)[]) {
    const gesetzt = ids.filter(Boolean).join(' ');
    return gesetzt || undefined;
}

export function Fehlertext({ id, text }: { id: string; text: string }) {
    return (
        <p id={id} className="mt-2 flex items-start gap-2 text-[0.9375rem] font-medium leading-snug text-bad">
            <CircleAlert aria-hidden="true" size={20} strokeWidth={1.75} className="mt-px shrink-0" />
            <span>
                <span className="sr-only">Fehler: </span>
                {text}
            </span>
        </p>
    );
}

// ---- Einzeilige Eingabe -----------------------------------------------------

type TexteingabeProps = {
    id: string;
    name: string;
    label: string;
    wert: string;
    typ?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'date';
    fehler?: string;
    hinweis?: string;
    pflicht?: boolean;
    autoComplete?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    maxLength?: number;
    min?: string | number;
    max?: string | number;
    step?: number;
    placeholder?: string;
    className?: string;
    onAendern: (wert: string) => void;
    onVerlassen: () => void;
};

export function Texteingabe({
    id,
    name,
    label,
    wert,
    typ = 'text',
    fehler,
    hinweis,
    pflicht = true,
    autoComplete,
    inputMode,
    maxLength,
    min,
    max,
    step,
    placeholder,
    className,
    onAendern,
    onVerlassen,
}: TexteingabeProps) {
    const hinweisId = hinweis ? `${id}-hinweis` : undefined;
    const fehlerId = fehler ? `${id}-fehler` : undefined;
    return (
        <div className={className}>
            <label htmlFor={id} className={LABEL_KLASSE}>
                {label}
            </label>
            {hinweis ? (
                <p id={hinweisId} className={HINWEIS_KLASSE}>
                    {hinweis}
                </p>
            ) : null}
            <input
                id={id}
                name={name}
                type={typ}
                value={wert}
                required={pflicht}
                autoComplete={autoComplete}
                inputMode={inputMode}
                maxLength={maxLength}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                aria-invalid={fehler ? true : undefined}
                aria-describedby={beschreibung(hinweisId, fehlerId)}
                onChange={(e) => onAendern(e.target.value)}
                onBlur={onVerlassen}
                className="feld mt-2 aria-[invalid=true]:border-bad aria-[invalid=true]:bg-bad-50"
            />
            {fehler ? <Fehlertext id={fehlerId as string} text={fehler} /> : null}
        </div>
    );
}

// ---- Mehrzeilige Eingabe ----------------------------------------------------

type TextbereichProps = {
    id: string;
    name: string;
    label: string;
    wert: string;
    fehler?: string;
    maxLength: number;
    zeilen?: number;
    onAendern: (wert: string) => void;
    onVerlassen: () => void;
};

export function Textbereich({ id, name, label, wert, fehler, maxLength, zeilen = 5, onAendern, onVerlassen }: TextbereichProps) {
    const zaehlerId = `${id}-zaehler`;
    const fehlerId = fehler ? `${id}-fehler` : undefined;
    return (
        <div>
            <label htmlFor={id} className={LABEL_KLASSE}>
                {label}
            </label>
            <textarea
                id={id}
                name={name}
                value={wert}
                rows={zeilen}
                maxLength={maxLength}
                data-lenis-prevent=""
                aria-invalid={fehler ? true : undefined}
                aria-describedby={beschreibung(zaehlerId, fehlerId)}
                onChange={(e) => onAendern(e.target.value)}
                onBlur={onVerlassen}
                className="feld mt-2 min-h-[9rem] resize-y aria-[invalid=true]:border-bad aria-[invalid=true]:bg-bad-50"
            />
            <p id={zaehlerId} className={cn(HINWEIS_KLASSE, 'font-mono')}>
                {Array.from(wert).length} / {maxLength} Zeichen
            </p>
            {fehler ? <Fehlertext id={fehlerId as string} text={fehler} /> : null}
        </div>
    );
}

// ---- Auswahlknöpfe (Einzelwahl) und Mehrfachauswahl ---------------------------

type Option<T extends string> = { wert: T; label: string };

type KartengruppeProps<T extends string> = {
    idPrefix: string;
    name: string;
    legende: string;
    hinweis?: string;
    fehler?: string;
    typ: 'radio' | 'checkbox';
    optionen: readonly Option<T>[];
    gewaehlt: readonly T[];
    zweispaltig?: boolean;
    onWaehlen: (wert: T, an: boolean) => void;
    onVerlassen: () => void;
};

export function Kartengruppe<T extends string>({
    idPrefix,
    name,
    legende,
    hinweis,
    fehler,
    typ,
    optionen,
    gewaehlt,
    zweispaltig = false,
    onWaehlen,
    onVerlassen,
}: KartengruppeProps<T>) {
    const hinweisId = hinweis ? `${idPrefix}-hinweis` : undefined;
    const fehlerId = fehler ? `${idPrefix}-fehler` : undefined;
    return (
        <fieldset className="min-w-0" aria-describedby={beschreibung(hinweisId, fehlerId)}>
            <legend className={LABEL_KLASSE}>{legende}</legend>
            {hinweis ? (
                <p id={hinweisId} className={HINWEIS_KLASSE}>
                    {hinweis}
                </p>
            ) : null}
            <div className={cn('mt-3 grid gap-3', zweispaltig && 'sm:grid-cols-2')}>
                {optionen.map((option, index) => {
                    const inputId = `${idPrefix}-${option.wert}`;
                    const an = gewaehlt.includes(option.wert);
                    return (
                        <div key={option.wert} className="relative">
                            <input
                                id={inputId}
                                type={typ}
                                name={name}
                                value={option.wert}
                                checked={an}
                                required={typ === 'radio' && index === 0}
                                aria-invalid={fehler ? true : undefined}
                                onChange={(e) => onWaehlen(option.wert, e.target.checked)}
                                onBlur={onVerlassen}
                                className="peer sr-only"
                            />
                            <label
                                htmlFor={inputId}
                                className={cn(
                                    'flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-knopf border px-4 py-3 text-left font-medium leading-tight text-ink transition-colors',
                                    FOKUS_AM_NACHBARN,
                                    fehler ? 'border-bad' : an ? 'border-brand' : 'border-line-2 hover:border-ink-3',
                                    an ? 'bg-brand-50' : 'bg-bg',
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'grid h-6 w-6 shrink-0 place-items-center border',
                                        typ === 'radio' ? 'rounded-full' : 'rounded-[0.375rem]',
                                        an ? 'border-brand bg-brand text-on-brand' : 'border-line-2 bg-bg',
                                    )}
                                >
                                    {an ? <Check size={14} strokeWidth={3} /> : null}
                                </span>
                                <span>{option.label}</span>
                            </label>
                        </div>
                    );
                })}
            </div>
            {fehler ? <Fehlertext id={fehlerId as string} text={fehler} /> : null}
        </fieldset>
    );
}

// ---- Einzelner Haken (Datenschutz) ---------------------------------------------

type HakenProps = {
    id: string;
    name: string;
    an: boolean;
    fehler?: string;
    children: React.ReactNode;
    onAendern: (an: boolean) => void;
    onVerlassen: () => void;
};

export function Haken({ id, name, an, fehler, children, onAendern, onVerlassen }: HakenProps) {
    const fehlerId = fehler ? `${id}-fehler` : undefined;
    return (
        <div>
            <label htmlFor={id} className="relative flex cursor-pointer items-start gap-3">
                <input
                    id={id}
                    name={name}
                    type="checkbox"
                    checked={an}
                    required
                    aria-invalid={fehler ? true : undefined}
                    aria-describedby={fehlerId}
                    onChange={(e) => onAendern(e.target.checked)}
                    onBlur={onVerlassen}
                    className="peer sr-only"
                />
                <span
                    aria-hidden="true"
                    className={cn(
                        'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[0.375rem] border',
                        FOKUS_AM_NACHBARN,
                        fehler ? 'border-bad' : an ? 'border-brand' : 'border-line-2',
                        an ? 'bg-brand text-on-brand' : 'bg-bg',
                    )}
                >
                    {an ? <Check size={16} strokeWidth={3} /> : null}
                </span>
                <span className="text-[1rem] leading-relaxed text-ink-2">{children}</span>
            </label>
            {fehler ? <Fehlertext id={fehlerId as string} text={fehler} /> : null}
        </div>
    );
}
