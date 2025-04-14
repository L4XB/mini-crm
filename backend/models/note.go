package models

import (
	"time"
	"gorm.io/gorm"
)

// NoteSwagger ist nur für Swagger, damit alle Felder angezeigt werden
// @Description Note-Objekt für die API-Dokumentation
// @name NoteSwagger
type NoteSwagger struct {
    ID        uint      `json:"id"`
    UserID    uint      `json:"user_id"`
    ContactID uint      `json:"contact_id"`
    DealID    uint      `json:"deal_id"`
    Content   string    `json:"content"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}



type Note struct {
	gorm.Model
	Content   string  `json:"content"`
	ContactID uint    `json:"contact_id"`
	DealID    uint    `json:"deal_id"`
	Contact   Contact `json:"contact" gorm:"foreignKey:ContactID"`
	Deal      Deal    `json:"deal" gorm:"foreignKey:DealID"`
	UserID    uint    `json:"user_id"`
	User      User    `json:"user" gorm:"foreignKey:UserID"`
}
