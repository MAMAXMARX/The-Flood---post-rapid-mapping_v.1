# Backend Server Setup - Node.js + Express

## Installation

### 1. Node.js installieren (falls nicht vorhanden)
```bash
# macOS mit Homebrew
brew install node

# Oder von https://nodejs.org/ herunterladen
```

### 2. Dependencies installieren
```bash
cd /Users/maltekern/Desktop/The-Flood---post-rapid-mapping_v.1
npm install
```

Dies installiert folgende Packages:
- **express**: Web-Framework
- **cors**: CORS-Handling
- **node-fetch**: HTTP-Requests
- **nodemon** (dev): Auto-Reload bei Änderungen

## Server starten

### Development Mode (mit Auto-Reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Der Server läuft dann unter: **http://localhost:3000**

## Verwendung der API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### lvermgeo.rlp.de Proxy
```javascript
// Im Browser/JavaScript
fetch('/api/proxy/lvermgeo?url=https://lvermgeo.rlp.de/...')
  .then(res => res.json())
  .then(data => console.log(data));
```

### WMS Service Proxy
```javascript
fetch('/api/proxy/wms?service=WMS&version=1.3.0&request=GetCapabilities')
  .then(res => res.json())
  .then(data => console.log(data));
```

### General Proxy (beliebige URLs)
```javascript
fetch('/api/proxy?url=https://example.com/data.json')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Projektstruktur

```
The-Flood---post-rapid-mapping_v.1/
├── server.js                 # ← Backend Server
├── package.json             # ← Dependencies
├── .env.example             # ← Umgebungsvariablen (Vorlage)
├── .gitignore              # ← Git-Ignore
├── app.js                   # ← Frontend (Leaflet)
├── index.html              # ← HTML (wird von server.js serviert)
├── Layer.js                # ← Frontend Layer-Funktionen
├── RM11.08.21.js          # ← Frontend Daten 11.08.2021
├── RM19.07.21.js          # ← Frontend Daten 19.07.2021
└── 11.08.2021_EMSR517_json/  # ← Daten
```

## Wichtige Änderungen für die Leaflet-App

Passe deine `app.js` und andere Frontend-Dateien wie folgt an:

### Alte Methode (CORS-blockiert):
```javascript
fetch('https://lvermgeo.rlp.de/data.json')
  .then(res => res.json())
```

### Neue Methode (über Backend-Proxy):
```javascript
fetch('/api/proxy/lvermgeo?url=https://lvermgeo.rlp.de/data.json')
  .then(res => res.json())
```

## Troubleshooting

### Port 3000 bereits in Verwendung
```bash
# Finde den Prozess
lsof -i :3000

# Beende ihn
kill -9 <PID>

# Oder verwende einen anderen Port
PORT=8080 npm start
```

### CORS-Fehler im Browser
Stelle sicher, dass der Server läuft und die Requests auf `/api/...` gehen (nicht auf externe URLs).

### Module nicht gefunden
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
```

## Nächste Schritte

1. **Höhenlinien-Daten integrieren** - Nutze `/api/proxy/lvermgeo`
2. **Liegenschaftskarte laden** - Proxy-Endpoint verwenden
3. **Error Handling erweitern** - Pro Endpoint
4. **Authentication hinzufügen** - API-Keys (optional)
5. **Deployment** - Vercel, Railway, Heroku, etc.

## Deployment (später)

### Vercel (empfohlen für einfache Apps)
```bash
npm install -g vercel
vercel
```

### Railway.app
```bash
npm install -g railway
railway login
railway up
```

### Heroku
```bash
brew install heroku/brew/heroku
heroku create
git push heroku main
```
