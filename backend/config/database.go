package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/deinname/mini-crm-backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB ist die globale Datenbankverbindung
// Diese Variable wird beim Anwendungsstart in der main.go initialisiert
var DB *gorm.DB

// SetupDB initialisiert die Datenbankverbindung und gibt sie zurück
// Diese Funktion sollte in der main.go aufgerufen werden
func SetupDB() (*gorm.DB, error) {
	// Datenbankverbindungsparameter
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "mini_crm"
	}

	dbSSLMode := os.Getenv("DB_SSL_MODE")
	if dbSSLMode == "" {
		dbSSLMode = "disable"
	}

	// Verbindungs-String erstellen
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPassword, dbName, dbSSLMode)

	// Logger-Konfiguration
	logLevel := logger.Info
	if os.Getenv("LOG_LEVEL") == "debug" {
		logLevel = logger.Info
	} else {
		logLevel = logger.Error
	}

	// Datenbankverbindung herstellen
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("fehler beim Verbinden zur Datenbank: %w", err)
	}

	// Verbindungspool-Konfiguration
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("fehler beim Abrufen der SQL-DB-Instanz: %w", err)
	}

	// Maximale Anzahl offener Verbindungen
	maxConnections := 50
	sqlDB.SetMaxOpenConns(maxConnections)

	// Maximale Anzahl an Verbindungen im Idle-Pool
	maxIdleConnections := 10
	sqlDB.SetMaxIdleConns(maxIdleConnections)

	// Zeitlimit für Verbindungen im Pool
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto-Migration der Modelle
	err = db.AutoMigrate(
		&models.User{},
		&models.Settings{},
		&models.Contact{},
		&models.Deal{},
		&models.Note{},
		&models.Task{},
	)
	if err != nil {
		return nil, fmt.Errorf("fehler bei der Auto-Migration: %w", err)
	}

	log.Println("Datenbankverbindung erfolgreich hergestellt")
	return db, nil
}
