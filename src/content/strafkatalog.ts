export const POINT_DELTA = 1 as const

export type CatalogEntryType = 'strafe' | 'wiedergutmachung'

export interface CatalogEntry {
  id: string
  type: CatalogEntryType
  title: string
  description: string
  category: string
}

function strafe(id: string, category: string, title: string, description: string): CatalogEntry {
  return { id, type: 'strafe', category, title, description }
}

function wiedergutmachung(
  id: string,
  category: string,
  title: string,
  description: string
): CatalogEntry {
  return { id, type: 'wiedergutmachung', category, title, description }
}

export const STRAFEN: CatalogEntry[] = [
  // Kommunikation
  strafe('s-kom-1', 'Kommunikation', 'Zu spät geantwortet', 'Die Nachricht lag zu lange — ohne kurzes Zeichen.'),
  strafe('s-kom-2', 'Kommunikation', 'Absichtlich ignoriert', 'Gelesen, verstanden — und trotzdem Stille.'),
  strafe('s-kom-3', 'Kommunikation', 'Auf „seen" gelassen', 'Gelesen, aber nicht beantwortet.'),
  strafe('s-kom-4', 'Kommunikation', 'Kalte Kurzantwort', 'Nur „ok", „ja" oder „ka" — ohne Wärme.'),
  strafe('s-kom-5', 'Kommunikation', 'Gespräch abgewürgt', 'Mitten im wichtigen Moment abgebrochen.'),

  // Verhalten
  strafe('s-ver-1', 'Verhalten', 'Frech gewesen', 'Frecher Ton, Seitenhieb oder bewusst provokante Worte.'),
  strafe('s-ver-2', 'Verhalten', 'Unnötig provoziert', 'Absichtlich gereizt — ohne echten Grund.'),
  strafe('s-ver-3', 'Verhalten', 'Falscher Ton', 'Schärfer oder kälter als nötig.'),
  strafe('s-ver-4', 'Verhalten', 'Übertrieben reagiert', 'Die Reaktion war größer als das Thema.'),
  strafe('s-ver-5', 'Verhalten', 'Drama gemacht ohne Grund', 'Sturm, obwohl es keinen brauchte.'),

  // Kopf / Beziehung
  strafe('s-kopf-1', 'Kopf / Beziehung', 'Nicht ehrlich kommuniziert', 'Wichtiges verschwiegen oder beschönigt.'),
  strafe('s-kopf-2', 'Kopf / Beziehung', 'Dinge reingefressen', 'Gegessen statt gesagt.'),
  strafe('s-kopf-3', 'Kopf / Beziehung', 'Zu viel Kopfkino ohne zu reden', 'Im Kopf dramatisiert — nicht ausgesprochen.'),
  strafe('s-kopf-4', 'Kopf / Beziehung', 'Unsicherheit nicht geteilt', 'Zweifel allein getragen statt geteilt.'),
  strafe('s-kopf-5', 'Kopf / Beziehung', 'Rückzug ohne Erklärung', 'Weggezogen — ohne ein Wort.'),

  // Alltag
  strafe('s-all-1', 'Alltag', 'Zu spät gekommen', 'Die Zeit wurde nicht eingehalten.'),
  strafe('s-all-2', 'Alltag', 'Etwas vergessen', 'Wichtiges liegen gelassen — trotz Absprache.'),
  strafe('s-all-3', 'Alltag', 'Plan nicht eingehalten', 'Abgemacht war abgemacht.'),
  strafe('s-all-4', 'Alltag', 'Verabredung unnötig verschoben', 'Ohne guten Grund verschoben.'),

  // Spielerisch / Beziehung
  strafe('s-spiel-1', 'Spielerisch / Beziehung', 'Extra Eifersuchts-Trigger', 'Bewusst neidisch gemacht — spielerisch, aber fällig.'),
  strafe('s-spiel-2', 'Spielerisch / Beziehung', 'Zu wenig Aufmerksamkeit gegeben', 'Da, aber nicht wirklich da.'),
  strafe('s-spiel-3', 'Spielerisch / Beziehung', 'Kein „Ich denk an dich"-Tag', 'Kein Zeichen — obwohl es leicht gewesen wäre.'),
  strafe('s-spiel-4', 'Spielerisch / Beziehung', 'Kuschelfaktor vernachlässigt', 'Nähe zu kurz gekommen.'),

  // Charta (PDF Strafenkatalog)
  strafe('s-chart-1', 'Charta', 'Widerspruch = verloren', 'Widerspruch = verloren ❤️'),
  strafe('s-chart-2', 'Charta', '3× Ich liebe dich pro Stunde', "3× 'Ich liebe dich' pro Stunde 🔐"),
  strafe('s-chart-3', 'Charta', 'Kuschelpflicht ohne Limit', 'Kuschelpflicht ohne Limit 💍'),
  strafe('s-chart-4', 'Charta', 'Mindestens 10 Küsse', 'Mindestens 10 Küsse 💋'),
  strafe('s-chart-5', 'Charta', 'Für immer exklusiv', 'Für immer exklusiv ♾️'),
]

