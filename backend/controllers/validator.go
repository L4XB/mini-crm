package controllers

import (
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

// SetValidator sets the validator instance for controllers
func SetValidator(v *validator.Validate) {
	validate = v
}
