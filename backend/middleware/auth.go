package middleware

import (
	"net/http"
	"strings"

	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware protects routes with JWT authentication
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header is required"})
			c.Abort()
			return
		}

		// Check if it's a Bearer token
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format, must be Bearer {token}"})
			c.Abort()
			return
		}

		// Extract token from header
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Validate token
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			c.Abort()
			return
		}

		// Store user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)

		c.Next()
	}
}

// AdminMiddleware checks if the user has admin role
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// First run the auth middleware
		AuthMiddleware()(c)
		if c.IsAborted() {
			return
		}

		// Get user role from context
		role, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "user role not found in context"})
			c.Abort()
			return
		}

		// Check if user is admin
		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// OwnershipMiddleware validates that users can only access their own resources
func OwnershipMiddleware(resourceType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// First run the auth middleware
		AuthMiddleware()(c)
		if c.IsAborted() {
			return
		}

		// Get user id from context
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "user ID not found in context"})
			c.Abort()
			return
		}

		// Get resource userID from query params for GET requests on collections
		if c.Request.Method == "GET" && !strings.Contains(c.FullPath(), "/:id") {
			// For collection endpoints, we'll just check the filter
			requestedUserID := c.Query("user_id")
			if requestedUserID != "" && requestedUserID != "0" && requestedUserID != userID.(string) {
				// Don't allow filtering by other users' data
				role, _ := c.Get("user_role")
				if role != "admin" {
					c.JSON(http.StatusForbidden, gin.H{"error": "you can only access your own resources"})
					c.Abort()
					return
				}
			}
			// If no filter, we'll filter in the controller
			c.Next()
			return
		}

		// Admin can access all resources
		role, _ := c.Get("user_role")
		if role == "admin" {
			c.Next()
			return
		}

		// For specific resource requests, we'll check ownership in the controller
		// Set a flag in context that controllers should check ownership
		c.Set("check_ownership", true)
		c.Next()
	}
}
