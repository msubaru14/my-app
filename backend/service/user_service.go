package service

import (
	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/repository"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	Repo *repository.UserRepository
}

// 一覧取得
func (s *UserService) GetUsers() ([]model.User, error) {
	return s.Repo.FindAll()
}

// ユーザ登録
func (s *UserService) CreateUser(user model.User) (*model.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user.Password = string(hashedPassword)

	return s.Repo.Create(&user)
}
