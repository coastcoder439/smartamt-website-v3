import { cn } from '@/lib/utils';

/**
 * Lichtfeld hinter einem Abschnitt (CI v3, „Punktraster mit warmem Licht“): ein weiches Orange-Glühen
 * (brand-100 bis brand-50 in einem Verlauf) und ein Punktraster, das zum Rand hin ausläuft. Reine Zierde
 * (aria-hidden), liegt hinter dem Inhalt (-z-10, der Abschnitt ist `isolate`) und wird im eigenen Rahmen
 * beschnitten, damit nichts über den Abschnitt hinausragt (und der Anker-Rand des Abschnitts nicht
 * abgeschnitten wird).
 *
 * `seite`: wo das Glühen sitzt (rechts oder links); `stark` hebt die Deckkraft (für die Lage hinter der Rangliste).
 */
type LichtProps = {
    seite?: 'rechts' | 'links';
    stark?: boolean;
    className?: string;
};

export function Licht({ seite = 'rechts', stark = false, className }: LichtProps) {
    const rechts = seite === 'rechts';
    return (
        <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
            <div
                className={cn(
                    'absolute top-[6%] h-[820px] w-[820px] rounded-full',
                    rechts ? '-right-60' : '-left-60',
                    stark ? 'opacity-100' : 'opacity-80',
                )}
                style={{ background: 'radial-gradient(closest-side, var(--brand-100), var(--brand-50) 58%, transparent)' }}
            />
            <div
                className={cn(
                    'dot-grid absolute inset-y-0 w-[70%] opacity-60',
                    rechts
                        ? 'right-0 [mask-image:radial-gradient(60%_55%_at_80%_38%,black,transparent)]'
                        : 'left-0 [mask-image:radial-gradient(60%_55%_at_20%_38%,black,transparent)]',
                )}
            />
        </div>
    );
}

export default Licht;
