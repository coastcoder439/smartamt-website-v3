import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Mini-Produktansichten in den drei Karten des Abschnitts „Problem“ (Problem.tsx).
 *
 * Alle drei hängen am Zustand ihrer Karte: Das Elternelement trägt `group/karte` und `data-state`
 * (`offen` = Befund, `ok` = Behoben). Das Server-HTML steht im Endzustand `ok`; erst der Effekt in
 * Problem.tsx setzt die Karten auf `offen` und schaltet sie beim Hineinscrollen nacheinander um. Der
 * Wechsel selbst ist reines CSS (Farbe, Deckkraft, Ring, Balken), nur Zeitpunkt und Prüflinie kommen von GSAP.
 *
 * Zustände stehen nie allein in der Farbe: Jede Ansicht trägt zusätzlich Text („Support beendet“ /
 * „wird unterstützt“ …). Offen ist Bernstein, erfüllt ist Grün, Orange nur für Linien und Ringe.
 *
 * Größe: Beschriftungen stehen mit mindestens 12 px in ink-2, Zustandswörter mit 13 px. Jede Ansicht
 * füllt die Höhe, die ihr die Karte lässt (Fenster `flex-1`, Zeilen mit `justify-between`), damit unter
 * der letzten Zeile keine Leerfläche bleibt (am Desktop sind die drei Ansichten gleich hoch, siehe Subgrid in
 * Problem.tsx). Jede Ansicht zeigt drei Gruppen und nimmt damit auf, was der Kartentext nennt (Software,
 * Sicherheitsupdates und Update; Kontrast, Tastatur und Erklärung; Cookies, Schriften und Pflichtangaben).
 *
 * Beispiele sind als Beispiel gekennzeichnet („Beispiel“ in der Fensterleiste, Zeile unter den Karten).
 * Belegt ist nur, was auch belegt ist: PHP 7.4 hat seit dem 28.11.2022 kein Support mehr, PHP 8.4 wird am
 * 26.10.2026 unterstützt und bis 31.12.2028 mit Sicherheitsupdates versorgt (php.net/eol.php und
 * php.net/supported-versions.php, docs/research/facts-legal-security.md, 1d). Die übrigen Zeilen zeigen
 * Zustände ohne Messwerte.
 */

function Fenster({ adresse, children }: { adresse: string; children: React.ReactNode }) {
    return (
        <div className="mt-5 flex flex-1 flex-col overflow-hidden rounded-[14px] border border-line bg-white">
            <div className="flex items-center gap-3 border-b border-line bg-bg-2 px-3 py-2">
                <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2 w-2 rounded-full bg-line-2" />
                    <span className="h-2 w-2 rounded-full bg-line-2" />
                    <span className="h-2 w-2 rounded-full bg-line-2" />
                </span>
                <span className="font-mono text-[12px] text-ink-2">{adresse}</span>
                <span className="ml-auto font-mono text-[12px] uppercase tracking-[0.1em] text-ink-2">Beispiel</span>
            </div>
            <div data-korpus className="relative flex flex-1 flex-col justify-between gap-4 p-4">
                {/* Prüflinie: läuft beim Umschalten einmal über die Ansicht (Problem.tsx) */}
                <span
                    aria-hidden="true"
                    data-linie
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-brand opacity-0 shadow-[0_0_12px_2px_color-mix(in_srgb,var(--brand)_40%,transparent)]"
                />
                {children}
            </div>
        </div>
    );
}

function Etikett({ children }: { children: React.ReactNode }) {
    return <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-ink-2">{children}</span>;
}

/** Zustandswort: Bernstein im Befund, Grün wenn behoben. */
function Status({ offen, ok }: { offen: string; ok: string }) {
    return (
        <span className="font-mono text-[13px] font-medium">
            <span data-wert className="inline-block text-warn group-data-[state=ok]/karte:hidden">
                {offen}
            </span>
            <span data-wert className="hidden text-ok group-data-[state=ok]/karte:inline-block">
                {ok}
            </span>
        </span>
    );
}

/** Zwei Werte mit Pfeil: Der aktuelle steht kräftig (Bernstein, dann Grün), der andere zurückgenommen. */
function Paar({ von, nach, className }: { von: string; nach: string; className?: string }) {
    return (
        <span className={cn('inline-flex items-baseline gap-[0.4em]', className)}>
            <span
                data-wert
                className="inline-block text-warn transition-[color,opacity] duration-500 group-data-[state=ok]/karte:text-ink-3 group-data-[state=ok]/karte:opacity-60"
            >
                {von}
            </span>
            <ArrowRight aria-hidden="true" strokeWidth={2} className="h-[0.7em] w-[0.7em] flex-none self-center text-ink-3" />
            <span
                data-wert
                className="inline-block text-ink-3 opacity-[0.45] transition-[color,opacity] duration-500 group-data-[state=ok]/karte:text-ok group-data-[state=ok]/karte:opacity-100"
            >
                {nach}
            </span>
        </span>
    );
}

