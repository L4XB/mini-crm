package utils

import (
	"fmt"
	"os"
	"time"

	"github.com/deinname/mini-crm-backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// InitTestData initialisiert die Testdaten-Funktion, die bei App-Start aufgerufen werden kann
func InitTestData() func(db *gorm.DB) error {
	// Funktion zurückgeben, die später mit DB aufgerufen werden kann
	return func(db *gorm.DB) error {
	// Nur wenn im Testmodus aktiviert
	if os.Getenv("ENV") != "development" || os.Getenv("SEED_TEST_DATA") != "true" {
		return nil
	}

	Logger.Info("Initialisiere Testdaten für UI-Entwicklung")

	// Prüfen, ob bereits Daten existieren
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		Logger.Info("Testdaten existieren bereits, überspringe Initialisierung")
		return nil
	}

	// 1. Administrator anlegen
	adminEmail := os.Getenv("UI_TEST_USER")
	if adminEmail == "" {
		adminEmail = "admin@example.com"
	}

	adminPassword := os.Getenv("UI_TEST_PASSWORD")
	if adminPassword == "" {
		adminPassword = "test1234"
	}

	// Passwort hashen
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("fehler beim Hashen des Admin-Passworts: %w", err)
	}

	admin := models.User{
		Username: "admin",
		Email:    adminEmail,
		Password: string(hashedPassword),
		Role:     models.AdminRole,
		Settings: models.Settings{
			Theme:    "dark",
			Language: "de",
		},
	}

	result := db.Create(&admin)
	if result.Error != nil {
		return fmt.Errorf("fehler beim Erstellen des Admin-Benutzers: %w", result.Error)
	}

	// 2. Normalen Benutzer anlegen
	hashedUserPassword, _ := bcrypt.GenerateFromPassword([]byte("user1234"), bcrypt.DefaultCost)
	user := models.User{
		Username: "testuser",
		Email:    "user@example.com",
		Password: string(hashedUserPassword),
		Role:     models.UserRole,
		Settings: models.Settings{
			Theme:    "light",
			Language: "en",
		},
	}

	result = db.Create(&user)
	if result.Error != nil {
		return fmt.Errorf("fehler beim Erstellen des Test-Benutzers: %w", result.Error)
	}

	// 3. Beispielkontakte anlegen
	contacts := []models.Contact{
		{
			FirstName:    "Max",
			LastName:     "Mustermann",
			Email:        "max@example.com",
			Phone:        "+49123456789",
			Position:     "CEO",
			Company:      "Musterfirma GmbH",
			UserID:       admin.ID,
			ContactStage: "Lead",
		},
		{
			FirstName:    "Erika",
			LastName:     "Musterfrau",
			Email:        "erika@example.com",
			Phone:        "+49987654321",
			Position:     "CTO",
			Company:      "Techfirma AG",
			UserID:       admin.ID,
			ContactStage: "Customer",
		},
		{
			FirstName:    "John",
			LastName:     "Doe",
			Email:        "john@example.com",
			Phone:        "+1234567890",
			Position:     "Manager",
			Company:      "Example Corp",
			UserID:       user.ID,
			ContactStage: "Lead",
		},
	}

	for _, contact := range contacts {
		result = db.Create(&contact)
		if result.Error != nil {
			return fmt.Errorf("fehler beim Erstellen der Kontakte: %w", result.Error)
		}
	}

	// 4. Beispiel-Deals erstellen
	deals := []models.Deal{
		{
			Title:        "Softwarelizenz",
			Description:  "Verkauf von 10 Softwarelizenzen",
			Value:        10000.00,
			Status:       "In Verhandlung",
			ContactID:    1,
			UserID:       admin.ID,
			ExpectedDate: time.Now().AddDate(0, 1, 0),
		},
		{
			Title:        "Beratungsprojekt",
			Description:  "3-monatiges Beratungsprojekt",
			Value:        25000.00,
			Status:       "Gewonnen",
			ContactID:    2,
			UserID:       admin.ID,
			ExpectedDate: time.Now().AddDate(0, 0, 15),
		},
		{
			Title:        "Hardware-Beschaffung",
			Description:  "Beschaffung von 20 Laptops",
			Value:        15000.00,
			Status:       "Anfrage",
			ContactID:    3,
			UserID:       user.ID,
			ExpectedDate: time.Now().AddDate(0, 2, 0),
		},
	}

	for _, deal := range deals {
		result = db.Create(&deal)
		if result.Error != nil {
			return fmt.Errorf("fehler beim Erstellen der Deals: %w", result.Error)
		}
	}

	// 5. Notizen erstellen
	notes := []models.Note{
		{
			Content:   "Kunde interessiert an Premium-Paket",
			ContactID: 1,
			UserID:    admin.ID,
			DealID:    1,
		},
		{
			Content:   "Nächstes Meeting am 15.05.",
			ContactID: 2,
			UserID:    admin.ID,
		},
		{
			Content:   "Vertragsentwurf gesendet",
			ContactID: 2,
			UserID:    admin.ID,
			DealID:    2,
		},
		{
			Content:   "Braucht Angebot bis Ende des Monats",
			ContactID: 3,
			UserID:    user.ID,
			DealID:    3,
		},
	}

	for _, note := range notes {
		result = db.Create(&note)
		if result.Error != nil {
			return fmt.Errorf("fehler beim Erstellen der Notizen: %w", result.Error)
		}
	}

	// 6. Aufgaben erstellen
	tasks := []models.Task{
		{
			Title:     "Angebot senden",
			Details:   "Detailliertes Angebot für Softwarelizenzen erstellen",
			DueDate:   time.Now().AddDate(0, 0, 3),
			Completed: false,
			UserID:    admin.ID,
			DealID:    1,
		},
		{
			Title:     "Vertrag erstellen",
			Details:   "Rechtliche Prüfung des Vertrags",
			DueDate:   time.Now().AddDate(0, 0, 5),
			Completed: true,
			UserID:    admin.ID,
			DealID:    2,
		},
		{
			Title:     "Preisverhandlung",
			Details:   "Bessere Konditionen für Hardware aushandeln",
			DueDate:   time.Now().AddDate(0, 0, 10),
			Completed: false,
			UserID:    user.ID,
			DealID:    3,
		},
	}

	for _, task := range tasks {
		result = db.Create(&task)
		if result.Error != nil {
			return fmt.Errorf("fehler beim Erstellen der Aufgaben: %w", result.Error)
		}
	}

		Logger.Info("Testdaten erfolgreich initialisiert")
		return nil
	}
}
