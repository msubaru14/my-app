package response

import (
	"net/http"

	"github.com/msubaru14/my-app-backend/pkg/apperror"

	"github.com/gin-gonic/gin"
)

// 成功レスポンス
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Data:  data,
		Error: nil,
	})
}

// エラーレスポンス
func Error(c *gin.Context, status int, apiErr apperror.APIError) {
	c.JSON(status, Response{
		Data:  nil,
		Error: apiErr,
	})
}
