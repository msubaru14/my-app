package service

import (
	"errors"

	"github.com/msubaru14/my-app-backend/repository"
	"github.com/msubaru14/my-app-backend/utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	Repo *repository.UserRepository
}

// ログイン
func (s *AuthService) Login(email, password string) (string, error) {
	// ユーザ存在チェック
	user, err := s.Repo.FindByEmail(email)
	if err != nil {
		return "", errors.New("認証失敗")
	}

	// パスワードチェック
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", errors.New("認証失敗")
	}

	// トークン発行
	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		return "", err
	}

	return token, nil
}
