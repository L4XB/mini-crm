package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
)

// CreateContact erstellt einen neuen Kontakt
// @Summary Kontakt anlegen
// @Description Lege einen neuen Kontakt für den authentifizierten User an
// @Tags contacts
// @Accept json
// @Produce json
// @Param contact body models.Contact true "Kontaktdaten"
// @Success 201 {object} models.ContactSwagger
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /contacts [post]
func CreateContact(c *gin.Context) {
	var contact models.Contact
	if err := c.ShouldBindJSON(&contact); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}

	// Set current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}

	// Ensure contact belongs to the authenticated user
	contact.UserID = userID.(uint)

	// Validate contact struct
	if err := contact.Validate(); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}

	result := config.DB.Create(&contact)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to create contact")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Contact created successfully", contact)
}

// GetContacts gibt alle Kontakte des authentifizierten Users zurück
// @Summary Kontakte auflisten
// @Description Listet alle Kontakte für den angemeldeten User oder Admin auf
// @Tags contacts
// @Accept json
// @Produce json
// @Param user_id query int false "User-ID (nur für Admins)"
// @Success 200 {array} models.ContactSwagger
// @Failure 401 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /contacts [get]
func GetContacts(c *gin.Context) {
	var contacts []models.Contact
	
	// Get authenticated user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	// Get user role from context
	userRole, _ := c.Get("user_role")
	
	// Query parameters
	queryUserID := c.Query("user_id")
	
	// Admin can filter by any user_id or get all contacts
	if userRole == "admin" {
		if queryUserID != "" {
			config.DB.Where("user_id = ?", queryUserID).Find(&contacts)
		} else {
			config.DB.Find(&contacts)
		}
	} else {
		// Regular users can only access their own contacts
		config.DB.Where("user_id = ?", userID).Find(&contacts)
	}

	utils.SuccessResponse(c, http.StatusOK, "Contacts retrieved successfully", contacts)
}

// GetContact gibt einen einzelnen Kontakt anhand der ID zurück
// @Summary Kontakt abrufen
// @Description Gibt einen Kontakt anhand seiner ID zurück
// @Tags contacts
// @Accept json
// @Produce json
// @Param id path int true "Kontakt-ID"
// @Success 200 {object} models.ContactSwagger
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /contacts/{id} [get]
func GetContact(c *gin.Context) {
	id := c.Param("id")
	var contact models.Contact
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Preload associated objects for more complete data
	result := config.DB.Preload("Notes").Preload("Deals").First(&contact, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Contact not found")
		return
	}
	
	// Check if user is authorized to access this contact
	if userRole != "admin" && contact.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to access this contact")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Contact retrieved successfully", contact)
}

// UpdateContact aktualisiert einen bestehenden Kontakt
// @Summary Kontakt aktualisieren
// @Description Aktualisiert die Daten eines bestehenden Kontakts
// @Tags contacts
// @Accept json
// @Produce json
// @Param id path int true "Kontakt-ID"
// @Param contact body models.Contact true "Kontaktdaten"
// @Success 200 {object} models.ContactSwagger
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /contacts/{id} [put]
func UpdateContact(c *gin.Context) {
	id := c.Param("id")
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Find existing contact
	var contact models.Contact
	result := config.DB.First(&contact, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Contact not found")
		return
	}
	
	// Check if user is authorized to update this contact
	if userRole != "admin" && contact.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to update this contact")
		return
	}
	
	// Store original user ID to prevent changing ownership
	originalUserID := contact.UserID
	
	// Bind JSON to contact
	if err := c.ShouldBindJSON(&contact); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}
	
	// Preserve original user ID (prevent changing ownership)
	contact.UserID = originalUserID
	
	// Save updated contact
	result = config.DB.Save(&contact)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to update contact")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Contact updated successfully", contact)
}

// DeleteContact löscht einen Kontakt
// @Summary Kontakt löschen
// @Description Löscht einen Kontakt und alle zugehörigen Daten
// @Tags contacts
// @Accept json
// @Produce json
// @Param id path int true "Kontakt-ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /contacts/{id} [delete]
func DeleteContact(c *gin.Context) {
	id := c.Param("id")
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Find contact to delete
	var contact models.Contact
	result := config.DB.First(&contact, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Contact not found")
		return
	}
	
	// Check if user is authorized to delete this contact
	if userRole != "admin" && contact.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to delete this contact")
		return
	}
	
	// Use a transaction to delete associated data
	tx := config.DB.Begin()
	
	// Delete related notes
	tx.Where("contact_id = ?", id).Delete(&models.Note{})
	
	// Delete related deals
	tx.Where("contact_id = ?", id).Delete(&models.Deal{})
	
	// Delete the contact
	tx.Delete(&contact)
	
	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to delete contact and related data")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Contact and related data deleted successfully", nil)
}
