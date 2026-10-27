'use client';

import { ButtonLink } from '@/components/ui/Button';
import { Magnet } from '@/components/ui/Magnet';
import { waehleAnliegen } from '@/lib/kontakt';
import { handleAnchorClick } from '@/lib/scroll';

/**
 * Hauptknopf „Kostenlose Vorschau anfragen“ (Abschnitte Angebot, Ablauf, Fragen): springt zu #kontakt und setzt dort das
 * Anliegen „Vorschau anfragen“ (Wert „website“, wie im Hero). Der Knopf folgt am Zeiger der Maus ein Stück (Magnet).
 */
export default function WebsiteKnopf({ label = 'Kostenlose Vorschau anfragen' }: { label?: string }) {
    const zumKontakt = (e: React.MouseEvent<HTMLAnchorElement>) => {
        waehleAnliegen('website');
        handleAnchorClick(e, 'kontakt');
    };

    return (
        <Magnet>
            <ButtonLink href="/#kontakt" onClick={zumKontakt}>
                {label}
                <span className="pfeil" aria-hidden="true">
                    →
                </span>
            </ButtonLink>
        </Magnet>
    );
}
