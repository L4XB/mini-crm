package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// CorsMiddleware handles CORS (Cross-Origin Resource Sharing)
func CorsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get allowed origins from environment variable or use default
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			allowedOrigins = "*" // Default to all origins in development
		}

		// Get request origin
		origin := c.Request.Header.Get("Origin")

		// Check if the origin is in our allowed list
		allowed := false
		if allowedOrigins == "*" {
			allowed = true
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		} else {
			// Check if the origin is in our comma-separated list
			originList := strings.Split(allowedOrigins, ",")
			for _, allowedOrigin := range originList {
				allowedOrigin = strings.TrimSpace(allowedOrigin)
				// Special handling for capacitor/cordova apps
				if (allowedOrigin == "capacitor://localhost" || 
					allowedOrigin == "ionic://localhost" || 
					allowedOrigin == "localhost") && 
					(strings.HasPrefix(origin, "capacitor://") || 
					strings.HasPrefix(origin, "ionic://") || 
					origin == "file://") {
					allowed = true
					break
				}
				
				// Normal origin matching
				if allowedOrigin == origin {
					allowed = true
					break
				}
			}
			
			// Set the specific origin if it's allowed
			if allowed && origin != "" {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			}
		}

		// Set other CORS headers
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-Request-ID")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours for caching preflight

		// Handle OPTIONS method (preflight requests)
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
