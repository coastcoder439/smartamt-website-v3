import { Check } from 'lucide-react';

/**
 * Bild „Vom Brief zur neuen Website“ in der stehenden Spalte des Ablaufs (neben dem Fortschrittsring): hinten ein
 * Brief (weißes Papier mit Kopfzeile, Textzeilen und dem Chip „Befund“), vorn, diagonal versetzt, die Vorschau der
 * neuen Website (Fensterleiste, „Gemeinde Musterbach“, drei grüne Haken). Beides gezeichnet, ohne Bilddateien, ohne
 * erfundene Messwerte, nur Zustände. Brief und Fenster sind parallel versetzt, nie gedreht (CI v3, Produktansicht).
 *
 * Bewegung: hängt an der aktiven Karte des Ablaufs. Der Elternteil (`group/bild`) trägt `data-stufe` (1 bis zur Zahl der Schritte, setzt
 * der Effekt in Ablauf.tsx). Bei Stufe 1 („Prüfung“) steht nur der Brief da; ab Stufe 2 („Vorschau“) schwebt die neue
 * Website darüber (nur transform und opacity, 0,7 s). Ohne `data-stufe` (Server-HTML, ohne JavaScript, reduzierte
 * Bewegung) zeigt das Bild den Endzustand: Brief und Website zusammen.
 *
 * Reine Zierde (aria-hidden): Die Aussage steht in den Karten daneben.
 */
const ZEILEN = ['92%', '100%', '74%', '96%'] as const;

export function BriefBild() {
    return (
        <div aria-hidden="true" className="relative h-[172px] min-w-0 max-w-[330px] flex-1">
            {/* Brief */}
            <div className="absolute left-0 top-0 w-[54%] rounded-[12px] border border-line bg-white p-3.5 shadow-sm">
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-brand" />
                    <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
                        Smart<span className="text-brand-ink">Amt</span>
                    </span>
                </div>
                <div className="mt-3 space-y-[7px]">
                    {ZEILEN.map((breite, i) => (
                        <span key={i} className="block h-[6px] rounded-full bg-bg-3" style={{ width: breite }} />
                    ))}
                </div>
                <span className="chip chip-warn mt-3.5">
                    <span className="size-1.5 rounded-full bg-warn-dot" />
                    Befund
                </span>
            </div>

            {/* Vorschau der neuen Website */}
            <div
                className={
                    'absolute bottom-0 right-0 w-[62%] overflow-hidden rounded-[12px] border border-line bg-white shadow-md ' +
                    'transition-[opacity,transform] duration-700 ease-out ' +
                    'group-data-[stufe=1]/bild:translate-y-4 group-data-[stufe=1]/bild:opacity-0'
                }
            >
                <div className="flex items-center gap-2 border-b border-line bg-bg-2 px-2.5 py-1.5">
                    <span className="flex gap-1">
                        <span className="size-1.5 rounded-full bg-line-2" />
                        <span className="size-1.5 rounded-full bg-line-2" />
                        <span className="size-1.5 rounded-full bg-line-2" />
                    </span>
                    <span className="mx-auto h-3 w-[58%] rounded-full border border-line bg-white" />
                </div>
                <div className="px-3 pb-3 pt-2.5">
                    <p className="text-[12.5px] font-semibold tracking-[-0.01em] text-ink">Gemeinde Musterbach</p>
                    <ul className="mt-2 space-y-1.5">
                        {[78, 92, 64].map((breite) => (
                            <li
                                key={breite}
                                className="flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--ok)_22%,white)] bg-ok-50 px-1.5 py-1"
                            >
                                <span className="flex size-4 flex-none items-center justify-center rounded-full bg-ok text-white">
                                    <Check size={10} strokeWidth={3} />
                                </span>
                                <span
                                    className="block h-[5px] rounded-full bg-[color-mix(in_srgb,var(--ok)_30%,white)]"
                                    style={{ width: `${breite}%` }}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default BriefBild;
