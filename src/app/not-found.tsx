import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { RevealHeading, RevealText } from '@/components/ui/Reveal';

export const metadata: Metadata = {
    title: 'Seite nicht gefunden',
    robots: { index: false, follow: false },
};

/**
 * 404 (CI v3): hell, mit Punktraster und warmem Licht wie der Hero. Links Label, Überschrift, Text und der
 * Knopf zur Startseite; rechts eine große, blasse „404“ als Zierde (aria-hidden), die mit dem Signalpunkt der
 * Wortmarke endet. Kein Schild, keine Fläche in Orange.
 */
export default function NotFound() {
    return (
        <div className="relative overflow-hidden">
            <div
                aria-hidden="true"
                className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(75%_70%_at_60%_35%,black,transparent)]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-40 -top-32 -z-10 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
                style={{ background: 'radial-gradient(closest-side, var(--brand-100), transparent)' }}
            />

            <div className="wrap pb-24 pt-[calc(var(--header-h)+48px)] md:pb-32 md:pt-[calc(var(--header-h)+96px)]">
                <div className="grid-12 items-center gap-y-12">
                    <div className="col-span-12 lg:col-span-6">
                        <Label>Fehler 404</Label>
                        <RevealHeading as="h1" sofort className="mt-4 text-[clamp(2.5rem,1.6rem+4vw,4.5rem)]">
                            Diese Seite gibt es nicht.
                        </RevealHeading>
                        <RevealText sofort verzoegerung={0.2} className="mt-6 max-w-[34em] text-lead">
                            Die Adresse stimmt nicht, oder die Seite wurde verschoben. Von der Startseite aus finden Sie alles
                            Weitere.
                        </RevealText>
                        <div className="mt-8">
                            <ButtonLink href="/">
                                Zur Startseite
                                <span className="pfeil" aria-hidden="true">
                                    →
                                </span>
                            </ButtonLink>
                        </div>
                    </div>

                    <div aria-hidden="true" className="col-span-12 select-none lg:col-span-6 lg:justify-self-end">
                        <p className="flex items-end text-[clamp(8rem,5rem+16vw,19rem)] font-extrabold leading-[0.8] tracking-[-0.06em] text-bg-3">
                            404
                            <span
                                className="mb-[0.05em] ml-[0.05em] inline-block h-[0.09em] w-[0.09em] rounded-full bg-brand"
                                style={{ boxShadow: '0 0 0 0.04em var(--brand-100)' }}
                            />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
