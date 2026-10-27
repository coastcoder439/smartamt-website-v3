/**
 * Die sechs Beispielbefunde unter dem Vorher/Nachher (Website v2, Nachtrag 1, N4). Owner 26.10.2026: „Natürlich übernimmst
 * du das genauso, wie Tobi das gemacht hat, mit diesen Befunden … das packen wir alles schön wie bei Tobi gebündelt unter
 * diese vorher nacher schieber“.
 *
 * Inhalt wie auf Tobis Seite (smartamt.staging.nx7.agency), Zahlen sind eine Demo: Owner „Das ist doch musterbach.de,
 * Gemeinde Musterbach“. Darum trägt die Liste den Hinweis HINWEIS_DEMO; den Satz „aus einer echten Prüfung im September 2026“
 * übernimmt die Seite nicht. Der Satz AUSSAGE_PFLICHT ist eine Aussage von Tobi; wir haben ihn nicht selbst belegt.
 */

export type Befund = {
    id: string;
    befund: string;
    vorher: string;
    nachher: string;
};

export const BEFUNDE: readonly Befund[] = [
    {
        id: 'karten',
        befund: 'Google-Karten ohne Einwilligung',
        vorher: 'IP-Adressen gehen an Google',
        nachher: 'Karte lädt erst nach Klick',
    },
    {
        id: 'datenschutz',
        befund: 'Datenschutzerklärung unvollständig',
        vorher: 'Google kommt darin nicht vor',
        nachher: 'Beschreibt, was die Seite tut',
    },
    {
        id: 'erklaerung',
        befund: 'Barrierefreiheits-Erklärung fremd',
        vorher: 'Vom Hersteller, aus 2021',
        nachher: 'Eigene, aktuelle Erklärung',
    },
    {
        id: 'bilder',
        befund: 'Bilder ohne Beschreibung',
        vorher: '153 von 281 Bildern',
        nachher: 'Jedes Bild beschrieben',
    },
    {
        id: 'zoom',
        befund: 'Zoomen am Handy gesperrt',
        vorher: '21 von 29 Seiten',
        nachher: 'Überall vergrößerbar',
    },
    {
        id: 'sprung',
        befund: 'Kein Sprung zum Inhalt',
        vorher: 'Tastatur muss durchs ganze Menü',
        nachher: 'Sprunglink auf jeder Seite',
    },
];

export const HINWEIS_DEMO = 'Beispielbefunde an der Beispielgemeinde Musterbach (erfunden)';

export const AUSSAGE_PFLICHT = 'Alle sechs Punkte sind gesetzliche Vorgaben für öffentliche Stellen.';
