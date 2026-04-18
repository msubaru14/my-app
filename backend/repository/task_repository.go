package repository

import (
	"github.com/msubaru14/my-app-backend/model"
	"gorm.io/gorm"
)

type TaskRepository struct {
	DB *gorm.DB
}

// タスク作成
func (r *TaskRepository) Create(task model.Task) (model.Task, error) {
	err := r.DB.Create(&task).Error
	return task, err
}

// タスク一覧取得
func (r *TaskRepository) FindAll() ([]model.Task, error) {
	var tasks []model.Task
	err := r.DB.Find(&tasks).Error
	return tasks, err
}
