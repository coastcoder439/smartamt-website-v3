'use client';

import Link from 'next/link';
import { Label } from '@/components/ui/Label';

// Fängt Fehler beim Anzeigen einer Seite ab. Der Rest der Seite (Kopf, Fuß) bleibt stehen.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="wrap pb-24 pt-[calc(var(--header-h)+48px)] md:pb-32 md:pt-[calc(var(--header-h)+80px)]">
            <div className="max-w-[40rem]">
                <Label>Fehler</Label>
                <h1 className="mt-4 text-h2">Hier ist etwas schiefgelaufen.</h1>
                <p className="mt-6 max-w-[34em] text-body">
                    Die Seite konnte nicht angezeigt werden. Versuchen Sie es noch einmal oder gehen Sie zurück zur
                    Startseite.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <button type="button" className="btn btn-primary" onClick={() => reset()}>
                        Erneut versuchen
                    </button>
                    <Link href="/" className="btn btn-secondary">
                        Zur Startseite
                    </Link>
                </div>
            </div>
        </div>
    );
}
