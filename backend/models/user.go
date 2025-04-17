package models

import (
	"time"

	"gorm.io/gorm"
)

// UserSwagger ist nur für Swagger, damit alle Felder angezeigt werden
// @Description User-Objekt für die API-Dokumentation
// @name UserSwagger
// @Description User-Objekt
// @Description Enthält alle User-relevanten Felder für die API
// @Description Wird nur für die Swagger/OpenAPI-Doku verwendet
// @Description NICHT für die eigentliche Logik nutzen!
type UserSwagger struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Benutzerrollen-Konstanten
const (
	UserRole  = "user"
	AdminRole = "admin"
)

type User struct {
	gorm.Model
	Username string   `json:"username" gorm:"unique;not null" validate:"required,min=3,max=32"`
	Email    string   `json:"email" gorm:"unique;not null" validate:"required,email"`
	Password string   `json:"-" gorm:"not null" validate:"required,min=8"` // Passwort wird aus JSON-Responses ausgeblendet
	Role     string   `json:"role" gorm:"default:'user'" validate:"oneof=user admin"`
	Settings Settings `json:"settings" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;OnUpdate:CASCADE;"`
}
