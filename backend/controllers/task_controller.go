package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
)

// CreateTask erstellt eine neue Aufgabe
// @Summary Aufgabe anlegen
// @Description Lege eine neue Aufgabe für den authentifizierten User an
// @Tags tasks
// @Accept json
// @Produce json
// @Param task body models.Task true "Aufgaben-Daten"
// @Success 201 {object} models.TaskSwagger
// @Failure 400 {object} utils.APIErrorResponse
// @Failure 401 {object} utils.APIErrorResponse
// @Failure 500 {object} utils.APIErrorResponse
// @Security BearerAuth
// @Router /tasks [post]
func CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}

	// Set current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}

	// Ensure task belongs to the authenticated user
	task.UserID = userID.(uint)
	
	// Validate that referenced deal exists and belongs to user
	if task.DealID > 0 {
		var deal models.Deal
		result := config.DB.Where("id = ?", task.DealID).First(&deal)
		if result.Error != nil {
			utils.BadRequestResponse(c, "Referenced deal does not exist")
			return
		}
		
		// Check deal ownership unless admin
		userRole, _ := c.Get("user_role")
		if userRole != "admin" && deal.UserID != userID.(uint) {
			utils.ForbiddenResponse(c, "You cannot create a task for a deal that doesn't belong to you")
			return
		}
	}

	result := config.DB.Create(&task)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to create task")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Task created successfully", task)
}

// GetTasks gibt alle Aufgaben des authentifizierten Users zurück
// @Summary Aufgaben auflisten
// @Description Listet alle Aufgaben für den angemeldeten User oder Admin auf
// @Tags tasks
// @Accept json
// @Produce json
// @Param user_id query int false "User-ID (nur für Admins)"
// @Param deal_id query int false "Deal-ID"
// @Param completed query bool false "Abgeschlossen?"
// @Success 200 {array} models.TaskSwagger
// @Failure 401 {object} utils.APIErrorResponse
// @Failure 500 {object} utils.APIErrorResponse
// @Security BearerAuth
// @Router /tasks [get]
func GetTasks(c *gin.Context) {
	var tasks []models.Task
	
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
	dealID := c.Query("deal_id")
	completed := c.Query("completed")
	
	// Build query
	query := config.DB
	
	// Admin can filter by any user_id or get all tasks
	if userRole == "admin" {
		if queryUserID != "" {
			query = query.Where("user_id = ?", queryUserID)
		}
	} else {
		// Regular users can only see their own tasks
		query = query.Where("user_id = ?", userID)
	}
	
	// Apply additional filters
	if dealID != "" {
		query = query.Where("deal_id = ?", dealID)
	}
	if completed != "" {
		query = query.Where("completed = ?", completed == "true")
	}

	// Order by due date with incomplete tasks first
	query = query.Order("completed ASC, due_date ASC")
	
	// Execute query
	query.Find(&tasks)
	
	utils.SuccessResponse(c, http.StatusOK, "Tasks retrieved successfully", tasks)
}

// GetTask gibt eine einzelne Aufgabe anhand der ID zurück
// @Summary Aufgabe abrufen
// @Description Gibt eine Aufgabe anhand ihrer ID zurück
// @Tags tasks
// @Accept json
// @Produce json
// @Param id path int true "Aufgaben-ID"
// @Success 200 {object} models.TaskSwagger
// @Failure 401 {object} utils.APIErrorResponse
// @Failure 403 {object} utils.APIErrorResponse
// @Failure 404 {object} utils.APIErrorResponse
// @Security BearerAuth
// @Router /tasks/{id} [get]
func GetTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Preload related objects for more complete data
	result := config.DB.Preload("Deal").First(&task, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Task not found")
		return
	}
	
	// Check if user is authorized to access this task
	if userRole != "admin" && task.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to access this task")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task retrieved successfully", task)
}

// UpdateTask aktualisiert eine bestehende Aufgabe
// @Summary Aufgabe aktualisieren
// @Description Aktualisiert die Daten einer bestehenden Aufgabe
// @Tags tasks
// @Accept json
// @Produce json
// @Param id path int true "Aufgaben-ID"
// @Param task body models.Task true "Aufgaben-Daten"
// @Success 200 {object} models.TaskSwagger
// @Failure 400 {object} utils.APIErrorResponse
// @Failure 401 {object} utils.APIErrorResponse
// @Failure 403 {object} utils.APIErrorResponse
// @Failure 404 {object} utils.APIErrorResponse
// @Failure 500 {object} utils.APIErrorResponse
// @Security BearerAuth
// @Router /tasks/{id} [put]
func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Find existing task
	var task models.Task
	result := config.DB.First(&task, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Task not found")
		return
	}
	
	// Check if user is authorized to update this task
	if userRole != "admin" && task.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to update this task")
		return
	}
	
	// Store original values to prevent changing ownership
	originalUserID := task.UserID
	originalDealID := task.DealID
	
	// Bind JSON to task
	if err := c.ShouldBindJSON(&task); err != nil {
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}
	
	// Preserve original user ID (prevent changing ownership)
	task.UserID = originalUserID
	
	// Check if deal ID is being changed
	if task.DealID != originalDealID && task.DealID > 0 {
		// Verify deal exists and belongs to user
		var deal models.Deal
		result := config.DB.Where("id = ?", task.DealID).First(&deal)
		if result.Error != nil {
			utils.BadRequestResponse(c, "Referenced deal does not exist")
			return
		}
		
		// Check deal ownership unless admin
		if userRole != "admin" && deal.UserID != userID.(uint) {
			utils.ForbiddenResponse(c, "You cannot assign a task to a deal that doesn't belong to you")
			return
		}
	}
	
	// Save updated task
	result = config.DB.Save(&task)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to update task")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task updated successfully", task)
}

// DeleteTask löscht eine Aufgabe
// @Summary Aufgabe löschen
// @Description Löscht eine Aufgabe
// @Tags tasks
// @Accept json
// @Produce json
// @Param id path int true "Aufgaben-ID"
// @Success 200 {object} utils.APISuccessResponse
// @Failure 401 {object} utils.APIErrorResponse
// @Failure 403 {object} utils.APIErrorResponse
// @Failure 404 {object} utils.APIErrorResponse
// @Failure 500 {object} utils.APIErrorResponse
// @Security BearerAuth
// @Router /tasks/{id} [delete]
func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Find task to delete
	var task models.Task
	result := config.DB.First(&task, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Task not found")
		return
	}
	
	// Check if user is authorized to delete this task
	if userRole != "admin" && task.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to delete this task")
		return
	}

	// Delete the task
	result = config.DB.Delete(&task)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to delete task")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task deleted successfully", nil)
}

// ToggleTaskCompletion toggles the completion status of a task
func ToggleTaskCompletion(c *gin.Context) {
	id := c.Param("id")
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.InternalServerErrorResponse(c, "User ID not found in context")
		return
	}
	
	userRole, _ := c.Get("user_role")
	
	// Find task to toggle
	var task models.Task
	result := config.DB.First(&task, id)
	if result.Error != nil {
		utils.NotFoundResponse(c, "Task not found")
		return
	}
	
	// Check if user is authorized to update this task
	if userRole != "admin" && task.UserID != userID.(uint) {
		utils.ForbiddenResponse(c, "You do not have permission to update this task")
		return
	}

	// Toggle completion status
	task.Completed = !task.Completed
	
	// Save updated task
	result = config.DB.Save(&task)
	if result.Error != nil {
		utils.InternalServerErrorResponse(c, "Failed to update task completion status")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task completion status updated successfully", task)
}
