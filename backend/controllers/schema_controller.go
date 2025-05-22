package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/models"
	"github.com/gin-gonic/gin"
)

// GetModelSchema gibt das Schema für ein bestimmtes Modell zurück
func GetModelSchema(c *gin.Context) {
	modelName := c.Param("model")
	
	registry := models.GetRegistry()
	model, err := registry.GetModel(modelName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Modell nicht gefunden",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    model,
	})
}

// GetAllModelSchemas gibt die Schemas für alle registrierten Modelle zurück
func GetAllModelSchemas(c *gin.Context) {
	registry := models.GetRegistry()
	models := registry.GetModels()
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    models,
	})
}
