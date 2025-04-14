package models

import (
	"gorm.io/gorm"
)

type Contact struct {
	gorm.Model
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Position     string `json:"position"`      // Position im Unternehmen
	Company      string `json:"company"`       // Firmenname
	ContactStage string `json:"contact_stage"` // Lead, Customer, Prospect, etc.
	UserID       uint   `json:"user_id"`
	User         User   `json:"user" gorm:"foreignKey:UserID"`
	Notes        []Note `json:"notes" gorm:"foreignKey:ContactID"`
	Deals        []Deal `json:"deals" gorm:"foreignKey:ContactID"`
}
