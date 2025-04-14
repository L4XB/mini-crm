package routes

import (
	"github.com/gin-gonic/gin"
)

// SetupRouter initializes and configures the Gin router
func SetupRouter() *gin.Engine {
	// Initialize Gin router
	r := gin.Default()

	// Define routes
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to Mini CRM API",
		})
	})

	// Add more routes as needed...
	
	return r
}
