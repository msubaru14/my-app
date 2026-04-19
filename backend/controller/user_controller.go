package controller

import (
	"net/http"

	"github.com/msubaru14/my-app-backend/dto"
	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"github.com/msubaru14/my-app-backend/pkg/response"
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"users": users,
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"user": createdUser,
	})
}

// ログインユーザ取得
func (uc *UserController) GetMe(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c)
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		response.Unauthorized(c)
		return
	}

	user, err := uc.Service.GetByID(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, apperror.APIError{
			Code:    apperror.CodeInternalServerError,
			Message: "internal server error",
		})
		return
	}

	res := dto.UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}
	response.Success(c, res)
}
