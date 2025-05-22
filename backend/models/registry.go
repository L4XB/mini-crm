package models

import (
	"fmt"
	"log"
	"reflect"
	"sync"

	"gorm.io/gorm"
)

// ModelDefinition enthält Metadaten zu einem registrierten Modell
type ModelDefinition struct {
	ModelType       reflect.Type
	TableName       string
	Fields          []FieldDefinition
	Relations       []RelationDefinition
	PreloadFields   []string
	AllowedFilters  []string
	RequiresAuth    bool
	RequiresAdmin   bool
	CustomEndpoints []CustomEndpointDefinition
}

// FieldDefinition beschreibt ein Feld in einem Modell
type FieldDefinition struct {
	Name     string
	Type     string
	Required bool
	Unique   bool
	Label    string
	Min      *float64
	Max      *float64
	Options  []string
	Help     string
}

// RelationDefinition beschreibt eine Relation zwischen Modellen
type RelationDefinition struct {
	Name       string
	Type       string // "hasOne", "hasMany", "belongsTo", "manyToMany"
	TargetModel string
	ForeignKey string
}

// CustomEndpointDefinition beschreibt einen benutzerdefinierten API-Endpunkt
type CustomEndpointDefinition struct {
	Path        string
	Method      string
	Description string
	Handler     interface{}
}

// ModelRegistry verwaltet alle registrierten Modelle
type ModelRegistry struct {
	mu          sync.RWMutex
	models      map[string]*ModelDefinition
	db          *gorm.DB
	initialized bool
}

// globale Registry-Instanz
var globalRegistry *ModelRegistry
var once sync.Once

// GetRegistry gibt die globale ModelRegistry-Instanz zurück
func GetRegistry() *ModelRegistry {
	once.Do(func() {
		globalRegistry = &ModelRegistry{
			models: make(map[string]*ModelDefinition),
		}
	})
	return globalRegistry
}

// SetDB setzt die Datenbankverbindung
func (r *ModelRegistry) SetDB(db *gorm.DB) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.db = db
}

// RegisterModel registriert ein neues Modell in der Registry
func (r *ModelRegistry) RegisterModel(model interface{}, preloadFields, allowedFilters []string, requiresAuth, requiresAdmin bool) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	modelType := reflect.TypeOf(model)
	if modelType.Kind() == reflect.Ptr {
		modelType = modelType.Elem()
	}

	if modelType.Kind() != reflect.Struct {
		return fmt.Errorf("model muss eine Struktur sein")
	}

	modelName := modelType.Name()
	if _, exists := r.models[modelName]; exists {
		return fmt.Errorf("model %s ist bereits registriert", modelName)
	}

	// Felder analysieren
	fields := extractFieldDefinitions(modelType)

	// Relationen analysieren (kann erweitert werden)
	relations := []RelationDefinition{}

	// Modell in Registry speichern
	r.models[modelName] = &ModelDefinition{
		ModelType:      modelType,
		TableName:      getTableName(model),
		Fields:         fields,
		Relations:      relations,
		PreloadFields:  preloadFields,
		AllowedFilters: allowedFilters,
		RequiresAuth:   requiresAuth,
		RequiresAdmin:  requiresAdmin,
	}

	log.Printf("Modell %s registriert mit %d Feldern", modelName, len(fields))
	return nil
}

// GetModel gibt ein registriertes Modell zurück
func (r *ModelRegistry) GetModel(name string) (*ModelDefinition, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	model, exists := r.models[name]
	if !exists {
		return nil, fmt.Errorf("model %s ist nicht registriert", name)
	}
	return model, nil
}

// GetModels gibt alle registrierten Modelle zurück
func (r *ModelRegistry) GetModels() map[string]*ModelDefinition {
	r.mu.RLock()
	defer r.mu.RUnlock()

	// Kopie der Modelle erstellen
	models := make(map[string]*ModelDefinition, len(r.models))
	for name, model := range r.models {
		models[name] = model
	}
	return models
}

// RegisterCustomEndpoint registriert einen benutzerdefinierten Endpunkt für ein Modell
func (r *ModelRegistry) RegisterCustomEndpoint(modelName, path, method, description string, handler interface{}) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	model, exists := r.models[modelName]
	if !exists {
		return fmt.Errorf("model %s ist nicht registriert", modelName)
	}

	endpoint := CustomEndpointDefinition{
		Path:        path,
		Method:      method,
		Description: description,
		Handler:     handler,
	}

	model.CustomEndpoints = append(model.CustomEndpoints, endpoint)
	return nil
}

// InitializeTables erstellt alle Tabellen für registrierte Modelle
func (r *ModelRegistry) InitializeTables() error {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if r.db == nil {
		return fmt.Errorf("keine Datenbankverbindung vorhanden")
	}

	for name, model := range r.models {
		// Modell-Instanz erstellen
		modelInstance := reflect.New(model.ModelType).Interface()
		
		// Tabelle migrieren
		if err := r.db.AutoMigrate(modelInstance); err != nil {
			return fmt.Errorf("fehler bei der Migration von %s: %v", name, err)
		}
		
		log.Printf("Tabelle für %s erstellt/migriert", name)
	}
	
	r.initialized = true
	return nil
}

// Hilfsfunktionen

// extractFieldDefinitions extrahiert Felddefinitionen aus einem Strukturtyp
func extractFieldDefinitions(modelType reflect.Type) []FieldDefinition {
	fields := make([]FieldDefinition, 0)

	for i := 0; i < modelType.NumField(); i++ {
		field := modelType.Field(i)
		
		// Ignoriere nicht-exportierte Felder
		if field.PkgPath != "" {
			continue
		}
		
		// Ignoriere gorm.Model Felder für die Darstellung
		if field.Name == "Model" && field.Type.Name() == "Model" && field.Type.PkgPath() == "gorm.io/gorm" {
			continue
		}

		fieldDef := FieldDefinition{
			Name:     field.Name,
			Type:     getFieldType(field.Type),
			Required: field.Tag.Get("binding") == "required",
			Unique:   field.Tag.Get("gorm") == "unique",
			Label:    field.Tag.Get("label"),
			Help:     field.Tag.Get("help"),
		}

		// Wenn kein Label gesetzt, den Feldnamen verwenden
		if fieldDef.Label == "" {
			fieldDef.Label = field.Name
		}

		fields = append(fields, fieldDef)
	}

	return fields
}

// getFieldType gibt den Typ eines Feldes als String zurück
func getFieldType(t reflect.Type) string {
	switch t.Kind() {
	case reflect.String:
		return "string"
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return "integer"
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return "integer"
	case reflect.Float32, reflect.Float64:
		return "number"
	case reflect.Bool:
		return "boolean"
	case reflect.Struct:
		if t.Name() == "Time" && t.PkgPath() == "time" {
			return "datetime"
		}
		return "object"
	case reflect.Slice, reflect.Array:
		return "array"
	case reflect.Ptr:
		return getFieldType(t.Elem())
	default:
		return "string"
	}
}

// getTableName gibt den Tabellennamen eines Modells zurück
func getTableName(model interface{}) string {
	// Versuchen, TableName-Methode aufzurufen, falls vorhanden
	if tabler, ok := model.(interface{ TableName() string }); ok {
		return tabler.TableName()
	}
	
	// Ansonsten den Strukturnamen verwenden
	t := reflect.TypeOf(model)
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	return t.Name()
}
