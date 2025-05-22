package routes

import (
	"github.com/deinname/mini-crm-backend/controllers"
	"github.com/deinname/mini-crm-backend/middleware"
	"github.com/deinname/mini-crm-backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"reflect"
)

// RegisterDynamicRoutes registriert dynamische Routen für alle Modelle in der Registry
func RegisterDynamicRoutes(router *gin.Engine, db *gorm.DB) {
	api := router.Group("/api/v1")

	// Schema-Endpunkte für die SDK
	schema := api.Group("/schema")
	{
		schema.GET("/", controllers.GetAllModelSchemas)
		schema.GET("/:model", controllers.GetModelSchema)
	}

	// Geschützte Routen für dynamische Modelle
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())

	// Dynamische Routen für registrierte Modelle
	registry := models.GetRegistry()
	for name, modelDef := range registry.GetModels() {
		// Basispfad für das Modell
		basePath := protected.Group("/" + name)

		// Nur autorisierte Benutzer oder Admin-Prüfung
		if modelDef.RequiresAdmin {
			basePath.Use(middleware.AdminMiddleware())
		}

		// Generischen Controller erstellen
		gc := controllers.NewGenericController(
			db,
			modelDef.ModelType,
			modelDef.PreloadFields,
			modelDef.AllowedFilters,
		)

		// Standard CRUD-Routen registrieren
		basePath.POST("/", gc.Create())
		basePath.GET("/", gc.GetAll())
		basePath.GET("/:id", gc.GetByID())
		basePath.PUT("/:id", gc.Update())
		basePath.DELETE("/:id", gc.Delete())

		// Benutzerdefinierte Endpunkte registrieren
		for _, endpoint := range modelDef.CustomEndpoints {
			// Handler extrahieren
			handlerFunc, ok := endpoint.Handler.(func(*gin.Context))
			if !ok {
				// Versuchen, mit Reflection zu konvertieren
				handlerValue := reflect.ValueOf(endpoint.Handler)
				if handlerValue.Kind() != reflect.Func {
					continue
				}
				
				// Gin-Handler erstellen
				wrapper := func(c *gin.Context) {
					handlerValue.Call([]reflect.Value{reflect.ValueOf(c)})
				}
				
				// Route registrieren
				switch endpoint.Method {
				case "GET":
					basePath.GET(endpoint.Path, wrapper)
				case "POST":
					basePath.POST(endpoint.Path, wrapper)
				case "PUT":
					basePath.PUT(endpoint.Path, wrapper)
				case "DELETE":
					basePath.DELETE(endpoint.Path, wrapper)
				case "PATCH":
					basePath.PATCH(endpoint.Path, wrapper)
				}
			} else {
				// Direkt als Gin-Handler registrieren
				switch endpoint.Method {
				case "GET":
					basePath.GET(endpoint.Path, handlerFunc)
				case "POST":
					basePath.POST(endpoint.Path, handlerFunc)
				case "PUT":
					basePath.PUT(endpoint.Path, handlerFunc)
				case "DELETE":
					basePath.DELETE(endpoint.Path, handlerFunc)
				case "PATCH":
					basePath.PATCH(endpoint.Path, handlerFunc)
				}
			}
		}
	}
}
