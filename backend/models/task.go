package models

import (
	"time"
	"gorm.io/gorm"
	"github.com/go-playground/validator/v10"
)

// TaskSwagger ist nur für Swagger, damit alle Felder angezeigt werden
// @Description Task-Objekt für die API-Dokumentation
// @name TaskSwagger
type TaskSwagger struct {
    ID        uint      `json:"id"`
    UserID    uint      `json:"user_id"`
    DealID    uint      `json:"deal_id"`
    Title     string    `json:"title"`
    Done      bool      `json:"done"`
    DueDate   time.Time `json:"due_date"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}



type Task struct {
	gorm.Model
	Title     string    `json:"title" validate:"required,min=3,max=128"`
	Details   string    `json:"details" validate:"max=1024"`
	DueDate   time.Time `json:"due_date"`
	Completed bool      `json:"completed"`
	DealID    uint      `json:"deal_id"`
	Deal      Deal      `json:"deal" gorm:"foreignKey:DealID;constraint:OnDelete:SET NULL;OnUpdate:CASCADE;"`
	UserID    uint      `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;OnUpdate:CASCADE;"`
}

// Validate validates the task struct
func (t *Task) Validate() error {
	return validator.New().Struct(t)
}
