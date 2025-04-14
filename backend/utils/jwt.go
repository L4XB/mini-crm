package utils

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/deinname/mini-crm-backend/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var (
	jwtKey                = []byte(os.Getenv("JWT_SECRET_KEY"))
	refreshJwtKey        = []byte(os.Getenv("JWT_REFRESH_SECRET_KEY"))
	jwtExpirationHours   int
	refreshExpirationDays int
)

func init() {
	// Set JWT expiration time - from env or default to 24 hours
	var err error
	jwtExpirationHours, err = strconv.Atoi(os.Getenv("JWT_EXPIRATION_HOURS"))
	if err != nil || jwtExpirationHours <= 0 {
		jwtExpirationHours = 24 // Default to 24 hours
	}
	
	// Set refresh token expiration time - from env or default to 7 days
	refreshExpirationDays, err = strconv.Atoi(os.Getenv("REFRESH_TOKEN_EXPIRATION_DAYS"))
	if err != nil || refreshExpirationDays <= 0 {
		refreshExpirationDays = 7 // Default to 7 days
	}
	
	// If refresh token key not set, use JWT key with a prefix
	if len(refreshJwtKey) == 0 {
		refreshJwtKey = append([]byte("refresh-"), jwtKey...)
	}
}

// Claims struct for JWT
type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// RefreshClaims struct for refresh tokens
type RefreshClaims struct {
	UserID    uint   `json:"user_id"`
	TokenID   string `json:"token_id"` // UUID für eindeutige Identifikation
	jwt.RegisteredClaims
}

// GetTokenExpirationSeconds returns the JWT token expiration time in seconds
func GetTokenExpirationSeconds() int64 {
	return int64(jwtExpirationHours * 3600)
}

// GenerateToken creates a new JWT token for a user
func GenerateToken(user models.User) (string, error) {

	// Create claims with user information
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * time.Duration(jwtExpirationHours))),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "mini-crm-api",
			Subject:   fmt.Sprintf("%d", user.ID),
			ID:        uuid.New().String(), // Eindeutige Token-ID
		},
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the JWT key
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// GenerateRefreshToken creates a new refresh token for a user
func GenerateRefreshToken(user models.User) (string, error) {
	// Create refresh token claims with user information and UUID
	claims := &RefreshClaims{
		UserID:  user.ID,
		TokenID: uuid.New().String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * time.Duration(refreshExpirationDays))),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "mini-crm-api-refresh",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the refresh JWT key
	tokenString, err := token.SignedString(refreshJwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateRefreshToken validates a refresh token and returns the user ID
func ValidateRefreshToken(tokenString string) (uint, error) {
	// Initialize claims
	claims := &RefreshClaims{}

	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return refreshJwtKey, nil
	})

	// Check for parsing errors
	if err != nil {
		return 0, err
	}

	// Check if token is valid
	if !token.Valid {
		return 0, errors.New("invalid refresh token")
	}

	return claims.UserID, nil
}

// ValidateToken validates the JWT token and returns user claims
func ValidateToken(tokenString string) (*Claims, error) {
	// Initialize claims
	claims := &Claims{}

	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtKey, nil
	})

	// Check for parsing errors
	if err != nil {
		return nil, err
	}

	// Check if token is valid
	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
