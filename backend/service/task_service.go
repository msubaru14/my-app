package service

import (
	"errors"
	"strings"
	"time"

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
	details := []apperror.ErrorDetail{}

	// タイトルバリデーション
	trimmedTitle := strings.TrimSpace(req.Title)
	if trimmedTitle == "" {
		details = append(details, apperror.ErrorDetail{
			Field:   "title",
			Code:    apperror.DetailRequired,
			Message: "タイトルは必須です",
		})
	}

	if len(trimmedTitle) > 100 {
		details = append(details, apperror.ErrorDetail{
			Field:   "title",
			Code:    apperror.DetailTooLong,
			Message: "タイトルが長すぎです",
		})
	}

	// 日付バリデーション
	if req.DueDate != nil {
		trimmed := strings.TrimSpace(*req.DueDate)

		if trimmed == "" {
			details = append(details, apperror.ErrorDetail{
				Field:   "dueDate",
				Code:    apperror.DetailInvalidFormat,
				Message: "日付は空文字不可です",
			})
		} else {
			if _, err := time.Parse("2006-01-02", trimmed); err != nil {
				details = append(details, apperror.ErrorDetail{
					Field:   "dueDate",
					Code:    apperror.DetailInvalidFormat,
					Message: "日付は YYYY-MM-DD 形式で入力してください",
				})
			} else {
				req.DueDate = &trimmed
			}
		}
	}

	// 完了フラグバリデーション
	if req.Completed == nil {
		details = append(details, apperror.ErrorDetail{
			Field:   "completed",
			Code:    apperror.DetailRequired,
			Message: "completedは必須です",
		})
	}

	if len(details) > 0 {
		return nil, apperror.NewValidationError("validation error", details)
	}

	// 対象タスク取得
	task, err := s.Repo.FindByIDAndUserID(id, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("task not found")
		}
		return nil, err
	}

	task.Title = trimmedTitle
	task.DueDate = req.DueDate
	task.Completed = *req.Completed

	// タスク更新
	if err := s.Repo.Update(task); err != nil {
		return nil, err
	}

	return task, nil
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
