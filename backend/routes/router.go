package routes

import (
	"github.com/deinname/mini-crm-backend/controllers"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// user Routes
	r.POST("/users", controllers.CreateUser)
	r.GET("/users", controllers.GetUsers)
	r.GET("/users/:id", controllers.GetUser)
	r.PUT("/users/:id", controllers.UpdateUser)
	r.DELETE("/users/:id", controllers.DeleteUser)

	// contact Routes
	r.POST("/contacts", controllers.CreateContact)
	r.GET("/contacts", controllers.GetContacts)
	r.GET("/contacts/:id", controllers.GetContact)
	r.PUT("/contacts/:id", controllers.UpdateContact)
	r.DELETE("/contacts/:id", controllers.DeleteContact)

	// deal Routes
	r.POST("/deals", controllers.CreateDeal)
	r.GET("/deals", controllers.GetDeals)
	r.GET("/deals/:id", controllers.GetDeal)
	r.PUT("/deals/:id", controllers.UpdateDeal)
	r.DELETE("/deals/:id", controllers.DeleteDeal)

	// note Routes
	r.POST("/notes", controllers.CreateNote)
	r.GET("/notes", controllers.GetNotes)
	r.GET("/notes/:id", controllers.GetNote)
	r.PUT("/notes/:id", controllers.UpdateNote)
	r.DELETE("/notes/:id", controllers.DeleteNote)

	// task Routes
	r.POST("/tasks", controllers.CreateTask)
	r.GET("/tasks", controllers.GetTasks)
	r.GET("/tasks/:id", controllers.GetTask)
	r.PUT("/tasks/:id", controllers.UpdateTask)
	r.DELETE("/tasks/:id", controllers.DeleteTask)
	r.PATCH("/tasks/:id/toggle", controllers.ToggleTaskCompletion)

	// settings Routes
	r.GET("/users/:user_id/settings", controllers.GetUserSettings)
	r.PUT("/users/:user_id/settings", controllers.UpdateSettings)

	return r
}
