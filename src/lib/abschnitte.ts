// Schalter: Was die Seite zeigt und was ausgeblendet ist (Website v3, aufgebaut auf v2).
//
// Owner 26.10.2026: „wir haben uns darauf geeinigt, dass wir das auf jeden Fall mit den KI-Fortbildungen und so erstmal
// rausnehmen, weil wir aktuell keinen haben, der diese KI-Fortbildung machen kann.“ und „Ich will aber nicht, dass du quasi
// diese ganzen anderen Sachen einfach löscht, ne? Die kannst du ja alle quasi ausblenden, archivieren, ne? Weil die ganzen
// anderen Dinger, die du gebaut hast, sind prinzipiell auch teilweise geil. Aber ein bisschen zu viel.“
//
// Darum steht hier jeder ausgeblendete Teil als Schalter auf `false`. Komponenten, Texte, Bilder und Daten der
// ausgeblendeten Teile bleiben unverändert im Code; ein Schalter auf `true` zeigt den Teil wieder, Menü, Sprungleisten und
// Fuß folgen automatisch. Nichts davon ist gelöscht.
//
// Website v3 (docs/packages/03-website-v3): Die Startseite wird eine kurze Verkaufsseite, Identität und Details stehen auf
// Unterseiten. Owner 27.10.2026: „Also quasi aufgeräumter, ne, wirklich auf den Fokus auf das Wesentliche und die Selling
// Points und den Sales legen. Und ein ganz bisschen nur die Identität von SmartAmt.“ und „Oder vielleicht das Ganze halt
// auch besser aufteilen mit auf Unterseiten einfach, so eine schöne Landingpage, dann Mission, dann wer sind wir, etc.“
// Team, Mission und Lage stehen auf /ueber-uns, Fragen und Recht & Sicherheit auf /fragen; auf der Startseite sind sie
// über diese Schalter ausgeblendet, nicht gelöscht.

/** Abschnitte der Startseite (Anker-Kennung der Seite). */
export type AbschnittId =
    | 'websites'
    | 'angebot'
    | 'ablauf'
    | 'referenzen'
    | 'ueber-uns'
    | 'faq'
    | 'kontakt'
    | 'leistungen'
    | 'schulungen'
    | 'lage'
    | 'recht'
    | 'vision';

export const ABSCHNITTE: Readonly<Record<AbschnittId, boolean>> = {
    // sichtbar auf der Startseite v3
    websites: true,
    angebot: true,
    ablauf: true, // in v3 Teil des Angebots (Anker #ablauf in Angebot.tsx), siehe EINZELNES.ablaufEigenerAbschnitt
    referenzen: true, // in v3 „Vertrauen“: Logo-Band und zwei Kundenzitate
    kontakt: true,
    // v3: auf der Startseite ausgeblendet, stehen auf den Unterseiten /ueber-uns (Team) und /fragen (Fragen)
    'ueber-uns': false,
    faq: false,
    // ausgeblendet seit v2 (nicht gelöscht; Lage und Vision stehen in v3 auf /ueber-uns, Recht auf /fragen)
    leistungen: false, // Kacheln „Was wir für Ihre Gemeinde tun“ (Websites, KI-Fortbildung, IT-Schulungen, Recht)
    schulungen: false, // KI-Fortbildung mit Preis und Modulen, IT-Schulungen
    lage: false, // Lage der Gemeinden (UN-Ranking)
    recht: false, // Recht und Sicherheit (Akkordeon)
    vision: false, // Missionstext
};

/** Ist der Abschnitt mit dieser Anker-Kennung sichtbar? Unbekannte Kennungen gelten als sichtbar. */
export function abschnittSichtbar(id: string): boolean {
    return id in ABSCHNITTE ? ABSCHNITTE[id as AbschnittId] : true;
}

