package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/controllers"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/routes"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
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

// migrate handles database migrations
func migrate() {
	// Run migrations
	models := []interface{}{
		&models.User{},
		&models.Settings{},
		&models.Contact{},
		&models.Deal{},
		&models.Task{},
		&models.Note{},
	}

	for _, model := range models {
		err := config.DB.AutoMigrate(model)
		if err != nil {
			log.Fatalf("Error migrating %T: %v", model, err)
		}
	}

	// Create default admin if no users exist
	var count int64
	config.DB.Table("users").Count(&count)

	if count == 0 {
		createDefaultAdmin()
	}

	fmt.Println("Database migration complete!")
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

	// Connect to database
	config.ConnectDB()

	// Run migrations
	migrate()

	// Initialize controllers with DB connection
	controllers.InitDB()

	// Initialize validator
	validate := validator.New()
	controllers.SetValidator(validate)

	// Log application start
	fmt.Println("Mini CRM API started...")

	// Setup and run router
	r := routes.SetupRouter()
	port := os.Getenv("PORT")
	r.Run(fmt.Sprintf(":%s", port))
}
