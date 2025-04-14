package routes

import (
	"github.com/deinname/mini-crm-backend/controllers"
	"github.com/deinname/mini-crm-backend/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS configuration
	r.Use(middleware.CorsMiddleware())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API version group
	api := r.Group("/api/v1")

	// Public authentication routes
	auth := api.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
		auth.GET("/me", middleware.AuthMiddleware(), controllers.GetMe)
		auth.POST("/refresh", middleware.AuthMiddleware(), controllers.RefreshToken)
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
	
	r.GET("/users/:id/settings", middleware.AuthMiddleware(), controllers.GetUserSettings)
	r.PUT("/users/:id/settings", middleware.AuthMiddleware(), controllers.UpdateSettings)

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
