# Vercel Deployment Guide

## Schritt 1: Git Repository vorbereiten

```bash
cd /Users/maltekern/Desktop/The-Flood---post-rapid-mapping_v.1

# Falls noch nicht initialisiert
git init
git add .
git commit -m "Add Vercel serverless functions"
git branch -M main

# Zu GitHub pushen
git remote add origin https://github.com/MAMAXMARX/The-Flood---post-rapid-mapping_v.1
git push -u origin main
```

## Schritt 2: Vercel CLI installieren und deployen

```bash
# Vercel CLI global installieren
npm install -g vercel

# Mit Vercel anmelden (öffnet Browser)
vercel login

# Im Projektverzeichnis deployen
cd /Users/maltekern/Desktop/The-Flood---post-rapid-mapping_v.1
vercel
```

Vercel wird dich nach folgendem fragen:
- **Project name:** z.B. `rapid-mapping-ahrtal`
- **Project directory:** `.` (aktuelles Verzeichnis)
- **Build command:** `npm run build` (bei uns nicht nötig, einfach Skip/Enter)
- **Output directory:** (leer lassen)

## Schritt 3: Frontend URL aktualisieren

Nach dem Deployment erhältst du eine URL wie:
```
https://rapid-mapping-ahrtal.vercel.app
```

Aktualisiere deine `app.js` und andere Frontend-Dateien:

### ALT (localhost):
```javascript
fetch('/api/proxy/lvermgeo?url=...')
```

### NEU (Vercel):
```javascript
fetch('https://rapid-mapping-ahrtal.vercel.app/api/proxy/lvermgeo?url=...')
// ODER kürzer (wenn auf gleicher Domain):
fetch('/api/proxy/lvermgeo?url=...')
```

## Projektstruktur für Vercel

```
The-Flood---post-rapid-mapping_v.1/
├── vercel.json                    ← Vercel Konfiguration
├── server.js                      ← (Optional, lokal nur)
├── package.json
├── api/
│   ├── proxy.js                   ← /api/proxy
│   ├── lvermgeo.js               ← /api/lvermgeo
│   ├── wms.js                     ← /api/wms
│   └── health.js                  ← /api/health
├── app.js                         ← Frontend
├── index.html                     ← Einstiegspunkt
├── Layer.js
├── RM11.08.21.js
├── RM19.07.21.js
├── 11.08.2021_EMSR517_json/
└── 19.07.2021_EMSR517_json/
```

## API Endpoints auf Vercel

Nach dem Deployment:

- **Health Check:** `https://deine-domain.vercel.app/api/health`
- **lvermgeo Proxy:** `https://deine-domain.vercel.app/api/lvermgeo?url=...`
- **WMS Proxy:** `https://deine-domain.vercel.app/api/wms?service=...&request=...`
- **General Proxy:** `https://deine-domain.vercel.app/api/proxy?url=...`

## Lokal testen

Um lokal zu testen, vor dem Deployment:

```bash
# Terminal 1: Vercel Functions lokal testen
vercel dev

# Server läuft unter http://localhost:3000
```

## Updates deployen

Nach Änderungen:

```bash
git add .
git commit -m "Update message"
git push origin main

# Vercel deployed automatisch!
# Oder manuell:
vercel --prod
```

## Troubleshooting

### Deployment schlägt fehl
```bash
# Logs anschauen
vercel logs
```

### Umgebungsvariablen setzen
```bash
# Vercel Dashboard oder CLI
vercel env add SECRET_KEY
vercel env add API_KEY
```

### Build Cache löschen
```bash
vercel --cwd . --no-cache
```

## Domain konfigurieren

Wenn du eine eigene Domain hast (z.B. `meine-domain.de`):

1. Vercel Dashboard öffnen
2. Projekt auswählen → Settings → Domains
3. Domain hinzufügen
4. DNS-Einträge bei deinem Provider aktualisieren

## Wichtig für CORS

Die Serverless Functions haben CORS automatisch aktiviert:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

Damit funktioniert es auch von anderen Domains!

---

**Bereit zum Deployen?** 🚀
