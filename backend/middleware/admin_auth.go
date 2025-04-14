package middleware

import (
	"net/http"
	"strings"

	"github.com/deinname/mini-crm-backend/models"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
)

// AdminAuthMiddleware überprüft, ob der Benutzer Admin-Rechte hat
func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Token aus dem Authorization-Header extrahieren
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Kein Authorization-Header vorhanden",
			})
			return
		}

		// "Bearer " aus dem Header entfernen
		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		// Token validieren
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Ungültiger Token: " + err.Error(),
			})
			return
		}

		// Überprüfen, ob der Benutzer Admin-Rechte hat
		if claims.Role != models.AdminRole {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "Keine Administratorrechte",
			})
			return
		}

		// UserID zur Verwendung in nachfolgenden Handlern speichern
		c.Set("user_id", claims.UserID)

		// Request weiterleiten
		c.Next()
	}
}
