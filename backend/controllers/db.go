package controllers

import (
	"github.com/deinname/mini-crm-backend/models"
	"gorm.io/gorm"
)

// InitDB initializes the database connection
func InitDB(db *gorm.DB) {
	DB = db
	
	// Auto migrate models
	db.AutoMigrate(
		&models.User{},
		&models.Contact{},
		&models.Deal{},
		&models.Note{},
		&models.Task{},
		&models.Settings{},
	)
}
