package controller

import (
	"github.com/msubaru14/my-app-backend/dto"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"github.com/msubaru14/my-app-backend/pkg/response"
	"github.com/msubaru14/my-app-backend/service"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	Service *service.AuthService
}

func (ac *AuthController) Login(c *gin.Context) {
	var input dto.LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		respondAPIError(c, apperror.NewInvalidRequest("invalid request"))
		return
	}

	// 必須チェック
	if input.Email == "" || input.Password == "" {
		var details []apperror.ErrorDetail

		if input.Email == "" {
			details = append(details, apperror.ErrorDetail{
				Field:   "email",
				Code:    apperror.DetailRequired,
				Message: "メールアドレスは必須です",
			})
		}

		if input.Password == "" {
			details = append(details, apperror.ErrorDetail{
				Field:   "password",
				Code:    apperror.DetailRequired,
				Message: "パスワードは必須です",
			})
		}

		respondAPIError(c, apperror.NewValidationError("validation error", details))
		return
	}

	// 認証処理
	token, err := ac.Service.Login(input.Email, input.Password)
	if err != nil {
		respondAPIError(c, apperror.NewUnauthorized())
		return
	}

	response.Success(c, gin.H{
		"token": token,
	})
}
