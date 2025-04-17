
package utils

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"runtime"
	"sync"
	"time"

	"github.com/deinname/mini-crm-backend/config"
)

// ServiceStatus repräsentiert den Status eines Dienstes für Health Checks
type ServiceStatus struct {
	Status      string    `json:"status"`      // "ok", "warning", "error"
	Description string    `json:"description"` // Beschreibung des Status
	Timestamp   time.Time `json:"timestamp"`   // Zeitpunkt der letzten Überprüfung
}

// HealthStatus repräsentiert den Gesamtstatus des Systems
type HealthStatus struct {
	Status      string                   `json:"status"`      // "ok", "warning", "error"
	Version     string                   `json:"version"`     // Version der API
	Environment string                   `json:"environment"` // Umgebung (dev, test, prod)
	Uptime      string                   `json:"uptime"`      // Laufzeit des Servers
	StartTime   time.Time                `json:"start_time"`  // Startzeit des Servers
	Memory      *runtime.MemStats        `json:"memory"`      // Speichernutzung
	Services    map[string]ServiceStatus `json:"services"`    // Status verschiedener Dienste
}

var (
	// Startzeit des Servers
	startTime = time.Now()

	// Cache für Health-Status
	healthStatusCache     *HealthStatus
	healthStatusCacheMux  sync.RWMutex
	healthStatusCacheTime time.Time
	healthStatusCacheTTL  = 10 * time.Second
)

// CheckHealth führt einen umfassenden Health-Check durch
func CheckHealth(detailed bool) *HealthStatus {
	// Bei niedriger Detailstufe und gültigem Cache, verwende den Cache
	healthStatusCacheMux.RLock()
	cacheValid := time.Since(healthStatusCacheTime) < healthStatusCacheTTL
	cachedStatus := healthStatusCache
	healthStatusCacheMux.RUnlock()

	if !detailed && cacheValid && cachedStatus != nil {
		return cachedStatus
	}

	// Neuen Health-Status erstellen
	status := &HealthStatus{
		Status:      "ok",
		Version:     "1.0.0", // Sollte aus Konfiguration kommen
		Environment: os.Getenv("ENV"),
		Uptime:      time.Since(startTime).String(),
		StartTime:   startTime,
		Services:    make(map[string]ServiceStatus),
	}

	// Bei detaillierter Abfrage zusätzliche Infos hinzufügen
	if detailed {
		memStats := &runtime.MemStats{}
		runtime.ReadMemStats(memStats)
		status.Memory = memStats
	}

	// Datenbank-Check
	dbStatus := checkDatabaseStatus()
	status.Services["database"] = dbStatus
	if dbStatus.Status == "error" {
		status.Status = "error"
	} else if dbStatus.Status == "warning" && status.Status != "error" {
		status.Status = "warning"
	}

	// Weitere Service-Checks können hier hinzugefügt werden
	// z.B. Redis, externe APIs, etc.

	// Aktualisiere den Cache
	healthStatusCacheMux.Lock()
	healthStatusCache = status
	healthStatusCacheTime = time.Now()
	healthStatusCacheMux.Unlock()

	return status
}

// checkDatabaseStatus überprüft den Status der Datenbank
func checkDatabaseStatus() ServiceStatus {
	status := ServiceStatus{
		Status:    "ok",
		Timestamp: time.Now(),
	}

	// Stellen eines Contexts mit Timeout für die Datenbankverbindung
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Überprüfen der Datenbankverbindung
	db, err := config.DB.DB()
	if err != nil {
		status.Status = "error"
		status.Description = "Konnte keine Datenbankverbindung aufbauen: " + err.Error()
		return status
	}

	// Ping der Datenbank mit Timeout
	if err := db.PingContext(ctx); err != nil {
		status.Status = "error"
		status.Description = "Datenbank nicht erreichbar: " + err.Error()
		return status
	}

	// Zusätzliche Statistiken
	var result int
	row := db.QueryRowContext(ctx, "SELECT 1")
	if err := row.Scan(&result); err != nil {
		status.Status = "warning"
		status.Description = "Datenbankabfrage fehlgeschlagen: " + err.Error()
		return status
	}

	status.Description = "Datenbankverbindung erfolgreich hergestellt"
	return status
}

// ServeHealthCheck ist ein HTTP-Handler für den Health-Check-Endpunkt
func ServeHealthCheck(w http.ResponseWriter, r *http.Request) {
	// Bestimmen der Detailebene basierend auf Query-Parameter
	detailed := r.URL.Query().Get("detailed") == "true"

	// Health-Status abrufen
	status := CheckHealth(detailed)

	// HTTP-Status basierend auf Gesundheitszustand
	httpStatus := http.StatusOK
	if status.Status == "error" {
		httpStatus = http.StatusServiceUnavailable
	} else if status.Status == "warning" {
		httpStatus = http.StatusOK // Warnungen werden immer noch als 200 OK zurückgegeben
	}

	// Antwort senden
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatus)
	json.NewEncoder(w).Encode(status)

	// Bei Fehlern auch ins Log schreiben
	if status.Status != "ok" {
		Logger.WithField("health_status", status.Status).Warn("Health check issues detected")
	}
}
