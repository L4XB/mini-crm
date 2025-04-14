package models

import (
	"gorm.io/gorm"
)

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
