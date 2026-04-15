package controller

import (
	"net/http"

	"github.com/msubaru14/my-app-backend/dto"
	"github.com/msubaru14/my-app-backend/service"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	Service *service.AuthService
}

func (ac *AuthController) Login(c *gin.Context) {
	var input dto.LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "認証失敗"})
		return
	}

	token, err := ac.Service.Login(input.Email, input.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ログイン成功",
		"token":   token,
	})
}
