import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LOGO_ZEICHEN_IDS } from '@/lib/logos';
import { LOGO_ZEICHEN } from './logo-zeichen';

/**
 * Wortmarke „SmartAmt“ (CI v3): Signalpunkt, „Smart“ in Tinte, „Amt“ in der Markenfarbe (Standard: NX7-Orange).
 * Echter Text, scharf in jeder Größe und für Screenreader lesbar. Auf dunklen Flächen
 * (.surface-night) wird „Smart“ hell und der Ring um den Punkt transparent in der hellen Markenfarbe.
 *
 * Farbe: Das Logo kennt keine eigenen Farbwerte. Punkt und „Amt“ nehmen --logo-akzent (= var(--brand), auf Dunkel
 * var(--brand-hell)); damit folgt es der Farbwahl (Orange, Hellblau, Violett, Grün). Ein künftiges Zeichen als SVG
 * setzt fill/stroke auf var(--logo-akzent) oder currentColor, nie auf einen Hex-Wert.
 *
 * `groesse`: sm = 24 px, md = 30 px, lg = 40 px Höhe.
 * `ohneLink`: nur die Marke, ohne Link (zum Beispiel in einer Grafik).
 *
 * Logo-Wahl (Werkzeug wie die Farbwahl, Owner 27.10.2026: „Ich will jetzt auch, dass man das Logo auswählen kann“):
 * Neben der heutigen Wortmarke stehen alle Varianten aus lib/logos.ts (Zeichen samt Wortmarke mit Dach-A) im HTML, als
 * <use> auf die Symbole aus LogoSprite.tsx; sichtbar ist nur die Fassung, die data-logo am html-Element nennt (Skript im
 * Kopf von layout.tsx, ?logo=…). Ohne Wahl gilt LOGO_STANDARD (WLAN-Birne); die Wortmarke mit Punkt ist eine Wahl unter vielen.
 */
export type LogoGroesse = 'sm' | 'md' | 'lg';

type LogoProps = {
    groesse?: LogoGroesse;
    href?: string;
    ohneLink?: boolean;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    className?: string;
};

const HOEHE: Record<LogoGroesse, string> = {
    sm: '24px',
    md: '30px',
    lg: '40px',
};

export function Logo({ groesse = 'md', href = '/', ohneLink = false, onClick, className }: LogoProps) {
    const marke = (
        <>
            <span className="logo-mark" style={{ '--logo-h': HOEHE[groesse] } as React.CSSProperties}>
                <span>
                    Smart<span className="logo-amt">Amt</span>
                </span>
            </span>
            {LOGO_ZEICHEN_IDS.filter((id) => id in LOGO_ZEICHEN).map((id) => (
                <span
                    key={id}
                    className="logo-bild"
                    data-zeichen={id}
                    style={{ '--logo-h': HOEHE[groesse] } as React.CSSProperties}
                    aria-hidden="true"
                >
                    <svg
                        className="logo-bild-zeichen"
                        viewBox={LOGO_ZEICHEN[id as keyof typeof LOGO_ZEICHEN].viewBox}
                        focusable="false"
                    >
                        <use href={`#lz-${id}`} />
                    </svg>
                    <svg className="logo-bild-wort" viewBox={LOGO_ZEICHEN.wort.viewBox} focusable="false">
                        <use href="#lz-wort" />
                    </svg>
                </span>
            ))}
        </>
    );

    if (ohneLink) return <span className={cn('logo', className)}>{marke}</span>;

    return (
        <Link href={href} onClick={onClick} className={cn('logo', className)} aria-label="SmartAmt – zur Startseite">
            {marke}
        </Link>
    );
}

export default Logo;
