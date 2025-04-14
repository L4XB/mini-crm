package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
)

// CreateDeal erstellt einen neuen Deal
// @Summary Deal anlegen
// @Description Lege einen neuen Deal für den authentifizierten User an
// @Tags deals
// @Accept json
// @Produce json
// @Param deal body models.Deal true "Deal-Daten"
// @Success 201 {object} models.DealSwagger
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /deals [post]
func CreateDeal(c *gin.Context) {
	var deal models.Deal
	if err := c.ShouldBindJSON(&deal); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}

	// Set current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}

	// Ensure deal belongs to the authenticated user
	deal.UserID = userID.(uint)
	
	// Validate that referenced contact exists and belongs to user
	if deal.ContactID > 0 {
		var contact models.Contact
		result := config.DB.Where("id = ?", deal.ContactID).First(&contact)
		if result.Error != nil {
			utils.BadRequestResponse(c, "Referenced contact does not exist")
			return
		}
		
		// Check contact ownership unless admin
		userRole, _ := c.Get("user_role")
		if userRole != "admin" && contact.UserID != userID.(uint) {
			utils.ForbiddenResponse(c, "You cannot create a deal for a contact that doesn't belong to you")
			return
		}
	}

	result := config.DB.Create(&deal)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to create deal")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Deal created successfully", deal)
}

// GetDeals gibt alle Deals des authentifizierten Users zurück
// @Summary Deals auflisten
// @Description Listet alle Deals für den angemeldeten User oder Admin auf
// @Tags deals
// @Accept json
// @Produce json
// @Param user_id query int false "User-ID (nur für Admins)"
// @Param contact_id query int false "Contact-ID"
// @Success 200 {array} models.DealSwagger
// @Failure 401 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /deals [get]
func GetDeals(c *gin.Context) {
	var deals []models.Deal
	
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
	contactID := c.Query("contact_id")
	
	// Build query
	query := config.DB
	
	// Admin can filter by any user_id or get all deals
	if userRole == "admin" {
		// Apply filters if provided
		if queryUserID != "" {
			query = query.Where("user_id = ?", queryUserID)
		}
	} else {
		// Regular users can only access their own deals
		query = query.Where("user_id = ?", userID)
	}
	
	// Apply contact filter if provided
	if contactID != "" {
		query = query.Where("contact_id = ?", contactID)
	}
	
	// Execute query
	query.Find(&deals)

	utils.SuccessResponse(c, http.StatusOK, "Deals retrieved successfully", deals)
}

// GetDeal gibt einen einzelnen Deal anhand der ID zurück
// @Summary Deal abrufen
// @Description Gibt einen Deal anhand seiner ID zurück
// @Tags deals
// @Accept json
// @Produce json
// @Param id path int true "Deal-ID"
// @Success 200 {object} models.DealSwagger
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /deals/{id} [get]
func GetDeal(c *gin.Context) {
	id := c.Param("id")
	var deal models.Deal
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Preload related objects for more complete data
	result := config.DB.Preload("Contact").Preload("Tasks").First(&deal, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Deal not found")
		return
	}
	
	// Check if user is authorized to access this deal
	if userRole != "admin" && deal.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to access this deal")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deal retrieved successfully", deal)
}

// UpdateDeal aktualisiert einen bestehenden Deal
// @Summary Deal aktualisieren
// @Description Aktualisiert die Daten eines bestehenden Deals
// @Tags deals
// @Accept json
// @Produce json
// @Param id path int true "Deal-ID"
// @Param deal body models.Deal true "Deal-Daten"
// @Success 200 {object} models.DealSwagger
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /deals/{id} [put]
func UpdateDeal(c *gin.Context) {
	id := c.Param("id")
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Find existing deal
	var deal models.Deal
	result := config.DB.First(&deal, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Deal not found")
		return
	}
	
	// Check if user is authorized to update this deal
	if userRole != "admin" && deal.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to update this deal")
		return
	}
	
	// Store original IDs to prevent changing ownership
	originalUserID := deal.UserID
	originalContactID := deal.ContactID
	
	// Bind JSON to deal
	if err := c.ShouldBindJSON(&deal); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}
	
	// Preserve original userID (prevent changing ownership)
	deal.UserID = originalUserID
	
	// Check if contact ID is being changed
	if deal.ContactID != originalContactID {
		// Verify new contact exists and belongs to user
		var contact models.Contact
		result := config.DB.Where("id = ?", deal.ContactID).First(&contact)
		if result.Error != nil {
			utils.BadRequestResponse(c, "Referenced contact does not exist")
			return
		}
		
		// Check contact ownership unless admin
		if userRole != "admin" && contact.UserID != userID.(uint) {
			utils.ForbiddenResponse(c, "You cannot assign a deal to a contact that doesn't belong to you")
			return
		}
	}
	
	// Save updated deal
	result = config.DB.Save(&deal)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to update deal")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deal updated successfully", deal)
}

// DeleteDeal löscht einen Deal
// @Summary Deal löschen
// @Description Löscht einen Deal und alle zugehörigen Daten
// @Tags deals
// @Accept json
// @Produce json
// @Param id path int true "Deal-ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /deals/{id} [delete]
func DeleteDeal(c *gin.Context) {
	id := c.Param("id")
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Find deal to delete
	var deal models.Deal
	result := config.DB.First(&deal, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Deal not found")
		return
	}
	
	// Check if user is authorized to delete this deal
	if userRole != "admin" && deal.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to delete this deal")
		return
	}
	
	// Use a transaction to delete associated data
	tx := config.DB.Begin()
	
	// Delete related tasks
	tx.Where("deal_id = ?", id).Delete(&models.Task{})
	
	// Delete related notes
	tx.Where("deal_id = ?", id).Delete(&models.Note{})
	
	// Delete the deal
	tx.Delete(&deal)
	
	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to delete deal and related data")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deal and related data deleted successfully", nil)
}
