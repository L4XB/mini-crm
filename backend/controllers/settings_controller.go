package controllers

import (
	"net/http"
	"strconv"

	"github.com/deinname/mini-crm-backend/models"
	"github.com/gin-gonic/gin"
)

// GetUserSettings returns settings for a specific user
func GetUserSettings(c *gin.Context) {
	userID := c.Param("id")
	var settings models.Settings
	
	result := DB.Where("user_id = ?", userID).First(&settings)
	if result.Error != nil {
		// If no settings found, create default settings
		settings = models.Settings{
			UserID:   uint(parseUint(userID)),
			Theme:    "light",
			Language: "en",
		}
		DB.Create(&settings)
	}

	c.JSON(http.StatusOK, settings)
}

// UpdateSettings updates user settings
func UpdateSettings(c *gin.Context) {
	userID := c.Param("id")
	var settings models.Settings
	
	// Try to find existing settings
	result := DB.Where("user_id = ?", userID).First(&settings)
	if result.Error != nil {
		// If not found, initialize new settings
		settings = models.Settings{
			UserID: uint(parseUint(userID)),
		}
	}

	// Bind JSON body to settings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure UserID is not changed
	settings.UserID = uint(parseUint(userID))

	// Save settings (will update if exists, create if new)
	DB.Save(&settings)
	c.JSON(http.StatusOK, settings)
}

// Helper function to parse uint from string
func parseUint(s string) uint64 {
	result, err := strconv.ParseUint(s, 10, 64)
	if err != nil {
		return 0
	}
	return result
}
