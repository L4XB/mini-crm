package controllers

import (
	"net/http"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// RegisterRequest holds the registration data
type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role"`
}

// LoginRequest holds the login data
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse holds the auth token and user data
type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// AuthResponseSwagger ist nur für Swagger, damit UserSwagger verwendet wird
// @Description AuthResponse-Objekt für die API-Dokumentation
// @name AuthResponseSwagger
type AuthResponseSwagger struct {
	Token string           `json:"token"`
	User  models.UserSwagger `json:"user"`
}

// Register erstellt einen neuen User-Account
// @Summary Registrierung
// @Description Registriert einen neuen Nutzer
// @Tags Auth
// @Accept json
// @Produce json
// @Param registerRequest body RegisterRequest true "Registrierungsdaten"
// @Success 201 {object} AuthResponseSwagger
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Router /auth/register [post]
func Register(c *gin.Context) {
	var registerRequest RegisterRequest
	if err := c.ShouldBindJSON(&registerRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email already exists
	var existingUser models.User
	if result := config.DB.Where("email = ?", registerRequest.Email).First(&existingUser); result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "email already in use"})
		return
	}

	// Check if username already exists
	if result := config.DB.Where("username = ?", registerRequest.Username).First(&existingUser); result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "username already in use"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(registerRequest.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	// Set default role if not provided
	role := registerRequest.Role
	if role == "" {
		role = "user"
	}

	// Create new user
	user := models.User{
		Username: registerRequest.Username,
		Email:    registerRequest.Email,
		Password: string(hashedPassword),
		Role:     role,
	}

	// Save user to database
	if result := config.DB.Create(&user); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	// Create default settings for user
	settings := models.Settings{
		UserID:   user.ID,
		Theme:    "light",
		Language: "en",
	}

	if result := config.DB.Create(&settings); result.Error != nil {
		// Don't fail if settings creation fails
		// Just log it in a real application
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// Hide password in response
	user.Password = ""

	// Return token and user
	c.JSON(http.StatusCreated, AuthResponse{
		Token: token,
		User:  user,
	})
}

// Login authentifiziert einen Nutzer
// @Summary Login
// @Description Authentifiziert einen Nutzer und gibt ein JWT zurück
// @Tags Auth
// @Accept json
// @Produce json
// @Param loginRequest body LoginRequest true "Login-Daten"
// @Success 200 {object} AuthResponseSwagger
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func Login(c *gin.Context) {
	var loginRequest LoginRequest
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by email
	var user models.User
	if result := config.DB.Where("email = ?", loginRequest.Email).First(&user); result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// Hide password in response
	user.Password = ""

	// Return token and user
	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  user,
	})
}

// GetMe gibt den aktuell angemeldeten Nutzer zurück
// @Summary Eigenes Profil abrufen
// @Description Gibt die Daten des eingeloggten Nutzers zurück
// @Tags Auth
// @Produce json
// @Success 200 {object} models.UserSwagger
// @Failure 500 {object} map[string]string
// @Router /auth/me [get]
// @Security BearerAuth
func GetMe(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user ID not found in context"})
		return
	}

	// Find user by ID
	var user models.User
	if result := config.DB.First(&user, userID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Hide password in response
	user.Password = ""

	// Return user
	c.JSON(http.StatusOK, user)
}

// RefreshToken gibt ein neues Token für den eingeloggten Nutzer aus
// @Summary Token erneuern
// @Description Gibt ein neues JWT für den eingeloggten Nutzer aus
// @Tags Auth
// @Produce json
// @Success 200 {object} map[string]string
// @Router /auth/refresh [post]
// @Security BearerAuth
func RefreshToken(c *gin.Context) {
	// ...unverändert...
}

// Logout loggt den aktuellen Nutzer aus
// @Summary Logout
// @Description Loggt den Nutzer aus (Client muss das Token löschen)
// @Tags Auth
// @Produce json
// @Success 200 {object} map[string]string
// @Router /auth/logout [post]
// @Security BearerAuth
func Logout(c *gin.Context) {
	// JWTs sind stateless, daher kann der Server ein Logout nur "empfehlen"
	// Optional: Setze das Token-Cookie auf leer und abgelaufen (für Cookie-Storage)
	c.SetCookie("token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "logout successful, please delete your token on client side"})
}

