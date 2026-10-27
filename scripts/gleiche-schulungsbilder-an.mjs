// Gleicht die drei Schulungsfotos in Ton und Ausschnitt an (lokal, nicht Teil des Builds).
//
//   node scripts/gleiche-schulungsbilder-an.mjs
//
// Warum: Die drei Rohbilder (public/images/schulung/modul-*.png) sind sehr verschieden belichtet: Modul 2 hell und klar,
// Modul 1 flau und stark unscharf, Modul 3 fast schwarz (dunkler Tisch). Nebeneinander in der hellen Kartenreihe wirkte
// Modul 3 wie ein dunkler Fleck. Dieses Skript erzeugt je Modul einen 4:3-Ausschnitt (1200 × 900, WebP), hebt die
// Helligkeit über eine Gamma-Kurve auf einen gemeinsamen Mittelwert, setzt einen leichten Kontrast darüber, hellt die Tiefen
// matt an und schärft Modul 1 behutsam. Die Farben bleiben erhalten (die Seite färbt per CSS schwarz-weiß und beim
// Überfahren leicht farbig). Die Rohbilder bleiben unverändert (Leistungen.tsx nutzt modul-grundlagen.png weiter).
//
// Ergebnis: public/images/schulung/karte-grundlagen.webp, karte-arbeitsalltag.webp, karte-zertifikat.webp
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORDNER = path.join(WURZEL, 'public', 'images', 'schulung');

// Gemeinsames Ziel: mittlere Helligkeit (0 bis 1) nach der Gamma-Kurve, matte Tiefen, leichter Kontrast.
const ZIEL_MITTE = 0.56;
const TIEFEN = 0.07; // Schwarz wird zu 7 % Grau (matt, keine abgesoffenen Flächen)
const KONTRAST = 1.1; // Grundwert; flaue Bilder tragen unten einen eigenen Wert

const BILDER = [
    // links, oben, breite, hoehe des 4:3-Ausschnitts im Rohbild; scharf = Schärfen (sigma)
    { von: 'modul-grundlagen.png', nach: 'karte-grundlagen.webp', ausschnitt: { left: 210, top: 0, width: 1024, height: 768 }, scharf: 1.8, kontrast: 1.2 },
    { von: 'modul-arbeitsalltag.png', nach: 'karte-arbeitsalltag.webp', ausschnitt: { left: 0, top: 120, width: 1024, height: 768 }, scharf: 0 },
    { von: 'modul-zertifikat.png', nach: 'karte-zertifikat.webp', ausschnitt: { left: 235, top: 0, width: 1024, height: 768 }, scharf: 0, kontrast: 1.2 },
];

function helligkeit(r, g, b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

for (const b of BILDER) {
    const quelle = path.join(ORDNER, b.von);
    const grund = sharp(quelle).extract(b.ausschnitt).resize(1200, 900, { kernel: 'lanczos3' });
    const { data, info } = await grund.removeAlpha().raw().toBuffer({ resolveWithObject: true });

    // mittlere Helligkeit des Ausschnitts
    let summe = 0;
    for (let i = 0; i < data.length; i += 3) summe += helligkeit(data[i], data[i + 1], data[i + 2]);
    const mitte = summe / (data.length / 3);

    // Gamma g so, dass mitte^g = ZIEL_MITTE (g < 1 hellt auf, g > 1 dunkelt ab; hier nur Aufhellen bis 1)
    const g = Math.min(1, Math.log(ZIEL_MITTE) / Math.log(mitte));
    const lut = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
        let v = Math.pow(i / 255, g);
        v = (v - 0.5) * (b.kontrast ?? KONTRAST) + 0.5; // Kontrast um die Mitte
        v = TIEFEN + v * (1 - TIEFEN); // matte Tiefen
        lut[i] = Math.round(Math.min(1, Math.max(0, v)) * 255);
    }
    for (let i = 0; i < data.length; i++) data[i] = lut[data[i]];

    let aus = sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
    if (b.scharf > 0) aus = aus.sharpen({ sigma: b.scharf, m1: 1.2, m2: 2.4 });
    const ziel = path.join(ORDNER, b.nach);
    await aus.webp({ quality: 82, effort: 5 }).toFile(ziel);
    console.log(`${b.nach}: Mitte vorher ${mitte.toFixed(3)}, Gamma ${g.toFixed(3)}`);
}
