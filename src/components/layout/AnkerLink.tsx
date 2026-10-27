'use client';

import Link from 'next/link';
import { handleAnchorClick } from '@/lib/scroll';

/**
 * Link auf einen Abschnitt der Startseite (`/#id`). Auf der Startseite scrollt er weich über
 * `scrollToId` (Lenis, Abstand zur festen Kopfzeile); auf anderen Seiten führt er zur Startseite,
 * dort springt HashSprung zum Abschnitt. Für Server-Komponenten wie den Footer.
 */
type AnkerLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
    id: string;
};

export function AnkerLink({ id, children, ...rest }: AnkerLinkProps) {
    return (
        <Link href={`/#${id}`} onClick={(e) => handleAnchorClick(e, id)} {...rest}>
            {children}
        </Link>
    );
}

export default AnkerLink;
