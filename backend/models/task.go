package models

import (
	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Title     string `json:"title"`
	Details   string `json:"details"`
	DueDate   string `json:"due_date"`
	Completed bool   `json:"completed"`
	DealID    uint   `json:"deal_id"`
	Deal      Deal   `json:"deal" gorm:"foreignKey:DealID"`
	UserID    uint   `json:"user_id"`
	User      User   `json:"user" gorm:"foreignKey:UserID"`
}
