import { LOGO_ZEICHEN } from '@/components/ui/logo-zeichen';
import { LOGO_HEUTE, LOGO_STANDARD, LOGO_ZEICHEN_IDS } from '@/lib/logos';
import { KARTE_BREITE, KARTE_HOEHE, LAENDER, NETZ, STAEDTE } from './deutschland-karte';

/**
 * Deutschlandkarte als SVG, gemeinsames Bauteil von ueber/Deutschlandkarte.tsx und ueber/LeitbildKarte.tsx: 16 Bundesländer
 * (Natural Earth, gemeinfrei, ueber/deutschland-karte.ts), Netzlinien und an jedem Ort das SmartAmt-Zeichen der gewählten
 * Logo-Variante (dieselben <symbol id="lz-…"> wie Kopf und Fuß, ui/LogoSprite.tsx; sichtbar nach html[data-logo], ohne Wahl
 * der Standard, bei der reinen Wortmarke ein Markenpunkt). Das Bauteil ist statisch; die Bewegung setzt der Abschnitt, der es
 * zeigt, über die Attribute data-land, data-stadt, data-linie und (mit `stufen`) data-stufe.
 */

const ZEICHEN_IDS = LOGO_ZEICHEN_IDS.filter((id) => id in LOGO_ZEICHEN) as (keyof typeof LOGO_ZEICHEN)[];

/** Sichtbarkeit des Zeichens je Logo-Wahl, wie in ui/LogoSprite.tsx für Kopf und Fuß. */
const SICHTBAR = [
    '.karte-zeichen,.karte-punkt{display:none}',
    `html:not([data-logo]) .karte-zeichen[data-zeichen='${LOGO_STANDARD}']{display:inline}`,
    ...ZEICHEN_IDS.map((id) => `html[data-logo='${id}'] .karte-zeichen[data-zeichen='${id}']{display:inline}`),
    `html[data-logo='${LOGO_HEUTE}'] .karte-punkt{display:inline}`,
].join('');

/** Durchmesser der Plakette um das Zeichen und Größe des Zeichens, in Karteneinheiten (Karte 1000 breit). */
const PLAKETTE = 78;
const ZEICHEN = 60;

/** Stufe je Ort und je Linie (Index wie STAEDTE und NETZ), wenn der Abschnitt die Karte schrittweise aufbaut. */
export type KartenStufen = { stadt: readonly number[]; linie: readonly number[] };

export default function KarteSvg({ className, stufen }: { className?: string; stufen?: KartenStufen }) {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: SICHTBAR }} />
            <svg
                data-karte
                viewBox={`-40 -40 ${KARTE_BREITE + 80} ${KARTE_HOEHE + 80}`}
                role="img"
                aria-label="Deutschlandkarte mit den 16 Bundesländern. In jedem Land und in Leipzig steht das SmartAmt-Zeichen; Linien verbinden die Orte zu einem Netz."
                className={className}
            >
                <g data-umriss>
                    {LAENDER.map((land) => (
                        <path
                            key={land.kuerzel}
                            data-land
                            d={land.d}
                            className="fill-bg-2 stroke-ink-3"
                            strokeWidth={1.25}
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        >
                            <title>{land.name}</title>
                        </path>
                    ))}
                </g>

                <g aria-hidden="true">
                    {NETZ.map(([a, b], k) => (
                        <line
                            key={`${a}-${b}`}
                            data-linie
                            data-stufe={stufen ? stufen.linie[k] : undefined}
                            x1={STAEDTE[a].x}
                            y1={STAEDTE[a].y}
                            x2={STAEDTE[b].x}
                            y2={STAEDTE[b].y}
                            pathLength={1}
                            strokeDasharray="1 1"
                            strokeDashoffset={0}
                            className="stroke-brand"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            opacity={0.6}
                        />
                    ))}
                </g>

                <g aria-hidden="true">
                    {STAEDTE.map((stadt, i) => (
                        <g key={stadt.name} data-stadt data-y={stadt.y} data-stufe={stufen ? stufen.stadt[i] : undefined}>
                            <circle
                                cx={stadt.x}
                                cy={stadt.y}
                                r={PLAKETTE / 2}
                                className="fill-bg stroke-brand"
                                strokeWidth={2.5}
                            />
                            {ZEICHEN_IDS.map((id) => (
                                <svg
                                    key={id}
                                    className="karte-zeichen"
                                    data-zeichen={id}
                                    x={stadt.x - ZEICHEN / 2}
                                    y={stadt.y - ZEICHEN / 2}
                                    width={ZEICHEN}
                                    height={ZEICHEN}
                                    viewBox={LOGO_ZEICHEN[id].viewBox}
                                >
                                    <use href={`#lz-${id}`} />
                                </svg>
                            ))}
                            <circle className="karte-punkt fill-brand" cx={stadt.x} cy={stadt.y} r={9} />
                        </g>
                    ))}
                </g>
            </svg>
        </>
    );
}
