# Wir Zwei

Eine private App für zwei Menschen — Erinnerungen, Gedanken und Moodboards.

## Lokal starten

Node.js muss installiert sein: https://nodejs.org

```bash
cd Desktop/wir-zwei
npm install
npm run dev
```

Die App läuft unter http://localhost:5173

## Login

Zwei feste Nutzer (Passwort für beide: `herz123`):

| Name  | Benutzername |
|-------|--------------|
| Marie | `marie`      |
| Nico  | `nico`       |

Passwörter können in `src/auth/AuthContext.tsx` geändert werden.

## Firebase Sync (gemeinsame Daten)

Damit Marie und Nico **dieselben Inhalte in Echtzeit** sehen:

### 1. Firebase-Projekt anlegen

1. https://console.firebase.google.com → Neues Projekt
2. **Firestore Database** aktivieren (Testmodus oder eigene Regeln)
3. Projekt-Einstellungen → Web-App hinzufügen → Config kopieren

### 2. `.env` anlegen

```bash
cp .env.example .env
```

Werte aus Firebase eintragen:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Firestore-Regeln

In Firebase Console → Firestore → Regeln → Inhalt aus `firestore.rules` einfügen.

*(Offen für Lese/Schreiben — ok für private App mit versteckter URL. Für mehr Sicherheit später Auth ergänzen.)*

### 4. Datenstruktur

Ein gemeinsames Dokument:

```
coupleApp / wir-zwei
  ├── memories[]
  ├── thoughts[]
  ├── moodboards[]
  └── events[]
```

**Verhalten:**
- Beim Laden: Cache sofort anzeigen → Firebase `onSnapshot` aktualisiert live
- Beim Speichern: Firebase + localStorage Cache
- Offline: lokale Version bleibt erhalten

## Auf dem Handy nutzen (empfohlen)

### Schritt 1 — Online stellen

**Option A: Vercel (einfach)**

1. Account auf https://vercel.com anlegen
2. Vercel CLI installieren: `npm i -g vercel`
3. Im Projektordner: `vercel`
4. Fragen mit Enter bestätigen — fertig
5. Link an Marie & Nico schicken

**Option B: Netlify**

1. Account auf https://netlify.com anlegen
2. Ordner `wir-zwei` per Drag & Drop auf https://app.netlify.com/drop ziehen  
   *(oder mit Netlify CLI: `npm run build` → `netlify deploy --prod --dir=dist`)*

**Option C: Eigener Server**

```bash
npm run build
```

Den Ordner `dist/` auf einen Webserver legen. Alle Routen müssen auf `index.html` zeigen (SPA).

### Schritt 2 — Auf dem Handy installieren

**iPhone:** Link in Safari öffnen → Teilen → **Zum Home-Bildschirm**

**Android (Chrome):** Link öffnen → Menü → **App installieren**  
*(oder den Install-Hinweis in der App nutzen)*

Danach erscheint „Wir Zwei“ wie eine App — Vollbild, eigenes Icon, offline nutzbar (einmal geladen).

## Android-App (Play Store / APK)

Voraussetzung: [Android Studio](https://developer.android.com/studio) installiert.

```bash
npm run cap:sync      # Build + Capacitor synchronisieren
npm run cap:android   # Android Studio öffnen
```

In Android Studio: **Build → Generate Signed Bundle / APK**  
→ APK direkt aufs Handy installieren oder in die Google Play Console hochladen.

## iOS-App (nur auf Mac)

```bash
npm install @capacitor/ios
npx cap add ios
npm run cap:ios
```

In Xcode: Archive → TestFlight oder App Store.

## Daten

**Cloud:** Firebase Firestore (`coupleApp/wir-zwei`) — gemeinsamer Speicher für beide.  
**Lokal:** `localStorage` als Cache — schneller Start, Offline-Fallback.

UI-Status (Neu-Badges, Aktivität) bleibt lokal pro Gerät.

## Build & Vorschau

```bash
npm run build
npm run preview
```

## Struktur

```
src/
├── auth/           Login & Authentifizierung
├── components/     Layout, Navigation, Install-Hinweis
├── pages/          Home, Erinnerungen, Gedanken, Moodboards, Planung
├── firebase/       Firebase-Konfiguration
├── storage/        Cache, Sync, Firestore
└── utils/          Hilfsfunktionen
```
