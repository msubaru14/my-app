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
		response.Error(c, http.StatusInternalServerError, apperror.APIError{
			Code:    apperror.CodeInternalServerError,
			Message: "internal server error",
		})
		return
	}

	res := make([]dto.UserResponse, 0, len(users))
	for _, u := range users {
		res = append(res, dto.UserResponse{
			ID:    u.ID,
			Name:  u.Name,
			Email: u.Email,
		})
	}

	response.Success(c, gin.H{
		"users": res,
	})
}

// POST /users
func (uc *UserController) CreateUser(c *gin.Context) {
	var input dto.CreateUserInput

	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, apperror.APIError{
			Code:    apperror.CodeInvalidRequest,
			Message: "invalid request",
		})
		return
	}

	var details []apperror.ErrorDetail

	if input.Name == "" {
		details = append(details, apperror.ErrorDetail{
			Field:   "name",
			Code:    apperror.DetailRequired,
			Message: "名前は必須です",
		})
	}

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

	if len(details) > 0 {
		response.Error(c, http.StatusBadRequest, apperror.APIError{
			Code:    apperror.CodeValidationError,
			Message: "validation error",
			Details: details,
		})
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
		response.Error(c, http.StatusInternalServerError, apperror.APIError{
			Code:    apperror.CodeInternalServerError,
			Message: "internal server error",
		})
		return
	}

	res := dto.UserResponse{
		ID:    createdUser.ID,
		Name:  createdUser.Name,
		Email: createdUser.Email,
	}
	response.SuccessCreated(c, gin.H{
		"user": res,
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
	response.Success(c, gin.H{
		"user": res,
	})
}
