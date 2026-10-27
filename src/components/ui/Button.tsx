import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Knopf als Link (CI v3). Hauptknopf: Markenfarbe (Token brand) mit der Schrift on-brand (je Farbvariante der Farbwahl
 * Tinte oder Weiß; Orange ist der Standard). Nebenknopf: Weiß mit feiner
 * Linie und Tintenschrift (auf .surface-night durchsichtig mit heller Schrift). Radius 12 px,
 * Fokusrahmen aus dem Basis-Stil. Ein Pfeil im Knopf steht in `<span className="pfeil">`, er
 * rückt beim Überfahren vor. Interne Seiten laufen über next/link, Anker, mailto und tel über <a>.
 */
type ButtonLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
    variant?: 'primary' | 'secondary';
    klein?: boolean;
};

export function ButtonLink({ href, variant = 'primary', klein = false, className, children, ...rest }: ButtonLinkProps) {
    const klassen = cn('btn', variant === 'primary' ? 'btn-primary' : 'btn-secondary', klein && 'btn-klein', className);
    const intern = href.startsWith('/') && !href.startsWith('//');
    if (intern) {
        return (
            <Link href={href} className={klassen} {...rest}>
                {children}
            </Link>
        );
    }
    return (
        <a href={href} className={klassen} {...rest}>
            {children}
        </a>
    );
}

export default ButtonLink;
