package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
)

// APIKeyMiddleware verifies that requests from external applications include a valid API key
func APIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip API key check in development mode
		if os.Getenv("ENV") != "production" {
			c.Next()
			return
		}

		// Get API keys from environment variable
		apiKeys := os.Getenv("API_KEYS")
		if apiKeys == "" {
			utils.LogRequestWarning(c, "API_KEYS environment variable not set in production mode")
			c.Next()
			return
		}

		// Get API key from request header
		requestAPIKey := c.GetHeader("X-API-Key")
		if requestAPIKey == "" {
			// Allow API key as query parameter for easier mobile app integration
			requestAPIKey = c.Query("api_key")
		}

		// Skip check for login and registration endpoints
		if strings.HasPrefix(c.Request.URL.Path, "/api/v1/auth/login") || 
		   strings.HasPrefix(c.Request.URL.Path, "/api/v1/auth/register") {
			c.Next()
			return
		}

		// Skip API key check if JWT authentication is provided
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			c.Next()
			return
		}

		// If no API key provided, abort the request
		if requestAPIKey == "" {
			utils.LogRequestWarning(c, "API key missing in request")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "API key is required",
			})
			return
		}

		// Check if API key is valid
		validKeys := strings.Split(apiKeys, ",")
		valid := false
		for _, key := range validKeys {
			if strings.TrimSpace(key) == requestAPIKey {
				valid = true
				break
			}
		}

		if !valid {
			utils.LogRequestWarning(c, "Invalid API key provided")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Invalid API key",
			})
			return
		}

		// API key is valid, proceed
		c.Next()
	}
}
