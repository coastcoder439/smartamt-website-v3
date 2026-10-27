import type { MetadataRoute } from 'next';

// Im statischen Export entsteht daraus beim Build die Datei manifest.webmanifest.
export const dynamic = 'force-static';

// Ohne Manifest zeigt „Zum Startbildschirm hinzufügen“ einen Screenshot statt des Symbols.
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SmartAmt',
        short_name: 'SmartAmt',
        description: 'Sichere Websites für Gemeinden. Ein Projekt der NX7.AGENCY.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        lang: 'de',
        icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
    };
}
