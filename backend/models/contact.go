package models

import (
	"time"

	"gorm.io/gorm"
)

// ContactSwagger ist nur für Swagger, damit alle Felder angezeigt werden
// @Description Contact-Objekt für die API-Dokumentation
// @name ContactSwagger
type ContactSwagger struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Company   string    `json:"company"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Contact struct {
	gorm.Model
	FirstName    string `json:"first_name" validate:"required,min=2,max=64"`
	LastName     string `json:"last_name" validate:"required,min=2,max=64"`
	Email        string `json:"email" validate:"required,email"`
	Phone        string `json:"phone" validate:"max=32"`
	Position     string `json:"position" validate:"max=64"`
	Company      string `json:"company" validate:"max=128"`
	ContactStage string `json:"contact_stage" validate:"oneof=Lead Customer Prospect"`
	UserID       uint   `json:"user_id"`
	User         User   `json:"user" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;OnUpdate:CASCADE;"`
	Notes        []Note `json:"notes" gorm:"foreignKey:ContactID;constraint:OnDelete:CASCADE;OnUpdate:CASCADE;"`
	Deals        []Deal `json:"deals" gorm:"foreignKey:ContactID;constraint:OnDelete:CASCADE;OnUpdate:CASCADE;"`
}
