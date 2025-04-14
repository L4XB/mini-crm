package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// LoadEnv lädt die Umgebungsvariablen aus der .env Datei
func LoadEnv() {
	// Zuerst prüfen, ob eine umgebungsspezifische .env-Datei existiert
	env := os.Getenv("ENV")
	if env == "" {
		env = "development" // Standardmäßig Entwicklungsumgebung
	}

	// Versuche spezifische .env-Datei zu laden
	envFile := ".env." + env
	err := godotenv.Load(envFile)
	
	// Wenn die spezifische .env-Datei nicht existiert, lade die standard .env
	if err != nil {
		err = godotenv.Load()
		if err != nil {
			// Keine Fehlermeldung in Produktion, da Umgebungsvariablen oft direkt gesetzt werden
			if env != "production" {
				log.Printf("Warnung: Keine .env Datei gefunden. Verwende Systemumgebungsvariablen.")
			}
		}
	} else {
		log.Printf("Konfiguration aus %s geladen", envFile)
	}
}

// LoadConfig initialisiert alle Konfigurationen
func LoadConfig() bool {
	// Lade Umgebungsvariablen
	LoadEnv()
	
	// Hier könnten weitere Konfigurationsschritte erfolgen
	
	return true
}
