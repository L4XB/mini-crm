package main

import (
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ModuleConfig enthält die Konfiguration für ein benutzerdefiniertes Modul
type ModuleConfig struct {
	Name           string
	Description    string
	Version        string
	Models         []interface{}
	CustomRoutes   func(*gin.Engine, *gorm.DB)
	RequiresAuth   bool
	RequiresAdmin  bool
	PreloadFields  []string
	AllowedFilters []string
}

// RegisterModule registriert ein benutzerdefiniertes Modul in der Mini-CRM-Anwendung
func RegisterModule(config ModuleConfig, db *gorm.DB) error {
	logger := utils.NewLogger("module_manager")
	logger.Info("Registriere Modul: " + config.Name)

	// Modelle in der Registry registrieren
	registry := models.GetRegistry()
	registry.SetDB(db)

	for _, model := range config.Models {
		if err := registry.RegisterModel(
			model,
			config.PreloadFields,
			config.AllowedFilters,
			config.RequiresAuth,
			config.RequiresAdmin,
		); err != nil {
			logger.Error("Fehler beim Registrieren des Modells: " + err.Error())
			return err
		}
	}

	// Modul-Metadaten registrieren (für spätere Verwendung)
	// Hier könnten weitere Informationen wie Abhängigkeiten,
	// Berechtigungen usw. gespeichert werden

	return nil
}
