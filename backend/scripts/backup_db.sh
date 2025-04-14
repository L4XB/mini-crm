#!/bin/bash
# Automatisches Backup-Skript für die Postgres-Datenbank

# Konfiguration
BACKUP_DIR="/opt/mini-crm/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/mini_crm_backup_$TIMESTAMP.sql"
LOG_FILE="$BACKUP_DIR/backup_log.txt"

# Datenbankverbindungsinformationen aus Umgebungsvariablen oder default
DB_HOST=${DB_HOST:-"postgres"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"postgres"}
DB_NAME=${DB_NAME:-"mini_crm"}

# Sicherstellen, dass Backup-Verzeichnis existiert
mkdir -p $BACKUP_DIR

# Funktion zur Protokollierung
log() {
    echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" | tee -a "$LOG_FILE"
}

# Start des Backups
log "Starte Backup der Datenbank $DB_NAME auf $DB_HOST..."

# Führe pg_dump aus
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -F p -b -v -f "$BACKUP_FILE" $DB_NAME

# Prüfe, ob Backup erfolgreich war
if [ $? -eq 0 ]; then
    log "Backup erfolgreich abgeschlossen: $BACKUP_FILE"
    
    # Komprimiere das Backup
    gzip "$BACKUP_FILE"
    log "Backup komprimiert: $BACKUP_FILE.gz"
    
    # Alte Backups löschen (behalte die letzten 7 Tage)
    find "$BACKUP_DIR" -name "mini_crm_backup_*.sql.gz" -type f -mtime +7 -delete
    log "Alte Backups wurden bereinigt"
else
    log "FEHLER: Backup fehlgeschlagen!"
    exit 1
fi

log "Backup-Prozess abgeschlossen"
exit 0
