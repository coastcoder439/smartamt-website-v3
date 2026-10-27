import type { NextConfig } from 'next';

// Statischer Export: `npm run build` erzeugt den Ordner `out/`, der auf jedem Webserver
// liegen kann (heute Vercel, später ein Server in Deutschland). Darum gibt es hier weder
// `headers()` noch API-Routen noch Bildoptimierung. Die Sicherheits-Header stehen in
// `vercel.json` und in `deploy/nginx-headers.conf` (gleiche Werte, geprüft von
// `scripts/gates/header-gleich.mjs`).
const nextConfig: NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
    reactStrictMode: true,
    poweredByHeader: false,
};

export default nextConfig;
