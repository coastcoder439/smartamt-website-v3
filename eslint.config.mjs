import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Flache Konfiguration (ESLint 9). `next lint` gibt es seit Next 16 nicht mehr,
// darum läuft die Prüfung über `npm run lint` direkt mit ESLint.
export default defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            'react/no-unescaped-entities': 'off',
        },
    },
    globalIgnores(['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts', 'scripts/**']),
]);
