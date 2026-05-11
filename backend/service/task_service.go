package service

import (
	"errors"

	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"gorm.io/gorm"
)

type taskRepository interface {
	Create(task model.Task) (model.Task, error)
	FindByUserID(userID uint) ([]model.Task, error)
	FindByIDAndUserID(id uint, userID uint) (*model.Task, error)
	Update(task *model.Task) error
	Delete(task *model.Task) error
}

type TaskService struct {
	Repo taskRepository
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
func (s *TaskService) UpdateTask(id uint, userID uint, input UpdateTaskInput) (*model.Task, error) {
	if !hasUpdateTaskFields(input) {
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

	applyUpdateTaskInput(task, input)

	// タスク更新
	if err := s.Repo.Update(task); err != nil {
		return nil, err
	}

	return task, nil
}

func hasUpdateTaskFields(input UpdateTaskInput) bool {
	return input.Title != nil || input.DueDateSet || input.Completed != nil
}

func applyUpdateTaskInput(task *model.Task, input UpdateTaskInput) {
	if input.Title != nil {
		task.Title = *input.Title
	}

	if input.DueDateSet {
		task.DueDate = input.DueDate
	}

	if input.Completed != nil {
		task.Completed = *input.Completed
	}
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
