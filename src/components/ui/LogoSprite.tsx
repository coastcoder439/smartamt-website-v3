import { LOGO_HEUTE, LOGO_STANDARD, LOGO_ZEICHEN_IDS } from '@/lib/logos';
import { LOGO_ZEICHEN } from './logo-zeichen';

/**
 * Logo-Wahl: alle Zeichen und die Wortmarke mit Dach-A einmal je Seite als SVG-Symbole. Logo.tsx und die Logo-Wahl in
 * Farbwahl.tsx holen sie mit <use href="#lz-…">; die Farben kommen über --logo-akzent, --logo-tinte und --logo-grund
 * (globals.css, Block „Logo-Wahl“). Die Inhalte erzeugt scripts/erzeuge-logo-zeichen.mjs aus den Entwürfen.
 *
 * Dazu die Regeln, welche Fassung sichtbar ist: je Variante eine Zeile aus der einen Liste in lib/logos.ts, damit
 * Liste und CSS nie auseinanderlaufen. data-logo setzt das Skript im Kopf von layout.tsx vor dem ersten Bild.
 */
export default function LogoSprite() {
    const symbole = Object.entries(LOGO_ZEICHEN)
        .map(([id, z]) => `<symbol id="lz-${id}" viewBox="${z.viewBox}">${z.inhalt}</symbol>`)
        .join('');
    const sichtbar = [
        // Die Wortmarke mit Signalpunkt nur, wenn sie gewählt ist; ohne data-logo (ohne Skript) gilt der Standard.
        `html:not([data-logo='${LOGO_HEUTE}']) .logo-mark{display:none}`,
        `html:not([data-logo]) .logo-bild[data-zeichen='${LOGO_STANDARD}']{display:inline-flex}`,
        ...LOGO_ZEICHEN_IDS.map((id) => `html[data-logo='${id}'] .logo-bild[data-zeichen='${id}']{display:inline-flex}`),
    ].join('');
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: sichtbar }} />
            <svg
                aria-hidden="true"
                focusable="false"
                width="0"
                height="0"
                style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: symbole }}
            />
        </>
    );
}
