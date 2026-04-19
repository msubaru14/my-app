package controller

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/msubaru14/my-app-backend/dto"
	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"github.com/msubaru14/my-app-backend/pkg/response"
	"github.com/msubaru14/my-app-backend/service"
)

type TaskController struct {
	Service *service.TaskService
}

// POST /tasks
func (tc *TaskController) CreateTask(c *gin.Context) {
	var input dto.CreateTaskInput

	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, apperror.APIError{
			Code:    apperror.CodeInvalidRequest,
			Message: "invalid request",
		})
		return
	}

	if input.Title == "" {
		response.Error(c, http.StatusBadRequest, apperror.APIError{
			Code:    apperror.CodeValidationError,
			Message: "validation error",
			Details: []apperror.ErrorDetail{
				{
					Field:   "title",
					Code:    apperror.DetailRequired,
					Message: "タイトルは必須です",
				},
			},
		})
		return
	}

	// フォーマット簡易チェック（YYYY-MM-DD）
	if input.DueDate != nil {
		if *input.DueDate == "" {
			input.DueDate = nil
		} else {
			if _, err := time.Parse("2006-01-02", *input.DueDate); err != nil {
				response.Error(c, http.StatusBadRequest, apperror.APIError{
					Code:    apperror.CodeValidationError,
					Message: "validation error",
					Details: []apperror.ErrorDetail{
						{
							Field:   "dueDate",
							Code:    apperror.DetailInvalidFormat,
							Message: "日付は YYYY-MM-DD 形式で入力してください",
						},
					},
				})
				return
			}
		}
	}

	task := model.Task{
		Title:     input.Title,
		Completed: false,
		DueDate:   input.DueDate,
	}

	createdTask, err := tc.Service.CreateTask(task)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, apperror.APIError{
			Code:    apperror.CodeInternalServerError,
			Message: "internal server error",
		})
		return
	}

	res := dto.TaskResponse{
		ID:        createdTask.ID,
		Title:     createdTask.Title,
		Completed: createdTask.Completed,
		DueDate:   createdTask.DueDate,
	}

	response.Success(c, gin.H{
		"task": res,
	})
}

// GET /tasks
func (tc *TaskController) GetTasks(c *gin.Context) {
	tasks, err := tc.Service.GetTasks()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, apperror.APIError{
			Code:    apperror.CodeInternalServerError,
			Message: "internal server error",
		})
		return
	}

	res := make([]dto.TaskResponse, 0, len(tasks))

	for _, t := range tasks {
		res = append(res, dto.TaskResponse{
			ID:        t.ID,
			Title:     t.Title,
			Completed: t.Completed,
			DueDate:   t.DueDate,
		})
	}

	response.Success(c, gin.H{
		"tasks": res,
	})
}
