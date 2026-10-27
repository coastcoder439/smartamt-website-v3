import type { Config } from 'tailwindcss';

// Gestaltungssystem SmartAmt, CI v3 (docs/brand/brand-identity.md): hell, freundlich, NX7-Familie.
// Die Farbwerte stehen einmal in src/styles/globals.css (:root, dazu die drei weiteren Farbvarianten der Farbwahl)
// und werden hier nur referenziert. Die Marke folgt damit der gewählten Variante (data-farbe am html-Element).
const config: Config = {
    content: ['./src/**/*.{ts,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: 'var(--brand)',
                    600: 'var(--brand-600)',
                    ink: 'var(--brand-ink)',
                    50: 'var(--brand-50)',
                    100: 'var(--brand-100)',
                    // Markenfarbe auf dunklen Flächen (.surface-night)
                    hell: 'var(--brand-hell)',
                },
                // Schrift und Haken auf bg-brand (Orange: Tinte, sonst Weiß)
                'on-brand': 'var(--on-brand)',
                ink: {
                    DEFAULT: 'var(--ink)',
                    2: 'var(--ink-2)',
                    3: 'var(--ink-3)',
                },
                bg: {
                    DEFAULT: 'var(--bg)',
                    2: 'var(--bg-2)',
                    3: 'var(--bg-3)',
                },
                line: {
                    DEFAULT: 'var(--line)',
                    2: 'var(--line-2)',
                },
                night: 'var(--night)',
                // offen = Bernstein (warn), erfüllt = Grün (ok), Rot (bad) nur klein für Formularfehler
                warn: { DEFAULT: 'var(--warn)', 50: 'var(--warn-50)', dot: 'var(--warn-dot)' },
                ok: { DEFAULT: 'var(--ok)', 50: 'var(--ok-50)', hell: 'var(--ok-hell)' },
                bad: { DEFAULT: 'var(--bad)', 50: 'var(--bad-50)' },
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            },
            // H1 44 px (360 px Breite) bis 92 px (1440 px), H2 32 bis 56 px, Fließtext 17 bis 18 px.
            fontSize: {
                display: ['clamp(2.75rem, 1.9rem + 4.4vw, 5.75rem)', { lineHeight: '1', letterSpacing: '-0.045em', fontWeight: '700' }],
                h1: ['clamp(2.75rem, 1.9rem + 4.4vw, 5.75rem)', { lineHeight: '1', letterSpacing: '-0.045em', fontWeight: '700' }],
                h2: ['clamp(2rem, 1.5rem + 2.3vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '700' }],
                h3: ['clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
                lead: ['clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
                body: ['clamp(1.0625rem, 1.04rem + 0.1vw, 1.125rem)', { lineHeight: '1.65' }],
                klein: ['0.9375rem', { lineHeight: '1.5' }],
                label: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.14em' }],
            },
            borderRadius: {
                knopf: '12px',
                karte: '16px',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
            },
            maxWidth: {
                inhalt: '1240px',
                lesen: '66ch',
            },
        },
    },
    plugins: [],
};

export default config;
