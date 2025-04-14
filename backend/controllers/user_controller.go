package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// CreateUser legt einen neuen Nutzer an (nur Admin)
// @Summary Nutzer anlegen
// @Description Legt einen neuen Nutzer an (nur Admin)
// @Tags User
// @Accept json
// @Produce json
// @Param user body models.User true "Nutzer-Daten"
// @Success 201 {object} models.UserSwagger
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Router /users [post]
// @Security BearerAuth
func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email already exists
	var existingUser models.User
	if result := config.DB.Where("email = ?", user.Email).First(&existingUser); result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "email already in use"})
		return
	}

	// Check if username already exists
	if result := config.DB.Where("username = ?", user.Username).First(&existingUser); result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "username already in use"})
		return
	}

	// Hash password if provided
	if user.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
			return
		}
		user.Password = string(hashedPassword)
	} else {
		// Generate a random default password if none provided
		defaultPassword := "changeme" + strconv.FormatInt(time.Now().Unix(), 10)
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
		user.Password = string(hashedPassword)
	}

	// Save user to database
	result := config.DB.Create(&user)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	// Create default settings for user
	settings := models.Settings{
		UserID:   user.ID,
		Theme:    "light",
		Language: "en",
	}
	config.DB.Create(&settings)

	c.JSON(http.StatusCreated, user)
}

// GetUsers gibt alle Nutzer zurück (Admin) oder nur sich selbst (User)
// @Summary Nutzer auflisten
// @Description Gibt alle Nutzer (Admin) oder nur den eigenen Account (User) zurück
// @Tags User
// @Produce json
// @Success 200 {array} models.UserSwagger
// @Router /users [get]
// @Security BearerAuth
func GetUsers(c *gin.Context) {
	var users []models.User
	
	// Get user role from context
	role, exists := c.Get("user_role")
	userID, userExists := c.Get("user_id")
	
	if !exists || !userExists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user information not found in context"})
		return
	}
	
	// Non-admins can only see themselves
	if role != "admin" {
		config.DB.Where("id = ?", userID).Find(&users)
	} else {
		// Admins can see all users
		config.DB.Find(&users)
	}

	c.JSON(http.StatusOK, users)
}

// GetUser gibt einen bestimmten Nutzer anhand der ID zurück
// @Summary Nutzer abrufen
// @Description Gibt einen bestimmten Nutzer anhand der ID zurück (User nur sich selbst, Admin alle)
// @Tags User
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/{id} [get]
// @Security BearerAuth
func GetUser(c *gin.Context) {
	id := c.Param("id")
	
	// Get user role and ID from context
	role, exists := c.Get("user_role")
	currentUserID, userExists := c.Get("user_id")
	
	if !exists || !userExists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user information not found in context"})
		return
	}
	
	// Convert string ID to uint for comparison
	requestedID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}
	
	// Non-admins can only see their own profile
	if role != "admin" && uint(requestedID) != currentUserID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only view your own profile"})
		return
	}
	
	var user models.User
	result := config.DB.Preload("Settings").First(&user, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateUser aktualisiert einen Nutzer (User nur sich selbst, Admin alle)
// @Summary Nutzer aktualisieren
// @Description Aktualisiert einen Nutzer (User nur sich selbst, Admin alle)
// @Tags User
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param user body models.User true "Nutzer-Daten"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/{id} [put]
// @Security BearerAuth
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	
	// Get user role and ID from context
	role, exists := c.Get("user_role")
	currentUserID, userExists := c.Get("user_id")
	
	if !exists || !userExists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user information not found in context"})
		return
	}
	
	// Convert string ID to uint for comparison
	requestedID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}
	
	// Non-admins can only update their own profile
	if role != "admin" && uint(requestedID) != currentUserID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only update your own profile"})
		return
	}
	
	// Get existing user
	var user models.User
	result := config.DB.First(&user, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	
	// Store original values to check for changes
	originalEmail := user.Email
	originalUsername := user.Username
	
	// Get update data
	var updateData struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Check for email uniqueness if changed
	if updateData.Email != "" && updateData.Email != originalEmail {
		var existingUser models.User
		if result := config.DB.Where("email = ? AND id != ?", updateData.Email, id).First(&existingUser); result.Error == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "email already in use"})
			return
		}
		user.Email = updateData.Email
	}
	
	// Check for username uniqueness if changed
	if updateData.Username != "" && updateData.Username != originalUsername {
		var existingUser models.User
		if result := config.DB.Where("username = ? AND id != ?", updateData.Username, id).First(&existingUser); result.Error == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "username already in use"})
			return
		}
		user.Username = updateData.Username
	}
	
	// Update password if provided
	if updateData.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updateData.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
			return
		}
		user.Password = string(hashedPassword)
	}
	
	// Save updated user
	config.DB.Save(&user)
	c.JSON(http.StatusOK, user)
}

// DeleteOwnAccount löscht den eigenen Account und alle zugehörigen Daten
// @Summary Eigenen Account löschen
// @Description Löscht den eigenen Account und alle zugehörigen Daten
// @Tags User
// @Produce json
// @Success 200 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/me [delete]
// @Security BearerAuth
func DeleteOwnAccount(c *gin.Context) {
	currentUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user information not found in context"})
		return
	}

	// Hole User aus der DB
	var user models.User
	if result := config.DB.First(&user, currentUserID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Lösche alle zugehörigen Daten (Contacts, Deals, Tasks, Notes, Settings)
	tx := config.DB.Begin()
	tx.Where("user_id = ?", currentUserID).Delete(&models.Contact{})
	tx.Where("user_id = ?", currentUserID).Delete(&models.Deal{})
	tx.Where("user_id = ?", currentUserID).Delete(&models.Task{})
	tx.Where("user_id = ?", currentUserID).Delete(&models.Note{})
	tx.Where("user_id = ?", currentUserID).Delete(&models.Settings{})
	tx.Delete(&user)
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete user and related data"})
		return
	}

	// Optional: Cookie löschen
	c.SetCookie("token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "your account and all related data have been deleted"})
}

// DeleteUser löscht einen Nutzer (nur Admin)
// @Summary Nutzer löschen
// @Description Löscht einen Nutzer und alle zugehörigen Daten (nur Admin)
// @Tags User
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/{id} [delete]
// @Security BearerAuth
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	
	// Get user ID from context to prevent self-deletion
	currentUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user information not found in context"})
		return
	}
	
	// Convert string ID to uint for comparison
	requestedID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}
	
	// Prevent admin from deleting themselves
	if uint(requestedID) == currentUserID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "you cannot delete your own account"})
		return
	}
	
	// Check if user exists
	var user models.User
	result := config.DB.First(&user, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Delete user with cascade delete for associated records
	tx := config.DB.Begin()
	
	// Delete related settings
	tx.Where("user_id = ?", id).Delete(&models.Settings{})
	
	// Delete related contacts
	tx.Where("user_id = ?", id).Delete(&models.Contact{})
	
	// Delete related deals
	tx.Where("user_id = ?", id).Delete(&models.Deal{})
	
	// Delete related tasks
	tx.Where("user_id = ?", id).Delete(&models.Task{})
	
	// Delete related notes
	tx.Where("user_id = ?", id).Delete(&models.Note{})
	
	// Finally delete the user
	tx.Delete(&user)
	
	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete user and related data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "user and related data deleted successfully"})
}
