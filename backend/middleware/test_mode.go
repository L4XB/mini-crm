package middleware

import (
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// TestModeMiddleware aktiviert spezielle Features für die UI-Entwicklung
func TestModeMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Nur in der Entwicklungsumgebung aktivieren
		if os.Getenv("ENV") != "development" {
			c.Next()
			return
		}

		// UI-Testmodus aktiviert?
		if os.Getenv("UI_TEST_MODE") != "true" {
			c.Next()
			return
		}

		// Zusätzliche Debug-Header für UI-Entwicklung
		c.Header("X-Test-Mode", "enabled")

		// CORS für Entwicklungsserver anpassen
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		
		// Im Testmodus mehr Origins erlauben
		if origin != "" && (allowedOrigins == "*" || strings.Contains(allowedOrigins, origin)) {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Max-Age", "86400") // 24 Stunden
		}

		// Verzögerung für API-Antworten simulieren, wenn gewünscht
		if delay := os.Getenv("UI_TEST_DELAY_MS"); delay != "" {
			// Implementierung der Verzögerung...
		}

		// Automatische Authentifizierung für Tests ermöglichen
		if os.Getenv("DISABLE_AUTH_FOR_TESTS") == "true" {
			// Automatische Admin-Authentifizierung
			c.Set("user_id", uint(1))  // Admin-Benutzer-ID
			c.Set("role", "admin")
			
			if !c.IsAborted() {
				log.Println("[TEST-MODE] Auth automatisch für Anfrage aktiviert: " + c.Request.URL.Path)
			}
		}

		c.Next()
	}
}
