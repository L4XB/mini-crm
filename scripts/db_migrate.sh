#!/bin/bash
# Datenbank-Migrations-Skript für Mini CRM

# Konfiguration
LOG_FILE="/opt/mini-crm/logs/migration_log.txt"

# Datenbankverbindungsinformationen aus Umgebungsvariablen oder default
DB_HOST=${DB_HOST:-"postgres"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"postgres"}
DB_NAME=${DB_NAME:-"mini_crm"}

# Funktion zur Protokollierung
log() {
    echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" | tee -a "$LOG_FILE"
}

# Stellt sicher, dass das Log-Verzeichnis existiert
mkdir -p $(dirname "$LOG_FILE")

# Start der Migration
log "Starte Datenbankmigration für $DB_NAME auf $DB_HOST..."

# Prüfe, ob die Datenbank existiert und erstelle sie, falls nicht
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1
if [ $? -ne 0 ]; then
    log "Datenbank $DB_NAME existiert nicht, wird erstellt..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"
    if [ $? -eq 0 ]; then
        log "Datenbank $DB_NAME erfolgreich erstellt."
    else
        log "FEHLER: Konnte Datenbank $DB_NAME nicht erstellen!"
        exit 1
    fi
fi

# Hier kannst du zusätzliche Migrationslogik implementieren
# Beispiel: Ausführen der Go-App mit einem speziellen Migrationsparameter
cd /opt/mini-crm/backend
./mini-crm-api --migrate-only

# Prüfe, ob Migration erfolgreich war
if [ $? -eq 0 ]; then
    log "Migration erfolgreich abgeschlossen."
else
    log "FEHLER: Migration fehlgeschlagen!"
    exit 1
fi

log "Migrationsprozess abgeschlossen"
exit 0
