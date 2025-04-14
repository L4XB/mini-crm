package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/models"
	"github.com/gin-gonic/gin"
)

// CreateContact handles the creation of a new contact
func CreateContact(c *gin.Context) {
	var contact models.Contact
	if err := c.ShouldBindJSON(&contact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := DB.Create(&contact)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, contact)
}

// GetContacts returns all contacts
func GetContacts(c *gin.Context) {
	var contacts []models.Contact
	
	// Filter by user_id if provided
	userID := c.Query("user_id")
	if userID != "" {
		DB.Where("user_id = ?", userID).Find(&contacts)
	} else {
		DB.Find(&contacts)
	}

	c.JSON(http.StatusOK, contacts)
}

// GetContact returns a specific contact by ID
func GetContact(c *gin.Context) {
	id := c.Param("id")
	var contact models.Contact
	
	// Preload associated objects for more complete data
	result := DB.Preload("Notes").Preload("Deals").First(&contact, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
		return
	}

	c.JSON(http.StatusOK, contact)
}

// UpdateContact updates an existing contact
func UpdateContact(c *gin.Context) {
	id := c.Param("id")
	var contact models.Contact
	result := DB.First(&contact, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
		return
	}

	if err := c.ShouldBindJSON(&contact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB.Save(&contact)
	c.JSON(http.StatusOK, contact)
}

// DeleteContact deletes a contact
func DeleteContact(c *gin.Context) {
	id := c.Param("id")
	var contact models.Contact
	result := DB.First(&contact, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
		return
	}

	DB.Delete(&contact)
	c.JSON(http.StatusOK, gin.H{"message": "Contact deleted successfully"})
}
