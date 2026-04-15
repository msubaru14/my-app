package controller

import (
	"net/http"

	"github.com/msubaru14/my-app-backend/dto"
	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/service"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	Service *service.UserService
}

// GET /users
func (uc *UserController) GetUsers(c *gin.Context) {
	users, err := uc.Service.GetUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "取得失敗"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ユーザー一覧取得成功",
		"users":   users,
	})
}

// POST /users
func (uc *UserController) CreateUser(c *gin.Context) {
	var input dto.CreateUserInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// DTO → model変換
	user := model.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: input.Password,
	}

	createdUser, err := uc.Service.CreateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "作成失敗"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "ユーザー作成成功",
		"user":    createdUser,
	})
}
