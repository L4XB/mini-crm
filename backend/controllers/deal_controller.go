package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/models"
	"github.com/gin-gonic/gin"
)

// CreateDeal handles the creation of a new deal
func CreateDeal(c *gin.Context) {
	var deal models.Deal
	if err := c.ShouldBindJSON(&deal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := DB.Create(&deal)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, deal)
}

// GetDeals returns all deals
func GetDeals(c *gin.Context) {
	var deals []models.Deal
	
	// Support filtering by user_id or contact_id
	userID := c.Query("user_id")
	contactID := c.Query("contact_id")
	
	if userID != "" && contactID != "" {
		DB.Where("user_id = ? AND contact_id = ?", userID, contactID).Find(&deals)
	} else if userID != "" {
		DB.Where("user_id = ?", userID).Find(&deals)
	} else if contactID != "" {
		DB.Where("contact_id = ?", contactID).Find(&deals)
	} else {
		DB.Find(&deals)
	}

	c.JSON(http.StatusOK, deals)
}

// GetDeal returns a specific deal by ID
func GetDeal(c *gin.Context) {
	id := c.Param("id")
	var deal models.Deal
	
	// Preload related objects for more complete data
	result := DB.Preload("Contact").Preload("Tasks").First(&deal, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	c.JSON(http.StatusOK, deal)
}

// UpdateDeal updates an existing deal
func UpdateDeal(c *gin.Context) {
	id := c.Param("id")
	var deal models.Deal
	result := DB.First(&deal, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	if err := c.ShouldBindJSON(&deal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB.Save(&deal)
	c.JSON(http.StatusOK, deal)
}

// DeleteDeal deletes a deal
func DeleteDeal(c *gin.Context) {
	id := c.Param("id")
	var deal models.Deal
	result := DB.First(&deal, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	DB.Delete(&deal)
	c.JSON(http.StatusOK, gin.H{"message": "Deal deleted successfully"})
}