/** Kopfzeile einer Ansicht: Etikett links, Zustandswort rechts. */
function Zeile({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">{children}</div>;
}

/**
 * Veraltete Technik: Versionszeile „PHP 7.4 → 8.4“ in der Größe der Zahl aus der Rechts-Ansicht, darunter
 * „Support bis“ und die Sicherheitsupdates mit Update-Balken, der sich füllt. Drei Gruppen wie in den beiden
 * anderen Ansichten, damit die Zeilenabstände in allen drei Karten gleich wirken.
 * Beleg „Support bis“: PHP 7.4 hatte Support-Ende am 28.11.2022 (php.net/eol.php), PHP 8.4 erhält
 * Sicherheitsunterstützung bis 31.12.2028 (php.net/supported-versions.php), docs/research/facts-legal-security.md, 1d.
 */
export function MiniTechnik() {
    return (
        <Fenster adresse="Server">
            <div>
                <Zeile>
                    <Etikett>Software</Etikett>
                    <Status offen="Support beendet" ok="wird unterstützt" />
                </Zeile>
                <p className="mt-1.5 flex items-baseline gap-3 text-[clamp(2.25rem,1.8rem+1.4vw,3rem)] font-bold leading-none tabular-nums tracking-[-0.04em] text-ink">
                    <span className="text-ink-3">PHP</span>
                    <Paar von="7.4" nach="8.4" />
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3.5">
                <Etikett>Support bis</Etikett>
                <p className="font-mono text-[13px] font-medium">
                    <Paar von="11.2022" nach="12.2028" />
                </p>
            </div>

            <div className="border-t border-line pt-3.5">
                <Zeile>
                    <Etikett>Sicherheitsupdates</Etikett>
                    <Status offen="fehlen" ok="laufend" />
                </Zeile>
                <div className="mt-3 flex items-center gap-3">
                    <Etikett>Update</Etikett>
                    <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-bg-3">
                        <span className="absolute inset-0 origin-left scale-x-0 rounded-full bg-brand transition-transform duration-[1400ms] ease-out group-data-[state=ok]/karte:scale-x-100" />
                    </span>
                </div>
            </div>
        </Fenster>
    );
}

/** Pflicht zur Barrierefreiheit: Kontrast wird kräftig, der Tastaturfokus bekommt einen Ring, die Erklärung steht da. */
export function MiniBarriere() {
    return (
        <Fenster adresse="Seite">
            <div>
                <Zeile>
                    <Etikett>Kontrast</Etikett>
                    <Status offen="zu gering" ok="geprüft" />
                </Zeile>
                <p className="mt-2 rounded-lg bg-bg-2 px-3 py-2.5 text-[15px] font-semibold text-ink">
                    <span className="inline-block opacity-30 transition-opacity duration-700 group-data-[state=ok]/karte:opacity-100">
                        Öffnungszeiten &amp; Anträge
                    </span>
                </p>
            </div>

            <div className="border-t border-line pt-3.5">
                <Zeile>
                    <Etikett>Tastaturfokus</Etikett>
                    <Status offen="nicht sichtbar" ok="sichtbar" />
                </Zeile>
                <div className="mt-2.5 flex items-center gap-2.5">
                    <kbd className="rounded-md border border-line-2 bg-bg-2 px-1.5 py-0.5 font-mono text-[12px] text-ink-2">Tab</kbd>
                    <ArrowRight aria-hidden="true" size={14} strokeWidth={2} className="flex-none text-ink-3" />
                    <span className="rounded-[10px] border border-line-2 bg-white px-3 py-1.5 text-[14px] font-semibold text-ink ring-0 ring-brand ring-offset-2 ring-offset-white transition-shadow duration-500 group-data-[state=ok]/karte:ring-2">
                        Termin vereinbaren
                    </span>
                </div>
            </div>

            <div className="border-t border-line pt-3.5">
                <Zeile>
                    <Etikett>Erklärung</Etikett>
                    <Status offen="fehlt" ok="veröffentlicht" />
                </Zeile>
            </div>
        </Fenster>
    );
}

/** Rechtliche Grauzonen: „Cookies ohne Einwilligung: 3 → 0“, Schriften vom eigenen Server und Pflichtangaben. */
export function MiniRecht() {
    return (
        <Fenster adresse="Datenschutz">
            <div>
                <Etikett>Cookies ohne Einwilligung</Etikett>
                <div className="mt-1.5 flex items-end justify-between gap-3">
                    <p className="text-[clamp(2.25rem,1.8rem+1.4vw,3rem)] font-bold leading-none tabular-nums tracking-[-0.04em] text-ink">
                        <Paar von="3" nach="0" />
                    </p>
                    <Status offen="ungefragt" ok="geregelt" />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3.5">
                <Etikett>Schriften</Etikett>
                <p className="font-mono text-[13px] font-medium">
                    <Paar von="Google" nach="lokal" />
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3.5">
                <Etikett>Pflichtangaben</Etikett>
                <p className="font-mono text-[13px] font-medium">
                    <Paar von="veraltet" nach="aktuell" />
                </p>
            </div>
        </Fenster>
    );
}
