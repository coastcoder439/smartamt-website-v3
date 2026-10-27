'use client';

import '@/styles/globals.css';

// Letzte Auffangstelle: Ersetzt das gesamte Layout, wenn dort ein Fehler auftritt. Darum eigene
// html- und body-Elemente, ohne Schriften aus dem Layout (es gelten die Rückfallschriften).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html lang="de">
            <body>
                <main className="wrap py-24">
                    <h1 className="text-h2">Hier ist etwas schiefgelaufen.</h1>
                    <p className="mt-6 max-w-[34em] text-body">
                        Die Seite konnte nicht geladen werden. Versuchen Sie es noch einmal.
                    </p>
                    <div className="mt-8">
                        <button type="button" className="btn btn-primary" onClick={() => reset()}>
                            Erneut versuchen
                        </button>
                    </div>
                </main>
            </body>
        </html>
    );
}
