import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/Label';

/**
 * Rahmen für die Rechtsseiten (Impressum, Datenschutz, Barrierefreiheit), CI v3: Kopf und Fuß kommen aus dem
 * Layout. Oben ein heller Kopf mit Punktraster und einem Hauch warmem Licht (wie der Hero), „Zur Startseite“,
 * Label „Rechtliches“, die Überschrift und ein kurzer orange Strich. Darunter auf der ruhigen Fläche
 * (surface-soft) ein weißes Blatt mit dem Text. Der Text steht in `.legal`, das h2, h3, p, ul, ol, address und
 * Links einheitlich setzt (siehe globals.css). Keine Bewegung außer den Standard-Übergängen der Links.
 */
export default function LegalPage({ titel, children }: { titel: string; children?: React.ReactNode }) {
    return (
        <>
            <header className="relative overflow-hidden pb-[clamp(40px,6vw,72px)] pt-[calc(var(--header-h)+clamp(24px,5vw,64px))]">
                <div
                    aria-hidden="true"
                    className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(70%_90%_at_30%_20%,black,transparent)]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[460px] w-[460px] rounded-full opacity-60 blur-3xl"
                    style={{ background: 'radial-gradient(closest-side, var(--brand-100), transparent)' }}
                />
                <div className="wrap">
                    <Link
                        href="/"
                        className="inline-flex min-h-[44px] items-center gap-2 text-klein font-medium text-ink-2 transition-colors hover:text-ink"
                    >
                        <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.75} />
                        Zur Startseite
                    </Link>
                    <Label className="mt-6">Rechtliches</Label>
                    <h1 className="mt-4 text-[clamp(2.5rem,1.6rem+4vw,4.5rem)]">{titel}</h1>
                    <span aria-hidden="true" className="mt-8 block h-[2px] w-16 rounded-full bg-brand" />
                </div>
            </header>

            <article className="surface-soft pb-24 pt-[clamp(32px,5vw,64px)] md:pb-32">
                <div className="wrap">
                    <div className="legal karte max-w-[60rem] !rounded-[20px] p-6 shadow-sm sm:p-10 lg:p-14 [&>*:first-child]:mt-0">
                        {children}
                    </div>
                </div>
            </article>
        </>
    );
}
