package middleware

import (
	"fmt"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/msubaru14/my-app-backend/pkg/response"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			response.Unauthorized(c)
			return
		}

		// "Bearer xxx" を分解
		if !strings.HasPrefix(authHeader, "Bearer ") {
			response.Unauthorized(c)
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			response.Unauthorized(c)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			response.Unauthorized(c)
			return
		}

		userIDValue, ok := claims["user_id"]
		if !ok {
			response.Unauthorized(c)
			return
		}

		userIDFloat, ok := userIDValue.(float64)
		if !ok {
			response.Unauthorized(c)
			return
		}

		userID := uint(userIDFloat)
		c.Set("user_id", userID)

		c.Next()
	}
}
