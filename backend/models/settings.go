package models

import (
	"gorm.io/gorm"
)

type Settings struct {
	gorm.Model
	UserID   uint    `json:"user_id"`
	User     *User   `json:"user" gorm:"foreignKey:UserID"`
	Theme    string  `json:"theme" gorm:"default:'light'"`
	Language string  `json:"language" gorm:"default:'en'"`
}
