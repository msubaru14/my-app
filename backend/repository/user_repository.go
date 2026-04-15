package repository

import (
	"github.com/msubaru14/my-app-backend/model"

	"gorm.io/gorm"
)

type UserRepository struct {
	DB *gorm.DB
}

// 一覧取得
func (r *UserRepository) FindAll() ([]model.User, error) {
	var users []model.User
	if err := r.DB.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// 作成
func (r *UserRepository) Create(user *model.User) (*model.User, error) {
	if err := r.DB.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

// emailから取得
func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
	var user model.User
	if err := r.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
