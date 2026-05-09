package middleware

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"github.com/msubaru14/my-app-backend/pkg/config"
	"github.com/msubaru14/my-app-backend/pkg/response"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			abortUnauthorized(c)
			return
		}

		// "Bearer xxx" を分解
		if !strings.HasPrefix(authHeader, "Bearer ") {
			abortUnauthorized(c)
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(config.JWTSecret()), nil
		})

		if err != nil || !token.Valid {
			abortUnauthorized(c)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			abortUnauthorized(c)
			return
		}

		userIDValue, ok := claims["user_id"]
		if !ok {
			abortUnauthorized(c)
			return
		}

		userIDFloat, ok := userIDValue.(float64)
		if !ok {
			abortUnauthorized(c)
			return
		}

		userID := uint(userIDFloat)
		c.Set("user_id", userID)

		c.Next()
	}
}

func abortUnauthorized(c *gin.Context) {
	apiErr := apperror.NewUnauthorized()
	status := apperror.MapErrorCodeToStatus(apiErr.Code)
	response.Error(c, status, *apiErr)
	c.Abort()
}
