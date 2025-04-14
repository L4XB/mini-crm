# Mini CRM Frontend - Setup-Anleitung

Diese Anleitung führt Sie durch die Einrichtung und das Starten des Mini CRM Frontends.

## Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Installation](#installation)
3. [Entwicklungsmodus starten](#entwicklungsmodus-starten)
4. [Produktions-Build erstellen](#produktions-build-erstellen)
5. [Docker-Deployment](#docker-deployment)
6. [Fehlerbehandlung](#fehlerbehandlung)

## Voraussetzungen

- Node.js (v16 oder höher)
- npm (v7 oder höher)
- Das Mini CRM Backend sollte laufen und erreichbar sein

## Installation

Führen Sie im Frontend-Verzeichnis folgende Befehle aus:

```bash
# Ins Frontend-Verzeichnis wechseln
cd /Users/lukasbuck/Code/projects/mini_crm/frontend

# Abhängigkeiten installieren
npm install
```

## Entwicklungsmodus starten

Um das Frontend im Entwicklungsmodus zu starten:

```bash
# Entwicklungsserver starten
npm run dev
```

Dies startet einen lokalen Entwicklungsserver auf [http://localhost:3000](http://localhost:3000).

### Konfiguration der Backend-URL

Die API-URL kann in der `.env.local` Datei konfiguriert werden:

```
NEXT_PUBLIC_API_URL=http://localhost:8081
```

## Produktions-Build erstellen

Um einen optimierten Produktions-Build zu erstellen:

```bash
# Produktions-Build erstellen
npm run build

# Build starten
npm start
```

## Docker-Deployment

Das Frontend kann zusammen mit dem Backend über Docker Compose bereitgestellt werden:

```bash
# Im Hauptverzeichnis des Projekts
cd /Users/lukasbuck/Code/projects/mini_crm

# Frontend und Backend mit Docker Compose starten
docker-compose up -d
```

Danach ist das Frontend unter [http://localhost:3000](http://localhost:3000) und das Backend unter [http://localhost:8081](http://localhost:8081) erreichbar.

## Fehlerbehandlung

### Bekannte Probleme und Lösungen

#### CORS-Fehler

Wenn CORS-Fehler auftreten, stellen Sie sicher, dass im Backend die richtige ALLOWED_ORIGINS Umgebungsvariable gesetzt ist:

```
ALLOWED_ORIGINS=http://localhost:3000
```

#### Authentifizierungsprobleme

Bei Problemen mit der Authentifizierung, testen Sie folgende Schritte:

1. Prüfen Sie, ob das Backend läuft und unter der konfigurierten URL erreichbar ist
2. Testen Sie die Anmeldung mit den Testdaten: admin@example.com / test1234
3. Überprüfen Sie die Browser-Konsole auf Fehlermeldungen

#### TypeScript-Fehler beheben

Sollten TypeScript-Fehler auftreten, führen Sie folgende Befehle aus:

```bash
# TypeScript-Definitionen aktualisieren
npm i --save-dev @types/react @types/react-dom

# Node-Module löschen und neu installieren (bei hartnäckigen Problemen)
rm -rf node_modules
npm install
```

### Hilfreiche Entwicklungs-Werkzeuge

- **Browser DevTools**: Öffnen Sie die Entwickler-Tools im Browser (F12), um API-Anfragen und Fehler zu überprüfen
- **React Developer Tools**: Browser-Erweiterung für das Debugging von React-Komponenten
- **Redux DevTools**: Falls später Redux implementiert wird
