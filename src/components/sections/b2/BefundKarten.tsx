import { BEFUNDE } from './befunde-daten';
import s from './Vergleich.module.css';

/**
 * Die sechs Befund-Karten unter dem Wisch (Website v2, Nachtrag 2: „so wie bei Tobi“), drei Spalten mal zwei Zeilen. Jede Karte
 * hat eine Ampel (Bernstein-Punkt → grüner Haken), den Titel und eine Statuszeile Vorher → Nachher. Zustand und Zähler kommen
 * von Vergleich.tsx (Prop `erledigt`: Anzahl der erfüllten Karten, von vorn gezählt); diese Datei zeichnet nur.
 *
 * Statuszeile: Angeheftet (data-pinned am .vergleich) liegen Vorher und Nachher übereinander und blenden ineinander über
 * (nur opacity); sonst stehen beide Zeilen untereinander und der Zustand zeigt sich in Farbe und Zeichen. Für Hilfstechnik
 * steht beides immer da („Vorher: …“, „Nachher: …“); die Ampel ist Zierde.
 *
 * Das Server-HTML ist der Endzustand (alle erfüllt).
 */
export default function BefundKarten({ erledigt }: { erledigt: number }) {
    return (
        <ul role="list" className={s.raster}>
            {BEFUNDE.map((b, i) => (
                <li key={b.id} data-befund className={s.rasterZeile}>
                    <div data-befund-innen data-state={i < erledigt ? 'ok' : 'offen'} className={s.befund}>
                        <span aria-hidden="true" className={s.ampel}>
                            <span className={s.ampelPunkt} />
                            <svg viewBox="0 0 24 24" className={s.ampelHaken} fill="none">
                                <path
                                    d="M6.5 12.5l4 4 7.5-9"
                                    stroke="currentColor"
                                    strokeWidth="2.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    pathLength={1}
                                    strokeDasharray={1}
                                />
                            </svg>
                        </span>
                        <p className={s.titel}>{b.befund}</p>
                        <p className={s.status}>
                            <span className={s.vorher}>
                                <span className="sr-only">Vorher: </span>
                                {b.vorher}
                            </span>{' '}
                            <span className={s.nachher}>
                                <span className="sr-only">Nachher: </span>
                                {b.nachher}
                            </span>
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
