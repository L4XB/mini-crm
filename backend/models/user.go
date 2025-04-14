package models

import (
	"gorm.io/gorm"
)

// Benutzerrollen-Konstanten
const (
	UserRole  = "user"
	AdminRole = "admin"
)

type User struct {
	gorm.Model
	Username string   `json:"username" gorm:"unique;not null"`
	Email    string   `json:"email" gorm:"unique;not null"`
	Password string   `json:"-" gorm:"not null"` // Passwort wird aus JSON-Responses ausgeblendet
	Role     string   `json:"role" gorm:"default:'user'"`
	Settings Settings `json:"settings" gorm:"foreignKey:UserID"`
}
