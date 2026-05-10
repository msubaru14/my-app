package service

import (
	"errors"

	"github.com/msubaru14/my-app-backend/dto"
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

// タスク更新
func (s *TaskService) UpdateTask(id uint, userID uint, req dto.UpdateTaskRequest) (*model.Task, error) {
	if !hasUpdateTaskFields(req) {
		return nil, apperror.NewInvalidRequest("no fields to update")
	}

	// 対象タスク取得
	task, err := s.Repo.FindByIDAndUserID(id, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("task not found")
		}
		return nil, err
	}

	if req.Title != nil {
		task.Title = *req.Title
	}

	if req.DueDate.IsSet {
		task.DueDate = req.DueDate.Value
	}

	if req.Completed != nil {
		task.Completed = *req.Completed
	}

	// タスク更新
	if err := s.Repo.Update(task); err != nil {
		return nil, err
	}

	return task, nil
}

func hasUpdateTaskFields(req dto.UpdateTaskRequest) bool {
	return req.Title != nil || req.DueDate.IsSet || req.Completed != nil
}

// タスク削除
func (s *TaskService) DeleteTask(id uint, userID uint) error {
	// 対象タスク取得
	task, err := s.Repo.FindByIDAndUserID(id, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("task not found")
		}
		return err
	}

	return s.Repo.Delete(task)
}
