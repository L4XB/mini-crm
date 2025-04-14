package models

import (
	"time"
	"gorm.io/gorm"
	"github.com/go-playground/validator/v10"
)

// DealSwagger ist nur für Swagger, damit alle Felder angezeigt werden
// @Description Deal-Objekt für die API-Dokumentation
// @name DealSwagger
type DealSwagger struct {
    ID          uint      `json:"id"`
    UserID      uint      `json:"user_id"`
    ContactID   uint      `json:"contact_id"`
    Title       string    `json:"title"`
    Value       float64   `json:"value"`
    Status      string    `json:"status"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}



type Deal struct {
	gorm.Model
	Title        string    `json:"title" validate:"required,min=3,max=128"`
	Description  string    `json:"description" validate:"max=1024"`
	Value        float64   `json:"value" validate:"min=0"`
	Status       string    `json:"status" validate:"oneof=open won lost"`
	ExpectedDate time.Time `json:"expected_date"` // Erwartetes Abschlussdatum
	ContactID    uint      `json:"contact_id"`
	Contact      Contact   `json:"contact" gorm:"foreignKey:ContactID;constraint:OnDelete:SET NULL;OnUpdate:CASCADE;"`
	UserID       uint      `json:"user_id"`
	User         User      `json:"user" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;OnUpdate:CASCADE;"`
	Tasks        []Task    `json:"tasks" gorm:"foreignKey:DealID;constraint:OnDelete:CASCADE;OnUpdate:CASCADE;"`
}

// Validate validates the deal struct
func (d *Deal) Validate() error {
	return validator.New().Struct(d)
}
