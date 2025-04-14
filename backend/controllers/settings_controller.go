package controllers

import (
	"net/http"
	"strconv"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
)

// GetUserSettings gibt die Einstellungen eines bestimmten Users zurück
// @Summary Einstellungen abrufen
// @Description Gibt die Einstellungen eines Users anhand der User-ID zurück
// @Tags settings
// @Accept json
// @Produce json
// @Param id path int true "User-ID"
// @Success 200 {object} models.SettingsSwagger
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /settings/{id} [get]
func GetUserSettings(c *gin.Context) {
	// Get authenticated user ID and role from context
	authUserID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Get requested user ID from URL parameter
	requestedUserID := c.Param("id")
	parsedRequestedUserID := uint(parseUint(requestedUserID))
	
	// Check authorization - users can only access their own settings unless admin
	if userRole != "admin" && authUserID.(uint) != parsedRequestedUserID {
		utils.ForbiddenResponse(c, "You do not have permission to access these settings")
		return
	}
	
	var settings models.Settings
	
	result := config.DB.Where("user_id = ?", requestedUserID).First(&settings)
	if result.Error != nil {
		// If no settings found, create default settings
		settings = models.Settings{
			UserID:   parsedRequestedUserID,
			Theme:    "light",
			Language: "en",
		}
		result = config.DB.Create(&settings)
		if result.Error != nil {
			utils.InternalServerErrorResponse(c, "Failed to create default settings")
			return
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "Settings retrieved successfully", settings)
}

// UpdateSettings aktualisiert die Einstellungen eines Users
// @Summary Einstellungen aktualisieren
// @Description Aktualisiert die Einstellungen eines Users anhand der User-ID
// @Tags settings
// @Accept json
// @Produce json
// @Param id path int true "User-ID"
// @Param settings body models.Settings true "Einstellungen"
// @Success 200 {object} models.SettingsSwagger
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /settings/{id} [put]
func UpdateSettings(c *gin.Context) {
	// Get authenticated user ID and role from context
	authUserID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Get requested user ID from URL parameter
	requestedUserID := c.Param("id")
	parsedRequestedUserID := uint(parseUint(requestedUserID))
	
	// Check authorization - users can only update their own settings unless admin
	if userRole != "admin" && authUserID.(uint) != parsedRequestedUserID {
		utils.ForbiddenResponse(c, "You do not have permission to update these settings")
		return
	}
	
	var settings models.Settings
	
	// Try to find existing settings
	result := config.DB.Where("user_id = ?", requestedUserID).First(&settings)
	if result.Error != nil {
		// If not found, initialize new settings
		settings = models.Settings{
			UserID: parsedRequestedUserID,
		}
	}

	// Store original userID to preserve ownership
	originalUserID := settings.UserID

	// Bind JSON body to settings
	if err := c.ShouldBindJSON(&settings); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}

	// Ensure UserID is not changed (preserve ownership)
	settings.UserID = originalUserID

	// Save settings (will update if exists, create if new)
	result = config.DB.Save(&settings)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to save settings")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Settings updated successfully", settings)
}

// Helper function to parse uint from string
func parseUint(s string) uint64 {
	result, err := strconv.ParseUint(s, 10, 64)
	if err != nil {
		return 0
	}
	return result
}
