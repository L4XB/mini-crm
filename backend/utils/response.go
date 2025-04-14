package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIErrorResponse repräsentiert eine Fehlerantwort (für Swagger)
// @Description Fehlerstruktur für API-Fehler
// @name ErrorResponse
type APIErrorResponse struct {
	// Erfolg der Anfrage (immer false bei Fehler)
	Success bool `json:"success" example:"false"`
	// Fehlernachricht
	Error string `json:"error" example:"Etwas ist schiefgelaufen"`
}

// APISuccessResponse repräsentiert eine erfolgreiche Antwort (für Swagger)
// @Description Erfolgsstruktur für API-Antworten
// @name SuccessResponse
type APISuccessResponse struct {
	// Erfolg der Anfrage (immer true bei Erfolg)
	Success bool `json:"success" example:"true"`
	// Nachricht
	Message string `json:"message" example:"Aktion erfolgreich"`
}

// Response struct for standardized API responses
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// SuccessResponse returns a standardized success response
func SuccessResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse returns a standardized error response
func ErrorResponse(c *gin.Context, statusCode int, errorMessage string) {
	c.JSON(statusCode, Response{
		Success: false,
		Error:   errorMessage,
	})
}

// BadRequestResponse is a convenience function for 400 errors
func BadRequestResponse(c *gin.Context, errorMessage string) {
	ErrorResponse(c, http.StatusBadRequest, errorMessage)
}

// UnauthorizedResponse is a convenience function for 401 errors
func UnauthorizedResponse(c *gin.Context, errorMessage string) {
	if errorMessage == "" {
		errorMessage = "Unauthorized access"
	}
	ErrorResponse(c, http.StatusUnauthorized, errorMessage)
}

// ForbiddenResponse is a convenience function for 403 errors
func ForbiddenResponse(c *gin.Context, errorMessage string) {
	if errorMessage == "" {
		errorMessage = "Access forbidden"
	}
	ErrorResponse(c, http.StatusForbidden, errorMessage)
}

// NotFoundResponse is a convenience function for 404 errors
func NotFoundResponse(c *gin.Context, errorMessage string) {
	if errorMessage == "" {
		errorMessage = "Resource not found"
	}
	ErrorResponse(c, http.StatusNotFound, errorMessage)
}

// InternalServerErrorResponse is a convenience function for 500 errors
func InternalServerErrorResponse(c *gin.Context, errorMessage string) {
	if errorMessage == "" {
		errorMessage = "Internal server error"
	}
	ErrorResponse(c, http.StatusInternalServerError, errorMessage)
}
