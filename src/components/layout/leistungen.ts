import { abschnittSichtbar } from '@/lib/abschnitte';

/**
 * Sprungziele auf der Startseite. Eine Quelle für die Zeile „Auf einen Blick“ im Hero und die Spalte im Fuß.
 * Wortlaut der ersten drei Einträge aus website-copy-b2-b3.md; Anker wie in lib/site.ts (MENUE).
 *
 * Website v2: Verlinkt wird nur, was die Seite zeigt. Die Ziele ausgeblendeter Abschnitte (Schulungen, Recht & Sicherheit)
 * stehen weiter hier und erscheinen wieder, sobald der Schalter in lib/abschnitte.ts auf `true` steht.
 */
const ALLE = [
    { label: 'Websites für Gemeinden', id: 'websites' },
    { label: 'Das Angebot', id: 'angebot' },
    { label: 'Der Ablauf', id: 'ablauf' },
    { label: 'KI- und IT-Schulungen', id: 'schulungen' },
    { label: 'Recht & Sicherheit', id: 'recht' },
] as const;

export const LEISTUNGEN: readonly { label: string; id: string }[] = ALLE.filter((l) => abschnittSichtbar(l.id));
