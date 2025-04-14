package controllers

import (
	"github.com/deinname/mini-crm-backend/config"
	"gorm.io/gorm"
)

// db instance used by all controllers
var DB *gorm.DB

// initDB initializes the database connection for the controllers package
func InitDB() {
	DB = config.DB
}
