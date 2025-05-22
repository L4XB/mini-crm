package controllers

import (
	"fmt"
	"net/http"
	"reflect"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GenericController bietet eine wiederverwendbare Implementierung für CRUD-Operationen
// für beliebige Modelle
type GenericController struct {
	DB             *gorm.DB
	ModelType      reflect.Type
	ModelName      string
	PreloadFields  []string
	AllowedFilters []string
}

// NewGenericController erstellt einen neuen generischen Controller
func NewGenericController(db *gorm.DB, modelType reflect.Type, preloadFields []string, allowedFilters []string) *GenericController {
	return &GenericController{
		DB:             db,
		ModelType:      modelType,
		ModelName:      modelType.Name(),
		PreloadFields:  preloadFields,
		AllowedFilters: allowedFilters,
	}
}

// Create erstellt eine neue Entität
func (gc *GenericController) Create() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Neues Modell-Objekt erstellen
		modelValue := reflect.New(gc.ModelType).Interface()

		// JSON-Daten binden
		if err := c.ShouldBindJSON(modelValue); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
			return
		}

		// Benutzer-ID aus dem Kontext setzen (falls vorhanden)
		userID, exists := c.Get("userID")
		if exists {
			// Versuchen, das UserID-Feld zu setzen, falls vorhanden
			v := reflect.ValueOf(modelValue).Elem()
			if field := v.FieldByName("UserID"); field.IsValid() && field.CanSet() {
				field.Set(reflect.ValueOf(userID))
			}
		}

		// In Datenbank speichern
		result := gc.DB.Create(modelValue)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"success": true, "data": modelValue})
	}
}

// GetAll gibt alle Entitäten zurück
func (gc *GenericController) GetAll() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Pagination Parameter
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		
		// Pagination validieren
		if page < 1 {
			page = 1
		}
		if limit < 1 || limit > 100 {
			limit = 10
		}
		
		offset := (page - 1) * limit

		// Slice für Ergebnisse erstellen
		sliceType := reflect.SliceOf(gc.ModelType)
		resultsValue := reflect.MakeSlice(sliceType, 0, 0)
		resultsPtr := reflect.New(resultsValue.Type())
		resultsPtr.Elem().Set(resultsValue)

		// Basis-Query erstellen
		query := gc.DB

		// Filterung anwenden
		for _, field := range gc.AllowedFilters {
			if value := c.Query(field); value != "" {
				query = query.Where(fmt.Sprintf("%s = ?", field), value)
			}
		}

		// Benutzer-ID Filter, falls notwendig (für Multitenancy)
		userID, exists := c.Get("userID")
		if exists {
			// Prüfen, ob das Modell ein UserID-Feld hat
			field, hasUserID := gc.ModelType.FieldByName("UserID")
			if hasUserID && field.Type.Kind() == reflect.Uint {
				query = query.Where("user_id = ?", userID)
			}
		}

		// Preloading anwenden
		for _, field := range gc.PreloadFields {
			query = query.Preload(field)
		}

		// Zählung für Pagination
		var total int64
		query.Model(reflect.New(gc.ModelType).Interface()).Count(&total)

		// Ergebnisse abrufen
		result := query.Limit(limit).Offset(offset).Find(resultsPtr.Interface())
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    resultsPtr.Elem().Interface(),
			"meta": gin.H{
				"page":  page,
				"limit": limit,
				"total": total,
				"pages": (total + int64(limit) - 1) / int64(limit),
			},
		})
	}
}

// GetByID gibt eine einzelne Entität anhand der ID zurück
func (gc *GenericController) GetByID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Ungültige ID"})
			return
		}

		// Modell-Instanz erstellen
		modelValue := reflect.New(gc.ModelType).Interface()

		// Query mit Preloading
		query := gc.DB
		for _, field := range gc.PreloadFields {
			query = query.Preload(field)
		}

		// Benutzer-ID Filter für Multitenancy
		userID, exists := c.Get("userID")
		if exists {
			// Prüfen, ob das Modell ein UserID-Feld hat
			field, hasUserID := gc.ModelType.FieldByName("UserID")
			if hasUserID && field.Type.Kind() == reflect.Uint {
				query = query.Where("user_id = ?", userID)
			}
		}

		// Daten abrufen
		result := query.First(modelValue, id)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Nicht gefunden"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": modelValue})
	}
}

// Update aktualisiert eine Entität
func (gc *GenericController) Update() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Ungültige ID"})
			return
		}

		// Bestehende Entität finden
		existingModel := reflect.New(gc.ModelType).Interface()
		
		// Benutzer-ID Filter für Multitenancy
		query := gc.DB
		userID, exists := c.Get("userID")
		if exists {
			// Prüfen, ob das Modell ein UserID-Feld hat
			field, hasUserID := gc.ModelType.FieldByName("UserID")
			if hasUserID && field.Type.Kind() == reflect.Uint {
				query = query.Where("user_id = ?", userID)
			}
		}
		
		if result := query.First(existingModel, id); result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Nicht gefunden"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": result.Error.Error()})
			return
		}

		// Update-Daten binden
		updateModel := reflect.New(gc.ModelType).Interface()
		if err := c.ShouldBindJSON(updateModel); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
			return
		}

		// Nur die angegebenen Felder aktualisieren
		if result := gc.DB.Model(existingModel).Updates(updateModel); result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": result.Error.Error()})
			return
		}

		// Aktualisierte Entität zurückgeben
		query = gc.DB
		for _, field := range gc.PreloadFields {
			query = query.Preload(field)
		}
		if err := query.First(existingModel, id).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": existingModel})
	}
}

// Delete löscht eine Entität
func (gc *GenericController) Delete() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Ungültige ID"})
			return
		}

		// Modell-Instanz erstellen
		modelValue := reflect.New(gc.ModelType).Interface()

		// Benutzer-ID Filter für Multitenancy
		query := gc.DB
		userID, exists := c.Get("userID")
		if exists {
			// Prüfen, ob das Modell ein UserID-Feld hat
			field, hasUserID := gc.ModelType.FieldByName("UserID")
			if hasUserID && field.Type.Kind() == reflect.Uint {
				query = query.Where("user_id = ?", userID)
			}
		}

		// Entität löschen
		result := query.Delete(modelValue, id)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": result.Error.Error()})
			return
		}

		// Prüfen, ob etwas gelöscht wurde
		if result.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Entität nicht gefunden"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": true})
	}
}
