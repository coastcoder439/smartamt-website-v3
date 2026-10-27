'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, Phone, X } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Magnet } from '@/components/ui/Magnet';
import { ScrollTrigger, registerGsap } from '@/lib/gsap';
import { waehleAnliegen } from '@/lib/kontakt';
import { getLenis, handleAnchorClick } from '@/lib/scroll';
import { KONTAKT, MENUE, type MenuePunkt } from '@/lib/site';

/**
 * Kopfzeile (CI v3): Logo links, Navigation in der Mitte, Hauptknopf „Vorschau anfragen“ rechts (Website v2).
 *
 *  - Fest oben. Am Seitenanfang ohne Fläche; sobald gescrollt wird, blendet eine weiße Fläche mit
 *    feiner Unterlinie und leichtem Blur ein (data-gescrollt, ohne React-Rendern gesetzt). Die
 *    Fläche ist eine eigene Ebene hinter der Zeile: Ein Blur direkt am Kopf würde das feste
 *    Menüfeld darin an den Kopf binden statt an den Bildschirm.
 *  - Ganz oben läuft eine 2 px dünne orange Fortschrittslinie (scaleX folgt dem Seitenfortschritt).
 *  - Ab 1024 px steht die Navigation in der Zeile, darunter öffnet ein Menü-Knopf ein Feld über
 *    die ganze Seite (Tastatur: Fokus im Menü gefangen, Escape schließt, der Rest der Seite ist
 *    währenddessen inert).
 *  - Auf dem Handy (unter 768 px) schwebt unten rechts zusätzlich ein runder Anrufknopf (52 px, nur Symbol, der
 *    Name „Anrufen“ steht für Hilfstechnik daran). Er erscheint nur beim Hinaufscrollen, wenn der Hero den
 *    Bildschirm verlassen hat (im Hero steht die Nummer in der Vertrauenszeile), und bleibt beim Lesen
 *    (Hinunterscrollen) weg, damit er keinen Text verdeckt. Solange Kontakt oder Fuß im Bild sind, ist er ebenfalls
 *    weg (dort steht die Nummer ohnehin).
 *  - Anker springen über `scrollToId` aus lib/scroll.ts. Auf anderen Seiten führen die Links
 *    zur Startseite; HashSprung springt dort zum Abschnitt.
 *  - Der aktuelle Abschnitt trägt aria-current="location" und eine orange Unterlinie (nicht nur
 *    eine Farbe).
 */

type Anhaltbar = { stop: () => void; start: () => void };

function sperreScroll(sperren: boolean) {
    const lenis = getLenis() as Anhaltbar | null;
    if (sperren) {
        lenis?.stop();
        document.documentElement.style.overflow = 'hidden';
    } else {
        lenis?.start();
        document.documentElement.style.overflow = '';
    }
}

