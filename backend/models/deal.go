package models

import (
	"time"

	"gorm.io/gorm"
)

type Deal struct {
	gorm.Model
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Value        float64   `json:"value"`
	Status       string    `json:"status"`
	ExpectedDate time.Time `json:"expected_date"` // Erwartetes Abschlussdatum
	ContactID    uint      `json:"contact_id"`
	Contact      Contact   `json:"contact" gorm:"foreignKey:ContactID"`
	UserID       uint      `json:"user_id"`
	User         User      `json:"user" gorm:"foreignKey:UserID"`
	Tasks        []Task    `json:"tasks" gorm:"foreignKey:DealID"`
}
