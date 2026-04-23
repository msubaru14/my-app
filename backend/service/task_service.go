package service

import (
	"errors"

	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"github.com/msubaru14/my-app-backend/repository"
	"gorm.io/gorm"
)

type TaskService struct {
	Repo *repository.TaskRepository
}

// タスク作成
func (s *TaskService) CreateTask(task model.Task) (model.Task, error) {
	return s.Repo.Create(task)
}

// タスク一覧取得
func (s *TaskService) GetTasksByUser(userID uint) ([]model.Task, error) {
	return s.Repo.FindByUserID(userID)
}

// タスク状態更新
func (s *TaskService) UpdateTaskStatus(id uint, userID uint, completed bool) (*model.Task, error) {
	task, err := s.Repo.FindByIDAndUserID(id, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("task not found")
		}
		return nil, err
	}

	task.Completed = completed

	if err := s.Repo.Update(task); err != nil {
		return nil, err
	}

	return task, nil
}