const FOKUSBAR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Header() {
    const pfad = usePathname();
    const istStart = pfad === '/';
    const kopfRef = useRef<HTMLElement>(null);
    const balkenRef = useRef<HTMLDivElement>(null);
    const knopfRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const anrufRef = useRef<HTMLAnchorElement>(null);
    const [offen, setOffen] = useState(false);
    const [aktiv, setAktiv] = useState<string | null>(null);
    const aktuell = istStart ? aktiv : null;

    // Fläche mit Unterlinie, sobald gescrollt wird, und Fortschrittslinie. Direkt an den Elementen,
    // ohne Rendern. Gemessen wird höchstens einmal pro Bild.
    useEffect(() => {
        const kopf = kopfRef.current;
        const balken = balkenRef.current;
        if (!kopf) return;
        registerGsap();

        let bild = 0;
        const messen = () => {
            bild = 0;
            kopf.toggleAttribute('data-gescrollt', window.scrollY > 8);
            if (balken) {
                const weg = document.documentElement.scrollHeight - window.innerHeight;
                const anteil = weg > 0 ? Math.min(1, Math.max(0, window.scrollY / weg)) : 0;
                balken.style.transform = `scaleX(${anteil})`;
            }
        };
        const planen = () => {
            if (!bild) bild = window.requestAnimationFrame(messen);
        };

        messen();
        window.addEventListener('scroll', planen, { passive: true });
        window.addEventListener('resize', planen);
        ScrollTrigger.addEventListener('refresh', planen);
        return () => {
            if (bild) window.cancelAnimationFrame(bild);
            window.removeEventListener('scroll', planen);
            window.removeEventListener('resize', planen);
            ScrollTrigger.removeEventListener('refresh', planen);
        };
    }, [pfad]);

    // Aktueller Abschnitt: der Abschnitt, der das mittlere Fünftel des Bildschirms schneidet.
    useEffect(() => {
        if (!istStart) return;
        const sichtbar = new Map<string, boolean>();
        const beobachter = new IntersectionObserver(
            (eintraege) => {
                for (const e of eintraege) sichtbar.set(e.target.id, e.isIntersecting);
                const treffer = MENUE.find((m) => sichtbar.get(m.id));
                setAktiv(treffer ? treffer.id : null);
            },
            { rootMargin: '-45% 0px -50% 0px' },
        );
        for (const m of MENUE) {
            const el = document.getElementById(m.id);
            if (el) beobachter.observe(el);
        }
        return () => beobachter.disconnect();
    }, [istStart]);

    // Anrufknopf (Handy): sichtbar nur beim Hinaufscrollen, solange weder Hero noch Kontakt noch Fuß im Bild sind.
    // Beim Lesen (Hinunterscrollen) bleibt er weg und verdeckt keinen Text. Direkt am Element (data-sichtbar), ohne
    // Rendern; CSS blendet ein und aus (.anruf-knopf in globals.css).
    useEffect(() => {
        const knopf = anrufRef.current;
        if (!knopf) return;
        const ziele = [document.getElementById('start'), document.getElementById('kontakt'), document.querySelector('footer')].filter(
            (el): el is HTMLElement => el !== null,
        );
        const belegt = new Map<Element, boolean>();
        let imBild = false;
        let hinauf = false;
        const setzen = () => {
            knopf.dataset.sichtbar = !imBild && hinauf ? 'true' : 'false';
        };
        const beobachter = new IntersectionObserver((eintraege) => {
            for (const e of eintraege) belegt.set(e.target, e.isIntersecting);
            imBild = Array.from(belegt.values()).some(Boolean);
            setzen();
        });
        for (const el of ziele) beobachter.observe(el);

        let letzteY = window.scrollY;
        const beiScroll = () => {
            const y = window.scrollY;
            const weg = y - letzteY;
            if (Math.abs(weg) < 8) return;
            hinauf = weg < 0;
            letzteY = y;
            setzen();
        };
        window.addEventListener('scroll', beiScroll, { passive: true });
        return () => {
            beobachter.disconnect();
            window.removeEventListener('scroll', beiScroll);
        };
    }, [pfad]);

    // Offenes Menü: Scroll sperren, Rest der Seite inert, Fokus ins Menü, Escape schließt.
    useEffect(() => {
        if (!offen) return;
        sperreScroll(true);
        const dahinter = [document.getElementById('inhalt'), document.querySelector('footer')];
        for (const el of dahinter) el?.setAttribute('inert', '');
        const bild = window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('a')?.focus());

        const beiTaste = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOffen(false);
                knopfRef.current?.focus();
            }
        };
        window.addEventListener('keydown', beiTaste);

        return () => {
            window.cancelAnimationFrame(bild);
            window.removeEventListener('keydown', beiTaste);
            for (const el of dahinter) el?.removeAttribute('inert');
            sperreScroll(false);
        };
    }, [offen]);

    // Wird das Fenster breit genug für die Navigation in der Zeile, schließt ein offenes Menü.
    useEffect(() => {
        const breit = window.matchMedia('(min-width: 1024px)');
        const beiAenderung = () => {
            if (breit.matches) setOffen(false);
        };
        breit.addEventListener('change', beiAenderung);
        return () => breit.removeEventListener('change', beiAenderung);
    }, []);

    // Tab bleibt im Menü (Logo, Menü-Knopf und Menüpunkte), solange es offen ist.
    const beiTastendruck = useCallback(
        (e: React.KeyboardEvent<HTMLElement>) => {
            if (!offen || e.key !== 'Tab' || !kopfRef.current) return;
            const ziele = Array.from(kopfRef.current.querySelectorAll<HTMLElement>(FOKUSBAR)).filter(
                (el) => el.offsetParent !== null,
            );
            if (ziele.length === 0) return;
            const erstes = ziele[0];
            const letztes = ziele[ziele.length - 1];
            if (e.shiftKey && document.activeElement === erstes) {
                e.preventDefault();
                letztes.focus();
            } else if (!e.shiftKey && document.activeElement === letztes) {
                e.preventDefault();
                erstes.focus();
            }
        },
        [offen],
    );

    const beiAnker = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        if (offen) sperreScroll(false);
        setOffen(false);
        handleAnchorClick(e, id);
    };

    const beiLogo = (e: React.MouseEvent<HTMLAnchorElement>) => beiAnker(e, '');

    // Menüpunkt auf eine eigene Seite (v3: Über uns, Fragen): normal navigieren, nur das Handy-Menü schließen.
    const beiSeite = () => {
        if (offen) sperreScroll(false);
        setOffen(false);
    };

    // aria-current: „page“ für die geöffnete Unterseite, „location“ für den Abschnitt, der auf der Startseite im Bild ist.
    const aktuellerPunkt = (m: MenuePunkt): 'page' | 'location' | undefined => {
        if (m.href) return pfad === m.href || `${pfad}/` === m.href ? 'page' : undefined;
        return aktuell === m.id ? 'location' : undefined;
    };

    // Hauptknopf: springt zum Kontakt und wählt dort das Anliegen „Vorschau anfragen“ (wie die Knöpfe im Hero und im Angebot).
    const zumKontakt = (e: React.MouseEvent<HTMLAnchorElement>) => {
        waehleAnliegen('website');
        beiAnker(e, 'kontakt');
    };

    return (
        <>
            <header
                ref={kopfRef}
                data-offen={offen ? 'true' : 'false'}
                onKeyDown={beiTastendruck}
                className="group/kopf fixed inset-x-0 top-0 z-50"
            >
                {/* Fläche hinter der Zeile: weiß, feine Unterlinie, leichter Blur. Erscheint beim Scrollen. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 border-b border-line bg-white/90 opacity-0 backdrop-blur-[14px] transition-opacity duration-300 group-data-[gescrollt]/kopf:opacity-100 group-data-[offen=true]/kopf:bg-white group-data-[offen=true]/kopf:opacity-100"
                />

                {/* Fortschrittslinie: 2 px, wächst mit dem Seitenfortschritt */}
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] overflow-hidden">
                    <div
                        ref={balkenRef}
                        className="h-full w-full origin-left bg-brand"
                        style={{ transform: 'scaleX(0)' }}
                    />
                </div>

                <div className="wrap grid h-[var(--header-h)] grid-cols-[auto_1fr_auto] items-center gap-2.5 sm:gap-6 lg:gap-8">
                    <Logo onClick={beiLogo} className="kopf-logo" />

                    <nav aria-label="Hauptnavigation" className="hidden justify-self-center lg:block">
                        <ul className="flex items-center gap-0.5 xl:gap-1.5">
                            {MENUE.map((m) => (
                                <li key={m.id}>
                                    <Link
                                        href={m.href ?? `/#${m.id}`}
                                        onClick={(e) => (m.href ? beiSeite() : beiAnker(e, m.id))}
                                        aria-current={aktuellerPunkt(m)}
                                        className="nav-link"
                                    >
                                        {m.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="col-start-3 flex items-center gap-3">
                        <Magnet className="hidden lg:inline-flex">
                            <ButtonLink href="/#kontakt" className="btn-kopf" onClick={zumKontakt}>
                                Vorschau anfragen
                                <span className="pfeil" aria-hidden="true">
                                    →
                                </span>
                            </ButtonLink>
                        </Magnet>

                        <button
                            ref={knopfRef}
                            type="button"
                            className="btn btn-secondary btn-klein lg:hidden"
                            aria-expanded={offen}
                            aria-controls="menue-panel"
                            onClick={() => setOffen((v) => !v)}
                        >
                            {offen ? (
                                <X aria-hidden="true" size={20} strokeWidth={1.75} />
                            ) : (
                                <Menu aria-hidden="true" size={20} strokeWidth={1.75} />
                            )}
                            {offen ? 'Schließen' : 'Menü'}
                        </button>
                    </div>
                </div>

                <div
                    id="menue-panel"
                    ref={panelRef}
                    hidden={!offen}
                    className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 animate-[panel-ein_0.25s_ease-out] overflow-y-auto bg-white lg:hidden"
                >
                    <nav aria-label="Hauptnavigation" className="wrap flex min-h-full flex-col pb-10 pt-4">
                        <ul>
                            {MENUE.map((m, i) => (
                                <li
                                    key={m.id}
                                    className="animate-[menue-eintrag_0.55s_cubic-bezier(0.16,1,0.3,1)_both]"
                                    style={{ animationDelay: `${60 + i * 55}ms` }}
                                >
                                    <Link
                                        href={m.href ?? `/#${m.id}`}
                                        onClick={(e) => (m.href ? beiSeite() : beiAnker(e, m.id))}
                                        aria-current={aktuellerPunkt(m)}
                                        className="group/punkt flex items-center justify-between border-b border-line py-[18px] text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-ink aria-[current=location]:text-brand-ink aria-[current=page]:text-brand-ink"
                                    >
                                        {m.label}
                                        <ArrowRight
                                            aria-hidden="true"
                                            size={22}
                                            strokeWidth={1.75}
                                            className="text-ink-3 transition-transform duration-300 group-hover/punkt:translate-x-1"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div
                            className="mt-8 flex flex-col gap-3 sm:flex-row animate-[menue-eintrag_0.55s_cubic-bezier(0.16,1,0.3,1)_both]"
                            style={{ animationDelay: `${60 + MENUE.length * 55}ms` }}
                        >
                            <ButtonLink href="/#kontakt" onClick={zumKontakt}>
                                Vorschau anfragen
                                <span aria-hidden="true">→</span>
                            </ButtonLink>
                            <a href={KONTAKT.telefonHref} className="btn btn-secondary">
                                <Phone aria-hidden="true" size={20} strokeWidth={1.75} className="text-brand" />
                                {KONTAKT.telefon}
                            </a>
                        </div>

                        <p className="mt-auto pt-10 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">
                            Ein Projekt der NX7.AGENCY
                        </p>
                    </nav>
                </div>
            </header>

            {/* Schwebender Knopf nur auf dem Handy: rund, weiß, mit orangem Telefon-Symbol. Kommt beim Hinaufscrollen. */}
            <a
                ref={anrufRef}
                href={KONTAKT.telefonHref}
                aria-label="Anrufen"
                className="btn btn-secondary anruf-knopf fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 h-[52px] min-h-0 w-[52px] rounded-full p-0 shadow-md md:hidden"
            >
                <Phone aria-hidden="true" size={22} strokeWidth={1.75} className="text-brand-ink" />
            </a>
        </>
    );
}
