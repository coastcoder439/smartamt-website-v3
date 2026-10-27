// Kundenstimmen der NX7.AGENCY für den Abschnitt „Referenzen“.
//
// Zitate wörtlich aus docs/research/current-sites.md, Abschnitt 5.3 (Startseite nx7.agency, „Referenzen“).
// Die Zuordnung (Person, Rolle, Firma, Ort, Projekt) steht dort in derselben Zeile. Reihenfolge laut
// Bauauftrag: öffentliche Hand zuerst.
//
// Logos: Es gibt eines nur dort, wo der NX7-Kundenslider (current-sites.md, Abschnitt „Kundenlogo-Slider“, Dateiliste
// „Kundenlogos“) die Datei liefert: Hessische Landeszentrale (hlpb.png), INC (inc.png) und Purple (purple.svg).
// Freigabe laut Owner 26.10.2026: „du kannst ALLES übernehmen von nx7 die ganzen kunden“. Für das Landratsamt
// Fürstenfeldbruck, Molecular Instruments, Tozu Investments und The Climate Consultancy liegt kein Logo vor; dort
// steht ein Initialkreis in Brand-50 (nichts nachgebaut oder erfunden).

export type Referenz = {
    zitat: string;
    name: string;
    rolle: string;
    firma: string;
    /** Ort und Zeitpunkt, soweit in der Quelle genannt. */
    ort?: string;
    projekt: string;
    /** Kurzzeichen für den Initialkreis, wenn es kein Logo gibt. */
    kuerzel: string;
    /** Dateiname des Kundenlogos aus c1/kunden-logos.ts (NX7-Kundenslider), sofern vorhanden. */
    logo?: string;
    oeffentlich?: boolean;
};

export const REFERENZEN: readonly Referenz[] = [
    {
        zitat: 'NX7 war unser Retter in der zeitlichen Notlage. Sie haben es möglich gemacht, unser Projekt rechtzeitig abzuschließen, zu präsentieren und zu veröffentlichen.',
        name: 'Silke Seitz',
        rolle: 'Projektleitung',
        firma: 'Landratsamt Fürstenfeldbruck',
        ort: 'Bayern, September 2022',
        projekt: 'Website & Social Media',
        kuerzel: 'LF',
        oeffentlich: true,
    },
    {
        zitat: 'NX7 hat uns bei der Entwicklung eines modernen Kommunikationskonzepts für das Notaufnahmelager Gießen unterstützt – von der Social-Media-Strategie bis zur digitalen Kommunikation.',
        name: 'NAL Team',
        rolle: 'Projektkoordination',
        firma: 'Hessische Landeszentrale für politische Bildung',
        ort: 'Hessen',
        projekt: 'Kommunikationskonzept',
        kuerzel: 'HL',
        logo: 'hlpb.png',
        oeffentlich: true,
    },
    {
        zitat: 'Für uns als Unternehmen ist eine fehlerfreie und ansprechende Website im täglichen Geschäft unerlässlich. NX7 ist stets erreichbar und behebt Fehler umgehend.',
        name: 'Franziska Smetana',
        rolle: 'Marketing Specialist',
        firma: 'INC Innovation Center GmbH',
        projekt: 'Website & Support',
        kuerzel: 'IN',
        logo: 'inc.png',
    },
    {
        zitat: 'NX7 war einer der besten Website-Partner, die wir uns jemals hätten wünschen können. Sie sind über unsere Erwartungen hinausgegangen.',
        name: 'Joyce Yoo',
        rolle: 'Marketing Lead',
        firma: 'Molecular Instruments',
        ort: 'Kalifornien, USA',
        projekt: 'Marketing Website',
        kuerzel: 'MI',
    },
    {
        zitat: 'Die technische Umsetzung durch NX7 war hervorragend. Komplexe Anforderungen wurden effizient und sauber implementiert.',
        name: 'Purple Team',
        rolle: 'Product',
        firma: 'Purple',
        projekt: 'Tech-Umsetzung',
        kuerzel: 'PU',
        logo: 'purple.svg',
    },
    {
        zitat: 'Die Zusammenarbeit war eine wahre Freude. Geduldig, pünktlich und niemals den einfachen Weg beim Design. Das Branding und die E-Commerce-Lösung haben Millionen-Umsätze generiert.',
        name: 'Tommy Bui',
        rolle: 'Co-Founder & CEO',
        firma: 'Tozu Investments PTY LTD',
        ort: 'Australien',
        projekt: 'E-Commerce & Branding',
        kuerzel: 'TO',
    },
    {
        zitat: 'Ihre Strategiesitzung half mir, die Vision für mein Unternehmen zu gestalten, und gab mir ein klares Gefühl dafür, welche Schritte als nächstes anzugehen sind.',
        name: 'Marian Fletcher',
        rolle: 'Founder',
        firma: 'The Climate Consultancy',
        ort: 'UK',
        projekt: 'Digitale Strategie',
        kuerzel: 'TC',
    },
];
