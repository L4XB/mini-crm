package controllers

import (
	"net/http"
	"time"

	"github.com/deinname/mini-crm-backend/config"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// MobileAuthResponse ist eine spezielle Antwortstruktur für mobile Clients
type MobileAuthResponse struct {
	Status       string      `json:"status"`
	Message      string      `json:"message"`
	User         models.User `json:"user"`
	Token        string      `json:"token"`
	RefreshToken string      `json:"refresh_token"`
	ExpiresIn    int64       `json:"expires_in"` // Ablaufzeit in Sekunden
}

// MobileLogin handhabt die Anmeldung von mobilen Apps (Flutter)
// Gibt zusätzlich ein Refresh-Token und die Ablaufzeit zurück
func MobileLogin(c *gin.Context) {
	var loginInput struct {
		Email      string `json:"email" binding:"required,email"`
		Password   string `json:"password" binding:"required"`
		DeviceInfo string `json:"device_info"` // Optionale Geräteinformation
	}

	if err := c.ShouldBindJSON(&loginInput); err != nil {
		utils.LogRequestWarning(c, "Mobiles Login fehlgeschlagen: Ungültige Eingabe")
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}

	// Benutzer in der Datenbank suchen
	var user models.User
	result := config.DB.Where("email = ?", loginInput.Email).First(&user)
	if result.Error != nil {
		// Verzögerung hinzufügen, um Timing-Angriffe zu vermeiden
		time.Sleep(time.Duration(300+time.Now().UnixNano()%500) * time.Millisecond)
		utils.LogRequestWarning(c, "Mobiles Login fehlgeschlagen: Benutzer nicht gefunden")
		utils.UnauthorizedResponse(c, "Ungültige E-Mail oder Passwort")
		return
	}

	// Passwort überprüfen
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginInput.Password))
	if err != nil {
		utils.LogRequestWarning(c, "Mobiles Login fehlgeschlagen: Falsches Passwort")
		utils.UnauthorizedResponse(c, "Ungültige E-Mail oder Passwort")
		return
	}

	// JWT Token generieren
	token, err := utils.GenerateToken(user)
	if err != nil {
		utils.LogRequestError(c, err, "Fehler beim Generieren des Tokens")
		utils.InternalServerErrorResponse(c, "Fehler beim Generieren des Tokens")
		return
	}

	// Refresh-Token generieren
	refreshToken, err := utils.GenerateRefreshToken(user)
	if err != nil {
		utils.LogRequestError(c, err, "Fehler beim Generieren des Refresh-Tokens")
		utils.InternalServerErrorResponse(c, "Fehler beim Generieren des Refresh-Tokens")
		return
	}

	// Benutzerinformationen für die Response bereinigen
	user.Password = ""

	// Log erfolgreichen Login
	utils.LogRequestInfo(c, "Mobiles Login erfolgreich")

	// Spezielle Mobile-Antwort senden
	c.JSON(http.StatusOK, MobileAuthResponse{
		Status:       "success",
		Message:      "Login erfolgreich",
		User:         user,
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    utils.GetTokenExpirationSeconds(),
	})
}

// MobileRefreshToken erneuert den JWT-Token für mobile Apps
func MobileRefreshToken(c *gin.Context) {
	var refreshInput struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&refreshInput); err != nil {
		utils.LogRequestWarning(c, "Mobile Token-Aktualisierung fehlgeschlagen: Ungültige Eingabe")
		utils.BadRequestResponse(c, utils.FormatValidationErrors(err))
		return
	}

	// Refresh-Token validieren
	userID, err := utils.ValidateRefreshToken(refreshInput.RefreshToken)
	if err != nil {
		utils.LogRequestWarning(c, "Mobile Token-Aktualisierung fehlgeschlagen: Ungültiger Refresh-Token")
		utils.UnauthorizedResponse(c, "Ungültiger Refresh-Token")
		return
	}

	// Benutzer abrufen
	var user models.User
	result := config.DB.First(&user, userID)
	if result.Error != nil {
		utils.LogRequestWarning(c, "Mobile Token-Aktualisierung fehlgeschlagen: Benutzer nicht gefunden")
		utils.UnauthorizedResponse(c, "Benutzer nicht gefunden")
		return
	}

	// Neuen JWT-Token generieren
	token, err := utils.GenerateToken(user)
	if err != nil {
		utils.LogRequestError(c, err, "Fehler beim Generieren des neuen Tokens")
		utils.InternalServerErrorResponse(c, "Fehler beim Generieren des Tokens")
		return
	}

	// Neuen Refresh-Token generieren
	newRefreshToken, err := utils.GenerateRefreshToken(user)
	if err != nil {
		utils.LogRequestError(c, err, "Fehler beim Generieren des neuen Refresh-Tokens")
		utils.InternalServerErrorResponse(c, "Fehler beim Generieren des Refresh-Tokens")
		return
	}

	// Benutzerinformationen für die Response bereinigen
	user.Password = ""

	// Log erfolgreiche Token-Aktualisierung
	utils.LogRequestInfo(c, "Mobile Token-Aktualisierung erfolgreich")

	// Spezielle Mobile-Antwort senden
	c.JSON(http.StatusOK, MobileAuthResponse{
		Status:       "success",
		Message:      "Token erfolgreich aktualisiert",
		User:         user,
		Token:        token,
		RefreshToken: newRefreshToken,
		ExpiresIn:    utils.GetTokenExpirationSeconds(),
	})
}
