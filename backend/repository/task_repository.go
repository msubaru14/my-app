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
func (r *TaskRepository) FindByUserID(userID uint) ([]model.Task, error) {
	var tasks []model.Task
	err := r.DB.Where("user_id = ?", userID).Find(&tasks).Error
	return tasks, err
}

// タスクIDとユーザIDでタスクを取得
func (r *TaskRepository) FindByIDAndUserID(id uint, userID uint) (*model.Task, error) {
	var task model.Task
	err := r.DB.Where("id = ? AND user_id = ?", id, userID).First(&task).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

// タスク更新
func (r *TaskRepository) Update(task *model.Task) error {
	return r.DB.Save(task).Error
}
