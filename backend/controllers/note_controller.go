package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/models"
	"github.com/gin-gonic/gin"
)

// CreateNote handles the creation of a new note
func CreateNote(c *gin.Context) {
	var note models.Note
	if err := c.ShouldBindJSON(&note); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := DB.Create(&note)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, note)
}

// GetNotes returns all notes, optionally filtered by user_id, contact_id, or deal_id
func GetNotes(c *gin.Context) {
	var notes []models.Note

	// Support filtering by different parameters
	userID := c.Query("user_id")
	contactID := c.Query("contact_id")
	dealID := c.Query("deal_id")

	query := DB

	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if contactID != "" {
		query = query.Where("contact_id = ?", contactID)
	}
	if dealID != "" {
		query = query.Where("deal_id = ?", dealID)
	}

	query.Find(&notes)
	c.JSON(http.StatusOK, notes)
}

// GetNote returns a specific note by ID
func GetNote(c *gin.Context) {
	id := c.Param("id")
	var note models.Note

	result := DB.Preload("Contact").Preload("Deal").First(&note, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
		return
	}

	c.JSON(http.StatusOK, note)
}

// UpdateNote updates an existing note
func UpdateNote(c *gin.Context) {
	id := c.Param("id")
	var note models.Note
	result := DB.First(&note, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
		return
	}

	if err := c.ShouldBindJSON(&note); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB.Save(&note)
	c.JSON(http.StatusOK, note)
}

// DeleteNote deletes a note
func DeleteNote(c *gin.Context) {
	id := c.Param("id")
	var note models.Note
	result := DB.First(&note, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
		return
	}

	DB.Delete(&note)
	c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
}
