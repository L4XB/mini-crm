// @title Mini CRM API
// @version 1.0
// @description API Dokumentation für dein Mini CRM
// @host localhost:8080
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/controllers"
	"github.com/deinname/mini-crm-backend/middleware"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/routes"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

// setupEnvironment loads environment variables and sets defaults
func setupEnvironment() {
	// Load .env file if exists
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// Set default JWT secret if not provided
	if os.Getenv("JWT_SECRET_KEY") == "" {
		log.Println("Warning: JWT_SECRET_KEY not set, using a default value (not secure for production)")
		os.Setenv("JWT_SECRET_KEY", "mini-crm-default-secret-key-change-in-production"+time.Now().String())
	}

	// Set default port if not provided
	if os.Getenv("PORT") == "" {
		os.Setenv("PORT", "8081")
	}
}

// Registriere Modelle in der Registry und führe Migrationen aus
func setupModels() {
	// ModelRegistry initialisieren
	registry := models.GetRegistry()
	registry.SetDB(config.DB)

	// Standard-Modelle registrieren
	modelsToRegister := []struct {
		model          interface{}
		preloadFields  []string
		allowedFilters []string
		requiresAuth   bool
		requiresAdmin  bool
	}{
		{
			model:          &models.User{},
			preloadFields:  []string{"Settings"},
			allowedFilters: []string{"email", "role"},
			requiresAuth:   true,
			requiresAdmin:  true,
		},
		{
			model:          &models.Settings{},
			preloadFields:  []string{},
			allowedFilters: []string{"user_id"},
			requiresAuth:   true,
			requiresAdmin:  false,
		},
		{
			model:          &models.Contact{},
			preloadFields:  []string{"User"},
			allowedFilters: []string{"status", "user_id"},
			requiresAuth:   true,
			requiresAdmin:  false,
		},
		{
			model:          &models.Deal{},
			preloadFields:  []string{"Contact", "User"},
			allowedFilters: []string{"status", "user_id", "contact_id"},
			requiresAuth:   true,
			requiresAdmin:  false,
		},
		{
			model:          &models.Task{},
			preloadFields:  []string{"User"},
			allowedFilters: []string{"priority", "status", "user_id"},
			requiresAuth:   true,
			requiresAdmin:  false,
		},
		{
			model:          &models.Note{},
			preloadFields:  []string{"User"},
			allowedFilters: []string{"user_id", "contact_id", "deal_id"},
			requiresAuth:   true,
			requiresAdmin:  false,
		},
	}

	for _, m := range modelsToRegister {
		err := registry.RegisterModel(
			m.model,
			m.preloadFields,
			m.allowedFilters,
			m.requiresAuth,
			m.requiresAdmin,
		)
		if err != nil {
			log.Fatalf("Fehler beim Registrieren des Modells %T: %v", m.model, err)
		}
	}

	// Benutzerdefinierte Endpunkte registrieren
	// Zum Beispiel: Aufgaben-Abschluss Toggle
	err := registry.RegisterCustomEndpoint(
		"Task",
		"/:id/toggle",
		"PATCH",
		"Toggle completion status of a task",
		controllers.ToggleTaskCompletion,
	)
	if err != nil {
		log.Printf("Warnung: Konnte benutzerdefinierten Endpunkt nicht registrieren: %v", err)
	}

	// Tabellen in der Datenbank erstellen/migrieren
	err = registry.InitializeTables()
	if err != nil {
		log.Fatalf("Fehler bei der Tabellenmigration: %v", err)
	}

	// Create default admin if no users exist
	var count int64
	config.DB.Table("users").Count(&count)

	if count == 0 {
		createDefaultAdmin()
	}

	fmt.Println("Model-Registry und Datenbankmigration abgeschlossen!")
}

// createDefaultAdmin creates a default admin user
func createDefaultAdmin() {
	log.Println("Creating default admin user...")

	// Hash password using bcrypt directly
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Create admin user
	admin := models.User{
		Username: "admin",
		Email:    "admin@example.com",
		Password: string(hashedPassword),
		Role:     "admin",
	}

	result := config.DB.Create(&admin)
	if result.Error != nil {
		log.Fatalf("Failed to create admin user: %v", result.Error)
	}

	// Create default settings for admin
	settings := models.Settings{
		UserID:   admin.ID,
		Theme:    "light",
		Language: "en",
	}

	result = config.DB.Create(&settings)
	if result.Error != nil {
		log.Printf("Warning: Failed to create settings for admin user: %v", result.Error)
	}

	log.Printf("Default admin user created with username: %s and password: admin123", admin.Username)
}

func main() {
	// Setup environment
	setupEnvironment()

	// Initialize logger
	utils.InitLogger()
	utils.Logger.Info("Logger initialized successfully")

	// Start cleanup task for rate limiter
	middleware.StartCleanupTask()
	utils.Logger.Info("Rate limiter cleanup task started")

	// Connect to database
	config.LoadConfig()
	db, err := config.SetupDB()
	if err != nil {
		utils.Logger.Fatalf("Failed to connect to database: %v", err)
	}

	// Set global DB variable
	config.DB = db
	utils.Logger.Info("Database connection established")

	// Testdaten für UI-Entwicklung initialisieren, wenn aktiviert
	if os.Getenv("ENV") == "development" && os.Getenv("SEED_TEST_DATA") == "true" {
		seedFunc := utils.InitTestData()
		err = seedFunc(db)
		if err != nil {
			utils.Logger.Warnf("Error initializing test data: %v", err)
		} else {
			utils.Logger.Info("Test data initialized successfully")
		}
	}

	// Modelle registrieren und Migrationen ausführen
	setupModels()
	utils.Logger.Info("Model-Registry und Datenbankmigrationen abgeschlossen")

	// Initialize controllers with DB connection
	controllers.InitDB()
	utils.Logger.Info("Controllers initialized")

	// Initialize validator
	validate := validator.New()
	controllers.SetValidator(validate)
	utils.Logger.Info("Validator initialized")

	// Log application start info
	utils.Logger.WithFields(logrus.Fields{
		"port":        os.Getenv("PORT"),
		"environment": os.Getenv("ENV"),
		"version":     "1.0.0",
	}).Info("Mini CRM API starting...")

	// Router einrichten
	r := routes.SetupRouter()
	
	// Dynamische Routen für registrierte Modelle einrichten
	routes.RegisterDynamicRoutes(r, config.DB)
	utils.Logger.Info("Dynamische API-Routen registriert")
	
	// Server starten
	port := os.Getenv("PORT")
	r.Run(fmt.Sprintf(":%s", port))
}
