'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { gsap, registerGsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';
import { ANSPRECHPARTNER as PERSONEN } from './personen';
import { useBewegungErlaubt } from './useBewegungErlaubt';

/**
 * Die Beraterkarte im hellen Erstgespräch-Band: weiße Karte mit weichem Schatten, Foto (128 px), Name, Rolle und dem
 * Satz aus der Copy („Über uns“). Sie wechselt alle 4 Sekunden zwischen Leon Pösken und Tobias Steffen (erst
 * blendet die eine Person aus, dann die andere ein; nur Deckkraft und ein kleiner Versatz, nie zwei Texte
 * gleichzeitig sichtbar). Unter der Person zeigt ein Streifen pro Person den Lauf der
 * 4 Sekunden (scaleX); ein Klick auf einen Streifen wählt die Person. Beim Überfahren und bei Tastaturfokus hält
 * der Wechsel an. Alle Texte stehen in personen.ts (ANSPRECHPARTNER: Leon zuerst, dann Tobias).
 *
 * Ohne JavaScript und bei reduzierter Bewegung gibt es keinen Wechsel: Beide Personen stehen untereinander
 * auf der Karte (Server-HTML = Endzustand). Der Takt kommt von einem GSAP-Tween am Streifen; Aufräumen mit
 * gsap.context().revert().
 */

const DAUER = 4;

export default function Beraterkarte() {
    const live = useBewegungErlaubt();
    const [aktiv, setAktiv] = useState(0);
    const wurzel = useRef<HTMLDivElement>(null);
    const lauf = useRef<gsap.core.Tween | null>(null);
    const ueber = useRef(false);

    useIsoLayoutEffect(() => {
        const el = wurzel.current;
        if (!live || !el) return;
        registerGsap();
        const balken = el.querySelector<HTMLElement>(`[data-lauf="${aktiv}"]`);
        if (!balken) return;

        const ctx = gsap.context(() => {
            lauf.current = gsap.fromTo(
                balken,
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: DAUER,
                    ease: 'none',
                    onComplete: () => setAktiv((i) => (i + 1) % PERSONEN.length),
                },
            );
            if (ueber.current) lauf.current.pause();
        }, el);

        return () => {
            ctx.revert();
            lauf.current = null;
        };
    }, [live, aktiv]);

    const anhalten = () => {
        ueber.current = true;
        lauf.current?.pause();
    };
    const weiter = () => {
        ueber.current = false;
        lauf.current?.play();
    };

    return (
        <div
            ref={wurzel}
            onPointerEnter={(e) => e.pointerType === 'mouse' && anhalten()}
            onPointerLeave={(e) => e.pointerType === 'mouse' && weiter()}
            onFocus={anhalten}
            onBlur={weiter}
            className="rounded-[1.25rem] border border-line bg-bg p-6 shadow-lg sm:p-8 sm:pb-5"
        >
            <ul role="list" className={cn('grid gap-8', live && 'gap-0')}>
                {PERSONEN.map((person, index) => {
                    const sichtbar = !live || index === aktiv;
                    return (
                        <li
                            key={person.name}
                            aria-hidden={sichtbar ? undefined : true}
                            className={cn(
                                !live && index > 0 && 'border-t border-line pt-8',
                                live && '[grid-area:1/1] transition-[opacity,transform]',
                                // Nacheinander statt übereinander: Die gehende Person blendet in 250 ms aus, erst danach
                                // (Verzögerung 250 ms) blendet die kommende ein. So liegen nie zwei Texte halbtransparent
                                // aufeinander.
                                live &&
                                    (sichtbar
                                        ? 'translate-y-0 opacity-100 delay-[260ms] duration-500 ease-out'
                                        : 'pointer-events-none translate-y-2 opacity-0 delay-0 duration-[250ms] ease-in'),
                            )}
                        >
                            <div className="flex items-center gap-5">
                                <Image
                                    src={person.foto}
                                    width={person.breite}
                                    height={person.hoehe}
                                    alt={sichtbar ? person.alt : ''}
                                    sizes="128px"
                                    className="h-[6rem] w-[6rem] flex-none rounded-2xl object-cover ring-4 ring-brand-100 sm:h-[8rem] sm:w-[8rem]"
                                />
                                <div className="min-w-0">
                                    <p className="text-[1.375rem] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[1.5rem]">
                                        {person.name}
                                    </p>
                                    <p className="mt-2 font-mono text-[0.75rem] font-medium uppercase leading-relaxed tracking-[0.08em] text-brand-ink">
                                        {person.rolle.split(' · ').map((teil) => (
                                            <span key={teil} className="block">
                                                {teil}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-2">{person.satz}</p>
                        </li>
                    );
                })}
            </ul>

            {live ? (
                <div className="mt-5 flex gap-2" role="group" aria-label="Person wählen">
                    {PERSONEN.map((person, index) => (
                        <button
                            key={person.name}
                            type="button"
                            onClick={() => setAktiv(index)}
                            aria-pressed={index === aktiv}
                            aria-label={`${person.name} zeigen`}
                            className="group/streifen flex min-h-[2.75rem] flex-1 items-center"
                        >
                            <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-line-2">
                                <span
                                    data-lauf={index}
                                    className={cn(
                                        'absolute inset-0 origin-left rounded-full bg-brand',
                                        index === aktiv ? '' : 'scale-x-0',
                                    )}
                                />
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
