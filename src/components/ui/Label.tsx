import { cn } from '@/lib/utils';

/**
 * Label (Eyebrow) in JetBrains Mono: 12 px, Versalien, Laufweite 0,14 em, vorangestelltes „//“ wie bei NX7.
 * Auf hellen Flächen Text in der Markenfarbe (Token brand-ink, mindestens 4,5:1 in jeder Farbvariante), auf dunklen
 * Flächen (.surface-night) in brand-hell (ebenfalls mindestens 4,5:1).
 */
type LabelProps = React.HTMLAttributes<HTMLElement> & {
    as?: 'p' | 'span' | 'div';
};

export function Label({ as: Tag = 'p', className, children, ...rest }: LabelProps) {
    return (
        <Tag className={cn('label', className)} {...rest}>
            {children}
        </Tag>
    );
}

export default Label;
