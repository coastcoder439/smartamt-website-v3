import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/Label';

/**
 * Kopf einer Unterseite der Website v3 (/ueber-uns, /fragen): Rückweg zur Startseite, Label, Überschrift (h1) und ein Satz.
 * Aufbau und Bühne (Punktraster, weiches Licht in der Markenfarbe, kurze orange Linie) wie der Kopf der Rechtsseiten
 * (layout/LegalPage.tsx), damit alle Unterseiten gleich beginnen.
 */
export default function SeitenKopf({ label, titel, satz }: { label: string; titel: React.ReactNode; satz: React.ReactNode }) {
    return (
        <header className="relative isolate overflow-hidden pb-[clamp(32px,4vw,56px)] pt-[calc(var(--header-h)+clamp(24px,5vw,64px))]">
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
                <Label className="mt-6">{label}</Label>
                <h1 className="mt-4 max-w-[16em] text-balance text-[clamp(2.5rem,1.6rem+4vw,4.75rem)] leading-[1.02] tracking-[-0.045em]">
                    {titel}
                </h1>
                <p className="mt-6 max-w-[38em] text-lead text-ink-2">{satz}</p>
                <span aria-hidden="true" className="mt-8 block h-[2px] w-16 rounded-full bg-brand" />
            </div>
        </header>
    );
}
