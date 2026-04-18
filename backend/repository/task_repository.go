package repository

import (
	"github.com/msubaru14/my-app-backend/model"
	"gorm.io/gorm"
)

type TaskRepository struct {
	DB *gorm.DB
}

func (r *TaskRepository) Create(task model.Task) (model.Task, error) {
	err := r.DB.Create(&task).Error
	return task, err
}
