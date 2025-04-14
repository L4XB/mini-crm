package utils

import (
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

var (
	// Logger instance for the application
	Logger *logrus.Logger
)

// InitLogger initializes the logger for the application
func InitLogger() {
	Logger = logrus.New()
	Logger.SetOutput(os.Stdout)
	
	// Set log level based on environment
	logLevel := os.Getenv("LOG_LEVEL")
	switch logLevel {
	case "debug":
		Logger.SetLevel(logrus.DebugLevel)
	case "info":
		Logger.SetLevel(logrus.InfoLevel)
	case "warn":
		Logger.SetLevel(logrus.WarnLevel)
	case "error":
		Logger.SetLevel(logrus.ErrorLevel)
	default:
		Logger.SetLevel(logrus.InfoLevel)
	}
	
	// Set formatter
	Logger.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: time.RFC3339,
	})
	
	Logger.Info("Logger initialized")
}

// GetRequestLogFields returns standard log fields for HTTP requests
func GetRequestLogFields(c *gin.Context) logrus.Fields {
	// Get user ID from context if available
	userID, exists := c.Get("user_id")
	userIDValue := ""
	if exists {
		userIDValue = fmt.Sprintf("%v", userID)
	}
	
	// Return standardized fields
	return logrus.Fields{
		"method":     c.Request.Method,
		"path":       c.Request.URL.Path,
		"ip":         c.ClientIP(),
		"user_agent": c.Request.UserAgent(),
		"status":     c.Writer.Status(),
		"user_id":    userIDValue,
		"request_id": c.GetHeader("X-Request-ID"),
	}
}

// LogRequestInfo logs information about an incoming request
func LogRequestInfo(c *gin.Context, message string) {
	fields := GetRequestLogFields(c)
	Logger.WithFields(fields).Info(message)
}

// LogRequestError logs error information about a request
func LogRequestError(c *gin.Context, err error, message string) {
	fields := GetRequestLogFields(c)
	fields["error"] = err.Error()
	Logger.WithFields(fields).Error(message)
}

// LogRequestWarning logs warning information about a request
func LogRequestWarning(c *gin.Context, message string) {
	fields := GetRequestLogFields(c)
	Logger.WithFields(fields).Warn(message)
}

// LogRequestDebug logs debug information about a request
func LogRequestDebug(c *gin.Context, message string) {
	fields := GetRequestLogFields(c)
	Logger.WithFields(fields).Debug(message)
}
