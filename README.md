# Mini CRM Backend API

Ein umfassendes Backend-System für eine Customer Relationship Management (CRM) Anwendung, entwickelt mit Go, dem Gin Framework und GORM für Datenbankinteraktionen.

## Technologien

- **Sprache**: Go
- **Web-Framework**: Gin
- **ORM**: GORM
- **Datenbank**: PostgreSQL
- **Authentifizierung**: JWT
- **Validierung**: go-playground/validator
- **Logging**: logrus
- **Sicherheit**: Rate Limiting, Request-Size-Limiting, CORS

## Funktionen

- Benutzerauthentifizierung und -autorisierung mit JWT
- Rollenbasierte Zugriffskontrolle (admin/user)
- CRUD-Operationen für alle Modelle
- Umfassende Fehlerbehandlung
- Standardisierte API-Antworten
- Logging für alle Anfragen und Anwendungsaktivitäten
- Schutz vor Brute-Force und DoS-Angriffen 
- Richtlinien zur Datenintegrität

## Modelle

1. **User** - Benutzer
   - Attribute: Username, Email, Password, Role
   - Beziehungen: Settings, Contacts, Deals, Notes, Tasks

2. **Contact** - Kontakte
   - Attribute: First Name, Last Name, Email, Phone
   - Beziehungen: User, Notes, Deals

3. **Deal** - Geschäftsdeals
   - Attribute: Title, Description, Value, Status
   - Beziehungen: Contact, User, Tasks

4. **Note** - Notizen
   - Attribute: Content
   - Beziehungen: Contact, Deal, User

5. **Task** - Aufgaben
   - Attribute: Title, Details, Due Date, Completed Status
   - Beziehungen: Deal, User

6. **Settings** - Benutzereinstellungen
   - Attribute: Theme, Language
   - Beziehung: User

## Installation und Einrichtung

### Voraussetzungen

- Go 1.17 oder höher
- PostgreSQL 12 oder höher
- .env-Datei für Umgebungsvariablen

### Umgebungsvariablen

Erstellen Sie eine `.env`-Datei im Hauptverzeichnis mit folgenden Variablen:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=mini_crm
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24
PORT=8081
ENV=development
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=info
```

### Installation

1. Repository klonen:
```
git clone https://github.com/yourusername/mini-crm.git
cd mini-crm/backend
```

2. Abhängigkeiten installieren:
```
go mod download
```

3. Anwendung starten:
```
go run cmd/main.go
```

## API-Dokumentation

Die vollständige API-Dokumentation ist als Postman-Sammlung verfügbar. Importieren Sie die Datei `docs/mini_crm_api_postman.json` in Postman, um alle Endpunkte mit Beispielen zu sehen.

### Authentifizierung

Alle geschützten Endpunkte erfordern einen gültigen JWT-Token im Authorization-Header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Um einen Token zu erhalten, senden Sie eine POST-Anfrage an `/api/v1/auth/login` mit gültigen Anmeldeinformationen.

### Basis-URL

Standardmäßig läuft der Server auf:

```
http://localhost:8081/api/v1
```

### Wichtige Endpunkte

- **Authentifizierung**:
  - POST `/api/v1/auth/register` - Registrierung
  - POST `/api/v1/auth/login` - Anmeldung
  - GET `/api/v1/auth/me` - Aktueller Benutzer
  - POST `/api/v1/auth/refresh` - Token aktualisieren

- **Benutzer** (einige Endpunkte nur für Admins):
  - GET `/api/v1/users` - Alle Benutzer abrufen
  - GET `/api/v1/users/:id` - Benutzer nach ID abrufen
  - POST `/api/v1/users` - Benutzer erstellen (Admin)
  - PUT `/api/v1/users/:id` - Benutzer aktualisieren
  - DELETE `/api/v1/users/:id` - Benutzer löschen (Admin)

- **Kontakte**:
  - GET `/api/v1/contacts` - Kontakte abrufen
  - GET `/api/v1/contacts/:id` - Kontakt nach ID abrufen
  - POST `/api/v1/contacts` - Kontakt erstellen
  - PUT `/api/v1/contacts/:id` - Kontakt aktualisieren
  - DELETE `/api/v1/contacts/:id` - Kontakt löschen

- Ähnliche Endpunkte existieren auch für **Deals**, **Notes**, **Tasks** und **Settings**.

## Sicherheitsfeatures

Das Mini CRM Backend implementiert mehrere Sicherheitsmaßnahmen:

### 1. JWT-Authentifizierung
- Sichere Token-basierte Authentifizierung
- Konfigurierbare Token-Lebensdauer
- Verschlüsselte Benutzerpasswörter mit bcrypt

### 2. Rollenbasierte Autorisierung 
- Unterschiedliche Berechtigungen für Admin- und reguläre Benutzer
- Überprüfung des Ressourcenbesitzes für alle Operationen

### 3. Rate Limiting
- Schutz vor Brute-Force-Angriffen
- Strengere Limits für Authentifizierungsendpunkte
- IP-basierte Limitierung

### 4. Request-Size-Limiting
- Schutz vor Denial-of-Service durch große Payloads
- Konfigurierbare Größenbeschränkung (Standard: 10MB)

### 5. CORS-Konfiguration
- Einschränkung auf zugelassene Ursprünge
- Schutz vor Cross-Site-Anfragen

### 6. Ausführliches Logging
- Strukturierte Logs für alle Anfragen und Systemereignisse
- Nachverfolgung von Anfragen mit eindeutigen Request-IDs
- Verschiedene Log-Level für unterschiedliche Umgebungen

### 7. Datensicherheit
- Validierung aller Eingaben
- Verhinderung von Änderungen an Ressourcenbesitz
- Schutz vor unbefugtem Datenzugriff

## Logging

Das System verwendet strukturiertes Logging mit verschiedenen Log-Ebenen:

- **debug**: Detaillierte Entwicklungsinformationen
- **info**: Allgemeine Informationen zur Anwendung
- **warn**: Warnungen und potenziell problematische Situationen
- **error**: Fehler, die die Anwendungsfunktionalität beeinträchtigen

Die Log-Ebene kann über die Umgebungsvariable `LOG_LEVEL` konfiguriert werden.

## Entwicklung und Beitrag

### Codestruktur

- `/cmd`: Einstiegspunkt der Anwendung
- `/config`: Datenbank- und Anwendungskonfiguration
- `/controllers`: API-Controller für alle Modelle
- `/middleware`: Middleware-Komponenten
- `/models`: Datenmodelle und DB-Schema
- `/routes`: API-Routen und -Endpunkte
- `/utils`: Hilfsfunktionen und gemeinsam genutzte Utilities

### Erweiterung

1. Fügen Sie neue Modelle in `/models` hinzu
2. Erstellen Sie entsprechende Controller in `/controllers`
3. Registrieren Sie neue Routen in `/routes/router.go`
4. Führen Sie neue Migrations in der `migrate()`-Funktion hinzu

## Lizenz

[MIT License](LICENSE)
