package middleware

import (
	"fmt"
	"time"

	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// LoggerMiddleware logs each incoming HTTP request
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		startTime := time.Now()
		
		// Set request ID for tracking
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
			c.Request.Header.Set("X-Request-ID", requestID)
			c.Writer.Header().Set("X-Request-ID", requestID)
		}
		
		// Log request information before handling
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery
		if raw != "" {
			path = path + "?" + raw
		}
		
		utils.LogRequestInfo(c, fmt.Sprintf("Incoming request: %s %s", c.Request.Method, path))
		
		// Process request
		c.Next()
		
		// Calculate request duration
		duration := time.Since(startTime)
		
		// Log response information after handling
		statusCode := c.Writer.Status()
		userID, _ := c.Get("user_id")
		
		if statusCode >= 400 {
			utils.Logger.WithFields(utils.GetRequestLogFields(c)).WithFields(map[string]interface{}{
				"duration_ms": duration.Milliseconds(),
				"errors":      c.Errors.Errors(),
			}).Warn(fmt.Sprintf("Request completed with error: %d", statusCode))
		} else {
			utils.Logger.WithFields(utils.GetRequestLogFields(c)).WithFields(map[string]interface{}{
				"duration_ms": duration.Milliseconds(),
				"user_id":     userID,
			}).Info(fmt.Sprintf("Request completed successfully: %d", statusCode))
		}
	}
}

// RequestSizeMiddleware limits the size of incoming requests
func RequestSizeMiddleware(maxSize int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > maxSize {
			utils.LogRequestWarning(c, fmt.Sprintf("Request size exceeded limit: %d > %d", c.Request.ContentLength, maxSize))
			c.AbortWithStatusJSON(413, gin.H{"error": "Request entity too large"})
			return
		}
		c.Next()
	}
}
