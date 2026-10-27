import { Phone } from 'lucide-react';
import WebsiteKnopf from '@/components/sections/b2/WebsiteKnopf';
import { KONTAKT } from '@/lib/site';

/**
 * Schluss einer Unterseite der Website v3: ein Satz, der Hauptknopf „Kostenlose Vorschau anfragen“ (führt zum Kontakt der
 * Startseite) und die Festnetznummer. Wortlaut aus dem Kontakt der Startseite („Sprechen wir über Ihre Gemeinde.“).
 */
export default function SeitenSchluss() {
    return (
        <section aria-labelledby="schluss-titel" className="pb-[clamp(3.5rem,6vw,5rem)] pt-[clamp(2rem,4vw,3rem)]">
            <div className="wrap">
                <div className="karte relative isolate flex flex-col items-start gap-6 overflow-hidden rounded-[1.5rem] border-line-2 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between md:px-14">
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-6 top-0 h-[2px] w-16 rounded-full bg-brand sm:left-10 md:left-14"
                    />
                    <h2 id="schluss-titel" className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-[1.05] tracking-[-0.04em]">
                        Sprechen wir über Ihre Gemeinde.
                    </h2>
                    <div className="flex flex-none flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 [&_.btn]:whitespace-nowrap">
                        <WebsiteKnopf />
                        <a href={KONTAKT.telefonHref} className="link inline-flex min-h-[2.75rem] items-center gap-2 whitespace-nowrap font-medium text-ink">
                            <Phone aria-hidden="true" size={18} strokeWidth={1.75} className="text-brand-ink" />
                            {KONTAKT.telefon}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
