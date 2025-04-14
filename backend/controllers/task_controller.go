package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/models"
	"github.com/gin-gonic/gin"
)

// CreateTask handles the creation of a new task
func CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := DB.Create(&task)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, task)
}

// GetTasks returns all tasks, optionally filtered by user_id or deal_id
func GetTasks(c *gin.Context) {
	var tasks []models.Task
	
	// Support filtering by user_id or deal_id
	userID := c.Query("user_id")
	dealID := c.Query("deal_id")
	completed := c.Query("completed")
	
	query := DB
	
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if dealID != "" {
		query = query.Where("deal_id = ?", dealID)
	}
	if completed != "" {
		query = query.Where("completed = ?", completed == "true")
	}
	
	query.Find(&tasks)
	c.JSON(http.StatusOK, tasks)
}

// GetTask returns a specific task by ID
func GetTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	
	result := DB.Preload("Deal").First(&task, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}

// UpdateTask updates an existing task
func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	result := DB.First(&task, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB.Save(&task)
	c.JSON(http.StatusOK, task)
}

// DeleteTask deletes a task
func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	result := DB.First(&task, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	DB.Delete(&task)
	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

// ToggleTaskCompletion toggles the completion status of a task
func ToggleTaskCompletion(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	result := DB.First(&task, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	task.Completed = !task.Completed
	DB.Save(&task)
	c.JSON(http.StatusOK, task)
}
