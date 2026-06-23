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
  strafe('s-kom-1', 'Kommunikation', 'Zu spät geantwortet', 'Einfach zu lange nicht geschrieben.'),
  strafe('s-kom-2', 'Kommunikation', 'Absichtlich ignoriert', 'Du weißt, dass du gelesen hast.'),
  strafe('s-kom-3', 'Kommunikation', 'Auf „seen" gelassen', 'Gelesen und dann … nichts.'),
  strafe('s-kom-4', 'Kommunikation', 'Kalte Kurzantwort', 'Nur „ok", „ja" oder „ka".'),
  strafe('s-kom-5', 'Kommunikation', 'Gespräch abgewürgt', 'Mitten drin einfach weg.'),

  strafe('s-ver-1', 'Verhalten', 'Frech gewesen', 'Du weißt genau, was du gesagt hast.'),
  strafe('s-ver-2', 'Verhalten', 'Unnötig provoziert', 'Eigentlich ohne echten Grund.'),
  strafe('s-ver-3', 'Verhalten', 'Falscher Ton', 'Schärfer oder kälter als nötig.'),
  strafe('s-ver-4', 'Verhalten', 'Übertrieben reagiert', 'Größer gemacht, als es war.'),
  strafe('s-ver-5', 'Verhalten', 'Drama gemacht ohne Grund', 'Mehr Lärm als Thema.'),

  strafe('s-kopf-1', 'Kopf / Beziehung', 'Nicht ehrlich kommuniziert', 'Wichtiges weggelassen oder schöngeredet.'),
  strafe('s-kopf-2', 'Kopf / Beziehung', 'Dinge reingefressen', 'Lieber geschluckt als gesagt.'),
  strafe('s-kopf-3', 'Kopf / Beziehung', 'Zu viel Kopfkino ohne zu reden', 'Im Kopf alles durch — laut nichts.'),
  strafe('s-kopf-4', 'Kopf / Beziehung', 'Unsicherheit nicht geteilt', 'Allein mit dem Gefühl geblieben.'),
  strafe('s-kopf-5', 'Kopf / Beziehung', 'Rückzug ohne Erklärung', 'Einfach weg — ohne ein Wort.'),

  strafe('s-all-1', 'Alltag', 'Zu spät gekommen', 'Die Zeit hat nicht gepasst.'),
  strafe('s-all-2', 'Alltag', 'Etwas vergessen', 'War wichtig — ist trotzdem passiert.'),
  strafe('s-all-3', 'Alltag', 'Plan nicht eingehalten', 'So war es nicht abgemacht.'),
  strafe('s-all-4', 'Alltag', 'Verabredung unnötig verschoben', 'Hätte auch klappen können.'),

  strafe('s-spiel-1', 'Spielerisch / Beziehung', 'Extra Eifersuchts-Trigger', 'Spielerisch — aber du weißt, was du tust.'),
  strafe('s-spiel-2', 'Spielerisch / Beziehung', 'Zu wenig Aufmerksamkeit gegeben', 'Physisch da, mental woanders.'),
  strafe('s-spiel-3', 'Spielerisch / Beziehung', 'Kein „Ich denk an dich"-Tag', 'Ein kleines Zeichen hätte gereicht.'),
  strafe('s-spiel-4', 'Spielerisch / Beziehung', 'Kuschelfaktor vernachlässigt', 'Nähe kam zu kurz.'),

  strafe('s-chart-1', 'Grundregeln', 'Widerspruch = verloren', 'Du hast verloren — Herz inklusive ❤️'),
  strafe('s-chart-2', 'Grundregeln', '3× Ich liebe dich pro Stunde', 'Dreimal pro Stunde. Ernst gemeint 🔐'),
  strafe('s-chart-3', 'Grundregeln', 'Kuschelpflicht ohne Limit', 'Bis es gut ist 💍'),
  strafe('s-chart-4', 'Grundregeln', 'Mindestens 10 Küsse', 'Zehn. Keine Abkürzung 💋'),
  strafe('s-chart-5', 'Grundregeln', 'Für immer exklusiv', 'Unser Versprechen ♾️'),
]

export const WIEDERGUTMACHUNGEN: CatalogEntry[] = [
  wiedergutmachung('w-kom-1', 'Kommunikation', 'Offenes Gespräch geführt', 'Ehrlich geredet — wirklich.'),
  wiedergutmachung('w-kom-2', 'Kommunikation', 'Aktiv zugehört', 'Nicht nur gehört — verstanden.'),
  wiedergutmachung('w-kom-3', 'Kommunikation', 'Ehrlich ausgesprochen, was los ist', 'Endlich Klartext.'),

  wiedergutmachung('w-naehe-1', 'Nähe', 'Ehrliche liebe Nachricht', 'Von dir — nicht aus Pflicht.'),
  wiedergutmachung('w-naehe-2', 'Nähe', 'Spontaner Anruf', 'Einfach weil du fehlst.'),
  wiedergutmachung('w-naehe-3', 'Nähe', 'Nähe bewusst gegeben', 'Da gewesen — wirklich.'),
  wiedergutmachung('w-naehe-4', 'Nähe', '„Ich brauch dich"-Moment gut aufgefangen', 'Gehalten, als es zählte.'),

  wiedergutmachung('w-suess-1', 'Spielerisch / Süß', 'Kleine Überraschung gemacht', 'Unerwartet — und schön.'),
  wiedergutmachung('w-suess-2', 'Spielerisch / Süß', 'Süßen Text geschickt', 'Hat mich warm gemacht.'),
  wiedergutmachung('w-suess-3', 'Spielerisch / Süß', 'Voice-Nachricht geschickt', 'Deine Stimme — persönlich.'),
  wiedergutmachung('w-suess-4', 'Spielerisch / Süß', 'Meme / Insider geschickt', 'Unser Ding.'),

  wiedergutmachung('w-verb-1', 'Verbindung', 'Gemeinsame Zeit bewusst genommen', 'Nicht nebenbei — zusammen.'),
  wiedergutmachung('w-verb-2', 'Verbindung', 'Streit sauber geklärt', 'Nicht hängen geblieben.'),
  wiedergutmachung('w-verb-3', 'Verbindung', 'Bewusst Rücksicht genommen', 'Aufmerksam gewesen.'),
  wiedergutmachung('w-verb-4', 'Verbindung', 'Liebevoll beruhigt', 'Zurückgeholt — sanft.'),
]

export const STRAFEN_KATEGORIEN = [
  'Kommunikation',
  'Verhalten',
  'Kopf / Beziehung',
  'Alltag',
  'Spielerisch / Beziehung',
  'Grundregeln',
] as const

export const WIEDERGUTMACHUNG_KATEGORIEN = [
  'Kommunikation',
  'Nähe',
  'Spielerisch / Süß',
  'Verbindung',
] as const

/** @deprecated Use STRAFEN / WIEDERGUTMACHUNGEN */
export const PENALTY_POINTS = POINT_DELTA
