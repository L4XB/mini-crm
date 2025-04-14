# Mini CRM - Bereitstellungsanleitung

Diese Anleitung führt Sie durch alle Schritte zur Bereitstellung des Mini-CRM-Backend auf verschiedenen Umgebungen.

## Inhaltsverzeichnis

1. [Lokale Entwicklung](#lokale-entwicklung)
2. [Produktions-Deployment](#produktions-deployment)
   - [Voraussetzungen](#voraussetzungen)
   - [Datenbank einrichten](#datenbank-einrichten)
   - [Anwendung bereitstellen](#anwendung-bereitstellen)
   - [Als Systemdienst einrichten](#als-systemdienst-einrichten)
   - [Mit Nginx als Reverse-Proxy](#mit-nginx-als-reverse-proxy)
   - [Automatisierte Backups](#automatisierte-backups)
   - [Monitoring-Setup](#monitoring-setup)
3. [Docker-Deployment](#docker-deployment)
4. [Sicherheitshinweise](#sicherheitshinweise)

## Lokale Entwicklung

### Möglichkeiten, den Server zu starten

```bash
# Standardstart
make run

# Mit Hot-Reload (automatisches Neuladen bei Codeänderungen)
make run-dev

# Im UI-Testmodus (mit automatischen Testdaten)
ENV=development SEED_TEST_DATA=true make run-dev

# Im Test-Modus ohne Authentifizierung (für einfache Frontend-Entwicklung)
ENV=development SEED_TEST_DATA=true DISABLE_AUTH_FOR_TESTS=true make run-dev

# Nur mit Swagger ohne Metriken-Authentifizierung
ENV=development ENABLE_SWAGGER=true OPEN_METRICS=true make run
```

## Produktions-Deployment

### Voraussetzungen

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Erforderliche Pakete installieren
sudo apt install -y git make curl postgresql postgresql-contrib

# Go installieren
wget https://go.dev/dl/go1.20.2.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.20.2.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin:~/go/bin' >> ~/.bashrc
source ~/.bashrc

# Docker installieren (optional, für Container-Deployment)
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### Datenbank einrichten

```bash
# PostgreSQL-Dienst starten
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Datenbank und Benutzer erstellen
sudo -u postgres psql -c "CREATE DATABASE mini_crm;"
sudo -u postgres psql -c "CREATE USER mini_crm_user WITH ENCRYPTED PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mini_crm TO mini_crm_user;"
```

### Anwendung bereitstellen

```bash
# Repository klonen
git clone https://github.com/yourusername/mini-crm.git
cd mini-crm

# Umgebungsvariablen konfigurieren
cp backend/.env.production backend/.env
nano backend/.env  # Editieren Sie die Datenbankverbindung und andere Einstellungen

# Anwendung bauen
make build

# Testdaten hinzufügen (optional)
ENV=production SEED_TEST_DATA=true ./backend/mini-crm-api --migrate-only
```

### Als Systemdienst einrichten

```bash
# Systemd-Service-Datei erstellen
sudo nano /etc/systemd/system/mini-crm.service
```

Fügen Sie folgende Inhalte in die Service-Datei ein:

```ini
[Unit]
Description=Mini CRM API Backend
After=network.target postgresql.service

[Service]
User=youruser
WorkingDirectory=/path/to/mini-crm/backend
ExecStart=/path/to/mini-crm/backend/mini-crm-api
Restart=on-failure
Environment=ENV=production
Environment=PORT=8081
Environment=DB_HOST=localhost
Environment=DB_PORT=5432
Environment=DB_USER=mini_crm_user
Environment=DB_PASSWORD=secure_password
Environment=DB_NAME=mini_crm
Environment=JWT_SECRET_KEY=your_secure_jwt_key
Environment=JWT_REFRESH_SECRET_KEY=your_secure_refresh_key

[Install]
WantedBy=multi-user.target
```

Dienst aktivieren und starten:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mini-crm
sudo systemctl start mini-crm
```

### Mit Nginx als Reverse-Proxy

```bash
# Nginx installieren
sudo apt install -y nginx

# SSL-Zertifikat mit Let's Encrypt (optional, aber empfohlen)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d crm.yourdomain.com

# Nginx-Konfiguration
sudo nano /etc/nginx/sites-available/mini-crm
```

Nginx-Konfiguration:

```nginx
server {
    listen 80;
    server_name crm.yourdomain.com;
    
    # SSL-Umleitung (falls konfiguiert)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name crm.yourdomain.com;
    
    # SSL-Zertifikate
    ssl_certificate /etc/letsencrypt/live/crm.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.yourdomain.com/privkey.pem;
    
    # Sicherheitseinstellungen
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    
    # Api-Endpunkte an Backend weiterleiten
    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Logs
    access_log /var/log/nginx/mini-crm.access.log;
    error_log /var/log/nginx/mini-crm.error.log;
}
```

Nginx aktivieren und starten:

```bash
sudo ln -s /etc/nginx/sites-available/mini-crm /etc/nginx/sites-enabled/
sudo nginx -t  # Konfiguration testen
sudo systemctl reload nginx
```

### Automatisierte Backups

```bash
# Backup-Skript installieren
sudo mkdir -p /opt/mini-crm/backups
sudo cp scripts/backup_db.sh /opt/mini-crm/
sudo chmod +x /opt/mini-crm/backup_db.sh

# Cronjob für tägliche Backups einrichten
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/mini-crm/backup_db.sh") | crontab -
```

### Monitoring-Setup

```bash
# Docker-Compose für Monitoring erstellen
mkdir -p monitoring
nano monitoring/docker-compose.yml
```

```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    restart: always

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    restart: always
    depends_on:
      - prometheus

volumes:
  grafana-data:
```

Prometheus-Konfiguration:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mini-crm'
    metrics_path: '/metrics'
    scheme: http
    basic_auth:
      username: 'prometheus'
      password: 'secure_metrics_password'
    static_configs:
      - targets: ['host.docker.internal:8081']
```

Starten des Monitoring-Stacks:

```bash
cd monitoring
docker-compose up -d
```

## Docker-Deployment

Für ein schnelles Deployment mit Docker:

```bash
# Im Projektverzeichnis
make docker
make docker-compose
```

Alternativ, für eine vollständig angepasste Deployment:

```bash
# Docker Compose File anpassen
nano docker-compose.yml

# Starten mit benutzerdefinierten Umgebungsvariablen
POSTGRES_PASSWORD=sicheres_passwort JWT_SECRET_KEY=mein_jwt_key docker-compose up -d
```

## Sicherheitshinweise

1. Ändern Sie in Produktionsumgebungen immer alle Standard-Passwörter und Schlüssel.
2. Verwenden Sie lange, komplexe Schlüssel für JWT_SECRET_KEY und JWT_REFRESH_SECRET_KEY.
3. Schützen Sie die Datenbank mit einer Firewall und erlauben Sie nur Verbindungen vom Backend-Server.
4. Aktivieren Sie immer die SSL/TLS-Verschlüsselung für Produktionsumgebungen.
5. Führen Sie regelmäßige Backups durch und testen Sie die Wiederherstellung.
6. Halten Sie alle Systeme mit Sicherheitsupdates aktuell.
7. Überwachen Sie die API mit Prometheus und setzen Sie Alarme für ungewöhnliche Aktivitäten.
