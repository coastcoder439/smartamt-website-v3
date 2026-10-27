import { cn } from '@/lib/utils';

/**
 * Akkordeon-Karte (Recht & Sicherheit, Häufige Fragen): eine weiße Karte auf Basis von <details> und
 * <summary>. Das ist ohne JavaScript bedienbar und von Haus aus tastaturbedienbar (Tab zur Karte, Enter
 * oder Leertaste klappt auf und zu; der Fokus ist über die globale :focus-visible-Regel sichtbar).
 * Der Zustand lebt im Browser, nicht in React.
 *
 * Das Plus dreht sich beim Öffnen um 180° und wird dabei zum Minus (der senkrechte Balken legt sich
 * waagerecht). Nur transform. Der Inhalt blendet beim Öffnen ruhig ein (menue-eintrag aus globals.css:
 * Deckkraft und 14 px Versatz); bei reduzierter Bewegung steht er sofort da.
 *
 * `gruppe` setzt das name-Attribut: Karten mit gleichem Namen öffnen exklusiv (immer nur eine offen).
 */
type AkkordeonKarteProps = {
    /** Inhalt der Kopfzeile (neben dem Plus). */
    kopf: React.ReactNode;
    /** Der aufklappende Inhalt. */
    children: React.ReactNode;
    gruppe?: string;
    offen?: boolean;
    className?: string;
    id?: string;
    /** Meldet das Auf- und Zuklappen (zum Beispiel für die Leitlinie in „Recht & Sicherheit“). */
    onToggle?: React.ReactEventHandler<HTMLDetailsElement>;
};

export function PlusMinus({ className }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-2 bg-bg text-ink',
                'transition-[transform,border-color] duration-500 ease-out',
                'group-hover/ak:border-ink-3 group-open/ak:rotate-180 group-open/ak:border-brand',
                className,
            )}
        >
            <span className="absolute h-[2px] w-3.5 rounded-full bg-current" />
            <span className="absolute h-[2px] w-3.5 rotate-90 rounded-full bg-current transition-transform duration-500 ease-out group-open/ak:rotate-0" />
        </span>
    );
}

export function AkkordeonKarte({ kopf, children, gruppe, offen = false, className, id, onToggle }: AkkordeonKarteProps) {
    return (
        <details
            id={id}
            name={gruppe}
            open={offen}
            onToggle={onToggle}
            className={cn(
                'group/ak karte transition-[transform,box-shadow,border-color] duration-300',
                'hover:border-line-2 open:shadow-md',
                className,
            )}
        >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-5 rounded-karte p-5 text-left sm:p-6 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 flex-1">{kopf}</div>
                <PlusMinus />
            </summary>
            <div className="px-5 pb-6 sm:px-6 group-open/ak:animate-[menue-eintrag_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
                {children}
            </div>
        </details>
    );
}

export default AkkordeonKarte;
