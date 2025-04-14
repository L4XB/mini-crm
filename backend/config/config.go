package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// make DB global
var DB *gorm.DB

// load environment variables
func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

// connect to database
func ConnectDB() {
	// load environment variables
	LoadEnv()

	// connect to database
	var err error
	// Try a simplified connection string format
	databaseName := os.Getenv("DB_NAME")
	if databaseName == "" {
		databaseName = "mini_crm" // Fallback if environment variable is empty
	}

	// Construct a more explicit connection string
	directDsn := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		databaseName,
	)

	
	DB, err = gorm.Open(postgres.Open(directDsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	} else {
		fmt.Println("Database connection successfully established!")
	}
}