export const WIEDERGUTMACHUNGEN: CatalogEntry[] = [
  // Kommunikation
  wiedergutmachung(
    'w-kom-1',
    'Kommunikation',
    'Offenes Gespräch geführt',
    'Ehrlich geredet — ohne Ausweichen.'
  ),
  wiedergutmachung('w-kom-2', 'Kommunikation', 'Aktiv zugehört', 'Wirklich da gewesen — nicht nur anwesend.'),
  wiedergutmachung(
    'w-kom-3',
    'Kommunikation',
    'Ehrlich ausgesprochen, was los ist',
    'Klartext statt Rätselraten.'
  ),

  // Nähe
  wiedergutmachung('w-naehe-1', 'Nähe', 'Ehrliche liebe Nachricht', 'Von Herzen — nicht nur Pflicht.'),
  wiedergutmachung('w-naehe-2', 'Nähe', 'Spontaner Anruf', 'Einfach so — weil du fehlst.'),
  wiedergutmachung('w-naehe-3', 'Nähe', 'Nähe bewusst gegeben', 'Körperlich oder emotional — bewusst.'),
  wiedergutmachung(
    'w-naehe-4',
    'Nähe',
    '„Ich brauch dich"-Moment gut aufgefangen',
    'Gehalten, als es wichtig war.'
  ),

  // Spielerisch / Süß
  wiedergutmachung('w-suess-1', 'Spielerisch / Süß', 'Kleine Überraschung gemacht', 'Unerwartet liebevoll.'),
  wiedergutmachung('w-suess-2', 'Spielerisch / Süß', 'Süßen Text geschickt', 'Worte, die wärmen.'),
  wiedergutmachung('w-suess-3', 'Spielerisch / Süß', 'Voice-Nachricht geschickt', 'Deine Stimme — persönlich.'),
  wiedergutmachung('w-suess-4', 'Spielerisch / Süß', 'Meme / Insider geschickt', 'Euer Code — geteilt.'),

  // Verbindung
  wiedergutmachung(
    'w-verb-1',
    'Verbindung',
    'Gemeinsame Zeit bewusst genommen',
    'Nicht nebenbei — wirklich zusammen.'
  ),
  wiedergutmachung('w-verb-2', 'Verbindung', 'Streit sauber geklärt', 'Nicht liegen gelassen.'),
  wiedergutmachung('w-verb-3', 'Verbindung', 'Bewusst Rücksicht genommen', 'Aufmerksam und achtsam.'),
  wiedergutmachung('w-verb-4', 'Verbindung', 'Liebevoll beruhigt', 'Sanft zurückgeholt.'),
]

export const STRAFEN_KATEGORIEN = [
  'Kommunikation',
  'Verhalten',
  'Kopf / Beziehung',
  'Alltag',
  'Spielerisch / Beziehung',
  'Charta',
] as const

export const WIEDERGUTMACHUNG_KATEGORIEN = [
  'Kommunikation',
  'Nähe',
  'Spielerisch / Süß',
  'Verbindung',
] as const

/** @deprecated Use STRAFEN / WIEDERGUTMACHUNGEN */
export const PENALTY_POINTS = POINT_DELTA
