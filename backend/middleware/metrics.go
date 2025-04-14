package middleware

import (
	"strconv"
	"sync"
	"time"

	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// Einmal initialisieren
	once sync.Once

	// HTTP-Anfrage-Metriken
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "mini_crm_http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)

	// HTTP-Latenzzähler
	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "mini_crm_http_request_duration_seconds",
			Help:    "Duration of HTTP requests in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	// Aktive Verbindungen
	httpRequestsInFlight = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "mini_crm_http_requests_in_flight",
			Help: "Current number of HTTP requests being processed",
		},
	)

	// API-Aufrufzähler pro Benutzer
	apiCallsPerUser = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "mini_crm_api_calls_per_user",
			Help: "Number of API calls per user",
		},
		[]string{"user_id", "endpoint"},
	)
)

// MetricsMiddleware zeichnet Metriken für alle API-Aufrufe auf
func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Ignoriere Metriken-Endpunkt selbst
		if c.Request.URL.Path == "/metrics" {
			c.Next()
			return
		}

		// Anfragedauer messen
		start := time.Now()

		// Zähle aktive Anfragen
		httpRequestsInFlight.Inc()
		defer httpRequestsInFlight.Dec()

		// Verarbeite die Anfrage
		c.Next()

		// Metriken nach der Verarbeitung aufzeichnen
		duration := time.Since(start).Seconds()
		statusCode := strconv.Itoa(c.Writer.Status())
		endpoint := c.FullPath()
		if endpoint == "" {
			endpoint = "unknown"
		}

		// Metriken aufzeichnen
		httpRequestsTotal.WithLabelValues(c.Request.Method, endpoint, statusCode).Inc()
		httpRequestDuration.WithLabelValues(c.Request.Method, endpoint).Observe(duration)

		// Benutzer-bezogene Metriken, falls verfügbar
		userID, exists := c.Get("user_id")
		if exists {
			userIDStr := strconv.FormatUint(uint64(userID.(uint)), 10)
			apiCallsPerUser.WithLabelValues(userIDStr, endpoint).Inc()
		}

		// Langsame Anfragen loggen (über 1 Sekunde)
		if duration > 1.0 {
			utils.LogRequestWarning(c, "Langsame API-Anfrage: "+endpoint+" ("+strconv.FormatFloat(duration, 'f', 2, 64)+"s)")
		}
	}
}
