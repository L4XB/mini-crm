package routes

import (
	"net/http"
	"os"
	"strings"

	"github.com/deinname/mini-crm-backend/controllers"
	_ "github.com/deinname/mini-crm-backend/docs" // Swagger-Dokumentation importieren
	"github.com/deinname/mini-crm-backend/middleware"
	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter() *gin.Engine {
	// Verwende New() statt Default() um eigene Logger zu verwenden
	r := gin.New()

	// Recovery middleware für Panic-Handling
	r.Use(gin.Recovery())
	
	// Test-Modus für UI-Entwicklung (muss vor anderen Middlewares geladen werden)
	r.Use(middleware.TestModeMiddleware())
	
	// Logging-Middleware hinzufügen
	r.Use(middleware.LoggerMiddleware())
	
	// Metrics-Middleware für Monitoring
	r.Use(middleware.MetricsMiddleware())
	
	// Rate Limiter Middleware
	r.Use(middleware.RateLimiterMiddleware())
	
	// Anfragegröße begrenzen auf 10MB
	r.Use(middleware.RequestSizeMiddleware(10 * 1024 * 1024))

	// CORS configuration
	r.Use(middleware.CorsMiddleware())
	
	// API Key validation for external applications
	r.Use(middleware.APIKeyMiddleware())

	// Health check endpoint mit erweitertem Status
	r.GET("/health", func(c *gin.Context) {
		// Parameter für detaillierte Infos
		detailed := c.Query("detailed") == "true"
		
		// Health-Status abrufen
		status := utils.CheckHealth(detailed)

		
		// HTTP-Status basierend auf Gesundheitszustand
		httpStatus := http.StatusOK
		if status.Status == "error" {
			httpStatus = http.StatusServiceUnavailable
		}
		
		c.JSON(httpStatus, status)
	})
	
	// Einfacher Readiness-Check für Kubernetes/Docker
	r.GET("/ready", func(c *gin.Context) {
		// Schneller Check ohne detaillierte Infos
		status := utils.CheckHealth(false)
		
		if status.Status == "error" {
			c.AbortWithStatus(http.StatusServiceUnavailable)
			return
		}
		
		c.Status(http.StatusOK)
	})
	
	// Prometheus Metrics endpoint (nur für Admins zugänglich)
	if os.Getenv("ENV") == "production" {
		// In Produktion mit Admin-Token schützen
		r.GET("/metrics", middleware.AdminAuthMiddleware(), gin.WrapH(promhttp.Handler()))
	} else {
		// In Entwicklung mit Admin-Token schützen - kann für Tests ausgeschaltet werden
		if os.Getenv("OPEN_METRICS") == "true" {
			r.GET("/metrics", gin.WrapH(promhttp.Handler()))
		} else {
			r.GET("/metrics", middleware.AdminAuthMiddleware(), gin.WrapH(promhttp.Handler()))
		}
	}
	
	// Swagger-Dokumentation (nur in Entwicklungsumgebung oder auf Anfrage verfügbar)
	if os.Getenv("ENV") != "production" || os.Getenv("ENABLE_SWAGGER") == "true" {
		r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	// Setze Cache-Control header für bessere Performance
	r.Use(func(c *gin.Context) {
		// Set cache control headers - dynamische API-Daten sollten nicht gecached werden
		if !strings.HasPrefix(c.Request.URL.Path, "/assets/") && 
		   !strings.HasPrefix(c.Request.URL.Path, "/static/") {
			c.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
			c.Header("Pragma", "no-cache")
			c.Header("Expires", "0")
		}
		c.Next()
	})

	// Füge Security-Header hinzu
	r.Use(func(c *gin.Context) {
		// Sicherheitsheader für Webanwendung
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// Content-Security-Policy basierend auf Umgebung setzen
		if os.Getenv("ENV") == "production" {
			// Strengere CSP für Produktion
			c.Header("Content-Security-Policy", "default-src 'self'; connect-src 'self' https://api.yourdomain.com; img-src 'self' data:; style-src 'self' 'unsafe-inline';")
		} else {
			// Weniger streng für Entwicklung
			c.Header("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:;")
		}
		c.Next()
	})

	// API version group
	api := r.Group("/api/v1")

	// Public authentication routes
	auth := api.Group("/auth")
	{
		// Strengeres Rate-Limiting für Auth-Endpunkte
		auth.POST("/register", middleware.LoginRateLimiter(), controllers.Register)
		auth.POST("/login", middleware.LoginRateLimiter(), controllers.Login)
		auth.GET("/me", middleware.AuthMiddleware(), controllers.GetMe)
		auth.POST("/refresh", middleware.AuthMiddleware(), controllers.RefreshToken)
		
		// Spezielle Mobile-App-Endpunkte - optimiert für Flutter-Integration
		auth.POST("/mobile/login", middleware.LoginRateLimiter(), controllers.MobileLogin)
		auth.POST("/mobile/refresh", controllers.MobileRefreshToken)
	}

	// Protected routes
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// user Routes - Admin only except for own profile
		users := protected.Group("/users")
		{
			users.GET("/", controllers.GetUsers)
			users.GET("/:id", controllers.GetUser)
			users.POST("/", middleware.AdminMiddleware(), controllers.CreateUser)
			users.PUT("/:id", controllers.UpdateUser)
			users.DELETE("/:id", middleware.AdminMiddleware(), controllers.DeleteUser)

			// settings Routes
			users.GET("/:id/settings", controllers.GetUserSettings)
			users.PUT("/:id/settings", controllers.UpdateSettings)
		}

		// contact Routes
		contacts := protected.Group("/contacts")
		{
			contacts.POST("/", controllers.CreateContact)
			contacts.GET("/", controllers.GetContacts)
			contacts.GET("/:id", controllers.GetContact)
			contacts.PUT("/:id", controllers.UpdateContact)
			contacts.DELETE("/:id", controllers.DeleteContact)
		}

		// deal Routes
		deals := protected.Group("/deals")
		{
			deals.POST("/", controllers.CreateDeal)
			deals.GET("/", controllers.GetDeals)
			deals.GET("/:id", controllers.GetDeal)
			deals.PUT("/:id", controllers.UpdateDeal)
			deals.DELETE("/:id", controllers.DeleteDeal)
		}

		// note Routes
		notes := protected.Group("/notes")
		{
			notes.POST("/", controllers.CreateNote)
			notes.GET("/", controllers.GetNotes)
			notes.GET("/:id", controllers.GetNote)
			notes.PUT("/:id", controllers.UpdateNote)
			notes.DELETE("/:id", controllers.DeleteNote)
		}

		// task Routes
		tasks := protected.Group("/tasks")
		{
			tasks.POST("/", controllers.CreateTask)
			tasks.GET("/", controllers.GetTasks)
			tasks.GET("/:id", controllers.GetTask)
			tasks.PUT("/:id", controllers.UpdateTask)
			tasks.DELETE("/:id", controllers.DeleteTask)
			tasks.PATCH("/:id/toggle", controllers.ToggleTaskCompletion)
		}
	}

	// Set legacy routes for backward compatibility
	r.GET("/users", middleware.AuthMiddleware(), controllers.GetUsers)
	r.GET("/users/:id", middleware.AuthMiddleware(), controllers.GetUser)
	r.POST("/users", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.CreateUser)
	r.PUT("/users/:id", middleware.AuthMiddleware(), controllers.UpdateUser)
	r.DELETE("/users/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteUser)

	r.DELETE("/users/me", middleware.AuthMiddleware(), controllers.DeleteOwnAccount)
	
	r.GET("/users/:id/settings", middleware.AuthMiddleware(), controllers.GetUserSettings)
	r.PUT("/users/:id/settings", middleware.AuthMiddleware(), controllers.UpdateSettings)

	r.POST("/logout", middleware.AuthMiddleware(), controllers.Logout)

	r.POST("/contacts", middleware.AuthMiddleware(), controllers.CreateContact)
	r.GET("/contacts", middleware.AuthMiddleware(), controllers.GetContacts)
	r.GET("/contacts/:id", middleware.AuthMiddleware(), controllers.GetContact)
	r.PUT("/contacts/:id", middleware.AuthMiddleware(), controllers.UpdateContact)
	r.DELETE("/contacts/:id", middleware.AuthMiddleware(), controllers.DeleteContact)

	r.POST("/deals", middleware.AuthMiddleware(), controllers.CreateDeal)
	r.GET("/deals", middleware.AuthMiddleware(), controllers.GetDeals)
	r.GET("/deals/:id", middleware.AuthMiddleware(), controllers.GetDeal)
	r.PUT("/deals/:id", middleware.AuthMiddleware(), controllers.UpdateDeal)
	r.DELETE("/deals/:id", middleware.AuthMiddleware(), controllers.DeleteDeal)

	r.POST("/notes", middleware.AuthMiddleware(), controllers.CreateNote)
	r.GET("/notes", middleware.AuthMiddleware(), controllers.GetNotes)
	r.GET("/notes/:id", middleware.AuthMiddleware(), controllers.GetNote)
	r.PUT("/notes/:id", middleware.AuthMiddleware(), controllers.UpdateNote)
	r.DELETE("/notes/:id", middleware.AuthMiddleware(), controllers.DeleteNote)

	r.POST("/tasks", middleware.AuthMiddleware(), controllers.CreateTask)
	r.GET("/tasks", middleware.AuthMiddleware(), controllers.GetTasks)
	r.GET("/tasks/:id", middleware.AuthMiddleware(), controllers.GetTask)
	r.PUT("/tasks/:id", middleware.AuthMiddleware(), controllers.UpdateTask)
	r.DELETE("/tasks/:id", middleware.AuthMiddleware(), controllers.DeleteTask)
	r.PATCH("/tasks/:id/toggle", middleware.AuthMiddleware(), controllers.ToggleTaskCompletion)

	return r
}
