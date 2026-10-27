/**
 * Fußnoten der Unterseiten (Website v3). Owner 27.10.2026: „Diese Quellen und Standdinger sollen weg. Das sieht immer so nach KI
 * aus.“ und „Wo Quellen kann man höchstens vielleicht mit einem ganz kleinen Sternchen 1 oder so und dann unten einmal aufführen
 * am Ende der Seite“. An der Aussage steht nur eine kleine hochgestellte Ziffer; die Quellen stehen einmal am Seitenende
 * (`Quellenliste`). Belege: docs/research/facts-context.md.
 */

/** Quellen der Seite /ueber-uns, Nummer = Fußnotenziffer. */
export const QUELLEN_UEBER_UNS = [
    { n: 1, text: 'Vereinte Nationen, E-Government Survey 2024 (EGDI, 193 Staaten): Dänemark Platz 1, Estland Platz 2, Deutschland Platz 12.' },
    { n: 2, text: '§ 1a Onlinezugangsgesetz in der Fassung vom 19.07.2024.' },
    { n: 3, text: 'Statistisches Bundesamt, Verwaltungsgliederung, Stand 31.12.2025.' },
] as const;

/** Hinweise der Seite /fragen. */
export const QUELLEN_FRAGEN = [{ n: 1, text: 'Die Übersicht Recht & Sicherheit ersetzt keine Rechtsberatung. Stand: Oktober 2026.' }] as const;

/** Kleine hochgestellte Ziffer, verlinkt auf die Quelle am Seitenende. */
export function Fussnote({ n }: { n: number }) {
    return (
        <sup className="ml-[0.1em] text-[0.55em] font-medium leading-none">
            <a href={`#quelle-${n}`} className="text-ink-3 no-underline transition-colors hover:text-brand-ink" aria-label={`Quelle ${n}`}>
                {n}
            </a>
        </sup>
    );
}

/** Quellen einmal am Seitenende, klein und ruhig. */
export function Quellenliste({ eintraege }: { eintraege: readonly { n: number; text: string }[] }) {
    return (
        <aside aria-label="Quellen" className="pb-10">
            <div className="wrap">
                <ol className="max-w-[80ch] border-t border-line pt-5 text-[0.8125rem] leading-relaxed text-ink-3">
                    {eintraege.map((q) => (
                        <li key={q.n} id={`quelle-${q.n}`} className="scroll-mt-[calc(var(--header-h)+1rem)]">
                            <sup className="mr-1">{q.n}</sup>
                            {q.text}
                        </li>
                    ))}
                </ol>
            </div>
        </aside>
    );
}
