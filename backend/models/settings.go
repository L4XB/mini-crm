package models

import (
	"gorm.io/gorm"
	"github.com/go-playground/validator/v10"
)

// SettingsSwagger ist nur für Swagger, damit alle Felder angezeigt werden
// @Description Settings-Objekt für die API-Dokumentation
// @name SettingsSwagger
type SettingsSwagger struct {
    ID       uint   `json:"id"`
    UserID   uint   `json:"user_id"`
    Theme    string `json:"theme"`
    Language string `json:"language"`
}



type Settings struct {
	gorm.Model
	UserID   uint    `json:"user_id"`
	User     *User   `json:"user" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;OnUpdate:CASCADE;"`
	Theme    string  `json:"theme" gorm:"default:'light'" validate:"oneof=light dark"`
	Language string  `json:"language" gorm:"default:'en'" validate:"min=2,max=5"`
}

// Validate validates the settings struct
func (s *Settings) Validate() error {
	return validator.New().Struct(s)
}
