// Package docs Mini CRM API Dokumentation
//
// Diese Dokumentation beschreibt alle API-Endpunkte des Mini CRM Systems.
// Die API unterstützt sowohl Web- als auch mobile Clients.
//
//     Schemes: http, https
//     Host: localhost:8081
//     BasePath: /api/v1
//     Version: 1.0.0
//     License: MIT http://opensource.org/licenses/MIT
//     Contact: Support<support@example.com>
//
//     Consumes:
//     - application/json
//
//     Produces:
//     - application/json
//
//     SecurityDefinitions:
//     Bearer:
//          type: apiKey
//          name: Authorization
//          in: header
//          description: Geben Sie den Token mit dem Präfix 'Bearer ' ein, z.B. "Bearer abcde12345".
//     ApiKey:
//          type: apiKey
//          name: X-API-Key
//          in: header
//          description: API-Schlüssel für mobile Anwendungen
//
// swagger:meta
package docs

// @title Mini CRM API
// @version 1.0
// @description API for Mini CRM System
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@example.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8081
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Enter the token with the `Bearer ` prefix, e.g. "Bearer abcde12345".

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name X-API-Key
// @description API key for mobile applications


