package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
)

// CreateNote erstellt eine neue Notiz
// @Summary Notiz anlegen
// @Description Lege eine neue Notiz für den authentifizierten User an
// @Tags notes
// @Accept json
// @Produce json
// @Param note body models.Note true "Notiz-Daten"
// @Success 201 {object} models.NoteSwagger
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /notes [post]
func CreateNote(c *gin.Context) {
	var note models.Note
	if err := c.ShouldBindJSON(&note); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}

	// Set current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}

	// Ensure note belongs to the authenticated user
	note.UserID = userID.(uint)
	
	// Validate that referenced contact exists and belongs to user
	if note.ContactID > 0 {
		var contact models.Contact
		result := config.DB.Where("id = ?", note.ContactID).First(&contact)
		if result.Error != nil {
			utils.BadRequestResponse(c, "Referenced contact does not exist")
			return
		}
		
		// Check contact ownership unless admin
		userRole, _ := c.Get("user_role")
		if userRole != "admin" && contact.UserID != userID.(uint) {
			utils.ForbiddenResponse(c, "You cannot create a note for a contact that doesn't belong to you")
			return
		}
	}
	
	// Validate that referenced deal exists and belongs to user
	if note.DealID > 0 {
		var deal models.Deal
		result := config.DB.Where("id = ?", note.DealID).First(&deal)
		if result.Error != nil {
			utils.BadRequestResponse(c, "Referenced deal does not exist")
			return
		}
		
		// Check deal ownership unless admin
		userRole, _ := c.Get("user_role")
		if userRole != "admin" && deal.UserID != userID.(uint) {
			utils.ForbiddenResponse(c, "You cannot create a note for a deal that doesn't belong to you")
			return
		}
	}

	result := config.DB.Create(&note)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to create note")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Note created successfully", note)
}

// GetNotes gibt alle Notizen des authentifizierten Users zurück
// @Summary Notizen auflisten
// @Description Listet alle Notizen für den angemeldeten User oder Admin auf
// @Tags notes
// @Accept json
// @Produce json
// @Param user_id query int false "User-ID (nur für Admins)"
// @Param contact_id query int false "Contact-ID"
// @Param deal_id query int false "Deal-ID"
// @Success 200 {array} models.NoteSwagger
// @Failure 401 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /notes [get]
func GetNotes(c *gin.Context) {
	var notes []models.Note

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
	dealID := c.Query("deal_id")
	
	// Build query
	query := config.DB
	
	// Admin can filter by any user_id or get all notes
	if userRole == "admin" {
		if queryUserID != "" {
			query = query.Where("user_id = ?", queryUserID)
		}
	} else {
		// Regular users can only see their own notes
		query = query.Where("user_id = ?", userID)
	}
	
	// Apply additional filters
	if contactID != "" {
		query = query.Where("contact_id = ?", contactID)
	}
	if dealID != "" {
		query = query.Where("deal_id = ?", dealID)
	}
	
	// Execute query
	query.Find(&notes)
	
	utils.SuccessResponse(c, http.StatusOK, "Notes retrieved successfully", notes)
}

// GetNote gibt eine einzelne Notiz anhand der ID zurück
// @Summary Notiz abrufen
// @Description Gibt eine Notiz anhand ihrer ID zurück
// @Tags notes
// @Accept json
// @Produce json
// @Param id path int true "Notiz-ID"
// @Success 200 {object} models.NoteSwagger
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /notes/{id} [get]
func GetNote(c *gin.Context) {
	id := c.Param("id")
	var note models.Note
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Preload related objects for more complete data
	result := config.DB.Preload("Contact").Preload("Deal").First(&note, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Note not found")
		return
	}
	
	// Check if user is authorized to access this note
	if userRole != "admin" && note.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to access this note")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Note retrieved successfully", note)
}

// UpdateNote aktualisiert eine bestehende Notiz
// @Summary Notiz aktualisieren
// @Description Aktualisiert die Daten einer bestehenden Notiz
// @Tags notes
// @Accept json
// @Produce json
// @Param id path int true "Notiz-ID"
// @Param note body models.Note true "Notiz-Daten"
// @Success 200 {object} models.NoteSwagger
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /notes/{id} [put]
func UpdateNote(c *gin.Context) {
	id := c.Param("id")
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Find existing note
	var note models.Note
	result := config.DB.First(&note, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Note not found")
		return
	}
	
	// Check if user is authorized to update this note
	if userRole != "admin" && note.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to update this note")
		return
	}
	
	// Store original values to prevent changing ownership
	originalUserID := note.UserID
	originalContactID := note.ContactID
	originalDealID := note.DealID
	
	// Bind JSON to note
	if err := c.ShouldBindJSON(&note); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}
	
	// Preserve original user ID (prevent changing ownership)
	note.UserID = originalUserID
	
	// Check if referenced contacts or deals are changing
	if note.ContactID != originalContactID && note.ContactID > 0 {
		// Verify contact exists and belongs to user
		var contact models.Contact
		result := config.DB.Where("id = ?", note.ContactID).First(&contact)
		if result.Error != nil {
			utils.BadRequestResponse(c, "Referenced contact does not exist")
			return
		}
		
		// Check ownership unless admin
		if userRole != "admin" && contact.UserID != userID.(uint) {
			utils.ForbiddenResponse(c, "You cannot assign a note to a contact that doesn't belong to you")
			return
		}
	}
	
	if note.DealID != originalDealID && note.DealID > 0 {
		// Verify deal exists and belongs to user
		var deal models.Deal
		result := config.DB.Where("id = ?", note.DealID).First(&deal)
		if result.Error != nil {
			utils.BadRequestResponse(c, "Referenced deal does not exist")
			return
		}
		
		// Check ownership unless admin
		if userRole != "admin" && deal.UserID != userID.(uint) {
			utils.ForbiddenResponse(c, "You cannot assign a note to a deal that doesn't belong to you")
			return
		}
	}
	
	// Save updated note
	result = config.DB.Save(&note)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to update note")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Note updated successfully", note)
}

// DeleteNote löscht eine Notiz
// @Summary Notiz löschen
// @Description Löscht eine Notiz
// @Tags notes
// @Accept json
// @Produce json
// @Param id path int true "Notiz-ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 403 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Security BearerAuth
// @Router /notes/{id} [delete]
func DeleteNote(c *gin.Context) {
	id := c.Param("id")
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Find note to delete
	var note models.Note
	result := config.DB.First(&note, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Note not found")
		return
	}
	
	// Check if user is authorized to delete this note
	if userRole != "admin" && note.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to delete this note")
		return
	}

	// Delete the note
	result = config.DB.Delete(&note)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to delete note")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Note deleted successfully", nil)
}