/** Einzelne Teile innerhalb sichtbarer Abschnitte. `false` = ausgeblendet, der Code bleibt. */
export const EINZELNES = {
    /** Hero-Knopf „KI-Fortbildung ansehen“. */
    heroKnopfSchulung: false,
    /** Schritt „Schulung“ im Ablauf. */
    ablaufSchrittSchulung: false,
    /** Team-Mitglied Eremiya Rifat (Schulungsleiter). */
    teamEremiyaRifat: false,
    /** Kontakt-Anliegen „KI-Fortbildung anfragen“. */
    anliegenSchulung: false,
    /** Kontakt-Anliegen „IT-Schulung anfragen“. */
    anliegenItSchulung: false,
    /** FAQ-Fragen zu KI und Schulungen. */
    faqSchulung: false,
    /** Beraterkarte im Erstgespräch-Band (Tobias und Leon stehen schon im Team und in den direkten Wegen). */
    kontaktBeraterkarte: false,
    /** Zeile „Kennenlerntermin buchen“ in den direkten Wegen (derselbe Link wie der Knopf „Erstgespräch buchen“). */
    kontaktKennenlernZeile: false,
    /** Hinweis „Alle Preise zzgl. 19 % MwSt.“ im Fuß (v2 nennt keine Preise, die stehen bei den Schulungen). */
    fussPreiseMwSt: false,
    /**
     * Problem-Abschnitt „Was Ihre Gemeinde hinter sich lässt“: die drei großen Karten mit Mini-Ansichten (Technik,
     * Barrierefreiheit, Recht), die Einleitung, der Hinweis „Beispielansichten“ und die Leitlinie zum Band. Owner
     * 26.10.2026: „das ist viel zu komplex dargestellt, viel zu komplex, viel zu viel Text, viel zu viele Sachen“. Übrig
     * bleiben Überschrift, drei einzeilige Aussagen und das Band. Code: sections/c1/ProblemKarten.tsx.
     */
    problemKarten: false,
    /** Satz „So sieht der digitale Ortseingang aus …“ neben dem Knopf im Band „Sicher. Funktional. Rechtskonform.“. */
    problemBandSatz: false,
    /**
     * Hero: die alte Karte „Website-Check“ (hero/WebsiteCheck.tsx) mit Browser-Leiste und Adresse www.musterbach.de, den
     * schwebenden Hinweiskästchen („Art. 32 DSGVO“, „Barrierefreiheit WCAG 2.1 AA“), Strichen und der Prüfliste mit Ring
     * „5 von 5 erfüllt“. Owner 26.10.2026: „den Header bei uns, also da, ne, dieses, dieses Ding mit www.musterbach.de, das ist
     * komplett überfordernd“ und „diese Dinger noch abgehen, das packen wir alles schön wie bei Tobi gebündelt unter diese
     * vorher nacher schieber“. An ihrer Stelle zeigt der Hero die fertige Beispielgemeinde als ruhige Karte
     * (hero/HeroMusterbach.tsx); die Prüfpunkte stehen in der Befund-Liste unter dem Vorher/Nachher.
     */
    heroWebsiteCheck: false,
    /**
     * Websites: die Befund-Tabelle unter dem Vorher/Nachher (b2/Befunde.tsx, sechs Zeilen mit Zähler, die erst beim Weiterscrollen
     * hinter dem Schieber vorbeizog). Owner 26.10.2026: „Die Befunde, das ist falsch, das ist nicht so wie bei Tobi … Das ist mit
     * dem Scroll verbunden, aber kein Mensch, es kann gar keiner sehen, weil es in der nächsten Sektion sitzt.“ An ihrer Stelle
     * stehen die sechs Karten im selben angehefteten Bild wie der Wisch (b2/Vergleich.tsx, b2/BefundKarten.tsx).
     */
    befundTabelle: false,
    /**
     * Farbwahl: kleiner Schalter unten links (Palette-Symbol), der die Markenfarbe der ganzen Seite umschaltet
     * (?farbe=orange | hellblau | violett | gruen in der Adresse). Für Tobi und zum Vergleichen; vor dem echten
     * Livegang auf false. Bei false steht weder der Schalter noch das Skript im Kopf im HTML; die Seite bleibt Orange.
     */
    farbwahl: true,
    /**
     * v3, Startseite: Angebot und Ablauf in einem Abschnitt (vier Vorteile, vier Schritte, ein Knopf). Owner 27.10.2026:
     * „wirklich auf den Fokus auf das Wesentliche und die Selling Points und den Sales legen“. Bei true steht der Ablauf
     * wieder als eigener Abschnitt mit Scroll-Linie, Zähler und Brief-Bild (Ablauf.tsx), wie in v2.
     */
    ablaufEigenerAbschnitt: false,
    /**
     * v3, Hero: der erste Satz „Die Website ist das Erste, was Bürgerinnen, Bürger und Unternehmen von Ihrer Gemeinde sehen.“
     * Im Hero steht nur noch das Versprechen in einem Satz (Plan 03-website-v3, Punkt 1a).
     */
    heroErsterSatz: false,
    /**
     * v3, Hero: der eine Satz nennt das Angebot selbst („Wir bauen Websites für Gemeinden, Ämter und Behörden: sicher,
     * barrierefrei und rechtskonform.“) statt nur „Wir machen Ihre Website …“; Prüfer Runde 1: das Angebot stand nur im
     * kleinen Label. Bei false steht wieder der Satz aus v2.
     */
    heroSatzMitAngebot: true,
    /** v2: Zeile „Auf einen Blick“ mit Sprungzielen unter der Vertrauenszeile im Hero. v3: ausgeblendet (doppelt zum Menü). */
    heroSprungzeile: false,
    /**
     * v3, Problem („Was Ihre Gemeinde hinter sich lässt.“) als dunkler Abschnitt (Fläche --night, NX7-Echo der CI): das, was
     * hinter der Gemeinde liegt, steht im Dunkeln, das Neue danach hell. Prüfer Runde 1: acht Bildschirme nur Weiß und Grau,
     * kein Wechsel im Takt. Bei false wieder die warme helle Fläche aus v2.
     */
    problemDunkel: true,
    /**
     * v3, Kontakt: Ansprechpartner mit Gesicht. Unten links im Kontakt („Sprechen wir über Ihre Gemeinde.“) stehen Leon und
     * Tobias je als kompakte Karte mit rundem Porträt, Name, Rolle und ihren direkten Wegen (Form wie auf Tobis Seite, unser
     * Stil); sie ersetzen die drei Zeilen Telefon, E-Mail, Telefon. Owner 27.10.2026: „Ansprechpartner sollen bitte aber auf
     * die Landingpage mit drauf, also Leon Pöskin und Tobi sollen bitte auf jeden Fall vorkommen da trotzdem auch kurz in einem
     * Banner wenigstens. … Also du musst ja nicht diese ganze Sektion einbauen, aber wenigstens, dass die Gesichter mal zu sehen
     * sind. Ja, so wie auf Tobis Seite“. Bei false wieder die drei Zeilen aus v2.
     */
    kontaktGesichter: true,
    /**
     * v3: Punktraster-Hintergründe (Klasse .dot-grid: Problem, Mission, Lage-Licht, Kopf der Unterseiten und Rechtsseiten, Schluss
     * im Angebot, 404). Bei false sind sie auf allen Seiten abgeschaltet (Klasse `punkte-aus` am <html>, globals.css); nur das
     * Raster im Hero der Startseite (.hero-dots) bleibt, gedämpft. Owner 27.10.2026: „Ich will nicht überall diese gepunkteten
     * Hintergründe. Das ist schon wieder viel zu viel fürs Auge.“ und „aber nicht überall diese gepunkteten Hintergründe. Das
     * gefällt mir nicht. Das sieht sehr nach KI aus.“ Bei true wieder alle Raster wie in v2.
     */
    punktraster: false,
    /** v2-Platz des Logo-Bandes der Kunden direkt unter dem Hero. In v3 steht es im Teil „Vertrauen“ über den Zitaten. */
    kundenUnterHero: false,
    /** v2: zweite, gegenläufige Spur im Logo-Band der Kunden (reine Dekoration). v3: ein Band. */
    kundenZweiteSpur: false,
    /** v2: das laufende Band mit sieben Kundenzitaten (Referenzen.tsx). In v3 stehen zwei Zitate fest (Stimmen.tsx). */
    referenzenBand: false,
    /** v3, Angebot: Vergleich „Übliches Projekt“ gegen SmartAmt (zwei Spalten). Code in Angebot.tsx. */
    angebotVergleich: false,
    /** v3, Angebot: die sechs kleinen Merkmale (ohne Cookies, BITV 2.0, Redaktion, Wappenfarben, Umzug, alte Links). */
    angebotMerkmale: false,
    /** v3, Angebot: Schlusskarte „Preis auf Anfrage. Ihr Angebot kommt mit der Vorschau.“ mit Leitlinie. */
    angebotSchlusskarte: false,
    /** v3, Websites: die Prüfliste neben der Überschrift (b2/Pruefliste.tsx); an ihrer Stelle steht der Knopf. */
    websitesPruefliste: false,
    /** v3, Kontakt: das große Band „Erstgespräch in 25 Minuten“ über dem Formular; der Termin-Link steht klein beim Kontakt. */
    kontaktErstgespraechBand: false,
    /** v3, Lage (/ueber-uns): der Halbsatz „und mit Schulungen, die entlasten“ (Schulungen werden derzeit nicht angeboten). */
    lageSchulungen: false,
    /** v3, Recht & Sicherheit (/fragen): der Eintrag „KI-Kompetenz im Team“ mit dem Angebot KI-Fortbildung. */
    rechtKi: false,
} satisfies Record<string, boolean>;
