// Gemeinsame Helfer der Gate-Prüfskripte (übernommen aus neubau-v4-text). Die Skripte lesen nur
// Dateien des Projekts (kein node_modules, kein Netz), damit sie in einer sauberen Git-Kopie
// laufen können. Ausnahme ist roh-html.mjs, das einen laufenden Server abfragt.
import fs from 'node:fs';
import path from 'node:path';

/** Projektwurzel (website/): zwei Ebenen über scripts/gates. */
export const ROOT = path.resolve(import.meta.dirname, '..', '..');

export function lies(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

export function existiert(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

/** Alle .ts/.tsx/.css-Dateien unter src, als Pfade relativ zur Projektwurzel (mit /). */
export function quellen() {
  const aus = [];
  const gehe = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = dir + '/' + e.name;
      if (e.isDirectory()) gehe(rel);
      else if (/\.(tsx?|css)$/.test(e.name)) aus.push(rel);
    }
  };
  gehe('src');
  return aus;
}

/** Gibt die Fehler aus und beendet mit dem passenden Code; nur bei 0 Fehlern erscheint die Marke. */
export function fertig(marke, fehler) {
  if (fehler.length) {
    console.error(`${marke} FEHLGESCHLAGEN`);
    for (const f of fehler) console.error(' - ' + f);
    process.exit(1);
  }
  console.log(marke + ' OK');
}
