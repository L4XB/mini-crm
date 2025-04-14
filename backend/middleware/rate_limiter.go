package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/deinname/mini-crm-backend/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// IPRateLimiter implements a rate limiter per IP address
type IPRateLimiter struct {
	ips    map[string]*rate.Limiter
	mu     *sync.RWMutex
	rate   rate.Limit
	burst  int
	expiry time.Duration
	lastSeen map[string]time.Time
}

// NewIPRateLimiter creates a new rate limiter for IP addresses
func NewIPRateLimiter(r rate.Limit, burst int, expiry time.Duration) *IPRateLimiter {
	return &IPRateLimiter{
		ips:    make(map[string]*rate.Limiter),
		mu:     &sync.RWMutex{},
		rate:   r,
		burst:  burst,
		expiry: expiry,
		lastSeen: make(map[string]time.Time),
	}
}

// GetLimiter returns the rate limiter for a specific IP address
func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	// Update last seen time for this IP
	i.lastSeen[ip] = time.Now()

	// Create a new rate limiter if it doesn't exist
	limiter, exists := i.ips[ip]
	if !exists {
		limiter = rate.NewLimiter(i.rate, i.burst)
		i.ips[ip] = limiter
	}

	return limiter
}

// CleanupExpiredLimiters removes rate limiters for IPs that haven't been seen recently
func (i *IPRateLimiter) CleanupExpiredLimiters() {
	i.mu.Lock()
	defer i.mu.Unlock()

	for ip, lastSeen := range i.lastSeen {
		if time.Since(lastSeen) > i.expiry {
			delete(i.ips, ip)
			delete(i.lastSeen, ip)
		}
	}
}

// Global rate limiter instance with 20 requests per second per IP
var limiter = NewIPRateLimiter(20, 5, 1*time.Hour)

// StartCleanupTask starts a background task to clean up expired rate limiters
func StartCleanupTask() {
	go func() {
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()
		
		for range ticker.C {
			limiter.CleanupExpiredLimiters()
			utils.Logger.Debug("Cleaned up expired rate limiters")
		}
	}()
}

// RateLimiterMiddleware limits the rate of requests by client IP
func RateLimiterMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := limiter.GetLimiter(ip)
		
		if !limiter.Allow() {
			utils.LogRequestWarning(c, "Rate limit exceeded for IP: " + ip)
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Please try again later.",
			})
			return
		}
		
		c.Next()
	}
}

// LoginRateLimiter is a stricter rate limiter for authentication endpoints
func LoginRateLimiter() gin.HandlerFunc {
	// Create a separate limiter with lower limits for login attempts (5 per minute)
	authLimiter := NewIPRateLimiter(0.1, 5, 1*time.Hour)
	
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := authLimiter.GetLimiter(ip)
		
		if !limiter.Allow() {
			utils.LogRequestWarning(c, "Authentication rate limit exceeded for IP: " + ip)
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many login attempts. Please try again later.",
			})
			return
		}
		
		c.Next()
	}
}
