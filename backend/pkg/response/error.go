package response

import (
	"net/http"

	"github.com/msubaru14/my-app-backend/pkg/apperror"

	"github.com/gin-gonic/gin"
)

// 認証エラーレスポンス
func Unauthorized(c *gin.Context) {
	Error(c, http.StatusUnauthorized, apperror.APIError{
		Code:    apperror.CodeUnauthorized,
		Message: "unauthorized",
	})
	c.Abort()
}
