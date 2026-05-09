package dto

import "github.com/msubaru14/my-app-backend/model"

type CreateUserInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func NewUserResponse(user *model.User) UserResponse {
	return UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}
}

func NewUserResponses(users []model.User) []UserResponse {
	responses := make([]UserResponse, 0, len(users))
	for i := range users {
		responses = append(responses, NewUserResponse(&users[i]))
	}

	return responses
}
