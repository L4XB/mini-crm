package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
)

// CreateContact handles the creation of a new contact
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

	result := config.DB.Create(&contact)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to create contact")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Contact created successfully", contact)
}

// GetContacts returns all contacts for the authenticated user
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

// GetContact returns a specific contact by ID
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

// UpdateContact updates an existing contact
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

// DeleteContact deletes a contact
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
