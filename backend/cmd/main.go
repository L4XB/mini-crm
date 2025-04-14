package main

import (
	"fmt"
	"log"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/controllers"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/routes"
)

func main() {
	// db connection
	config.ConnectDB()

	// automatic migration
	err := config.DB.AutoMigrate(&models.User{}, &models.Contact{}, &models.Deal{}, &models.Settings{}, &models.Task{}, &models.Note{})
	if err != nil {
		log.Fatalf("Error migrating DB: %v", err)
	} else {
		fmt.Println("Database migration complete!")
	}

	// simple test to see if it works
	fmt.Println("App started...")

	// Initialize controllers with DB connection
	controllers.InitDB()

	// routes (we will handle this later)
	r := routes.SetupRouter()
	r.Run(":8080")
}
