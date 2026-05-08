package controller

import (
	"fmt"
	"net/http"
	"strconv"
	"time"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"github.com/msubaru14/my-app-backend/dto"
	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"github.com/msubaru14/my-app-backend/pkg/response"
	"github.com/msubaru14/my-app-backend/pkg/validation"
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

	if apiErr := validateCreateTaskInput(&input); apiErr != nil {
		response.Error(c, http.StatusBadRequest, *apiErr)
		return
	}

	userID := c.GetUint("user_id")
	task := model.Task{
		Title:     input.Title,
		Completed: false,
		DueDate:   input.DueDate,
		UserID:    userID,
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

	response.SuccessCreated(c, gin.H{
		"task": res,
	})
}

func validateCreateTaskInput(input *dto.CreateTaskInput) *apperror.APIError {
	if err := validateTitle(input.Title); err != nil {
		return err
	}

	if err := validateCreateDueDate(input); err != nil {
		return err
	}

	return nil
}

func validateTitle(title string) *apperror.APIError {
	if title == "" {
		return &apperror.APIError{
			Code:    apperror.CodeValidationError,
			Message: "validation error",
			Details: []apperror.ErrorDetail{
				{
					Field:   "title",
					Code:    apperror.DetailRequired,
					Message: "タイトルは必須です",
				},
			},
		}
	}

	if utf8.RuneCountInString(title) <= validation.TaskTitleMaxLength {
		return nil
	}

	return &apperror.APIError{
		Code:    apperror.CodeValidationError,
		Message: "validation error",
		Details: []apperror.ErrorDetail{
			{
				Field:   "title",
				Code:    apperror.DetailTooLong,
				Message: fmt.Sprintf("タイトルは%d文字以内で入力してください", validation.TaskTitleMaxLength),
			},
		},
	}
}

func validateCreateDueDate(input *dto.CreateTaskInput) *apperror.APIError {
	if input.DueDate == nil {
		return nil
	}

	if *input.DueDate == "" {
		input.DueDate = nil
		return nil
	}

	if _, err := time.Parse("2006-01-02", *input.DueDate); err != nil {
		return &apperror.APIError{
			Code:    apperror.CodeValidationError,
			Message: "validation error",
			Details: []apperror.ErrorDetail{
				{
					Field:   "dueDate",
					Code:    apperror.DetailInvalidFormat,
					Message: "日付は YYYY-MM-DD 形式で入力してください",
				},
			},
		}
	}

	return nil
}

// GET /tasks
func (tc *TaskController) GetTasks(c *gin.Context) {
	userID := c.GetUint("user_id")
	tasks, err := tc.Service.GetTasksByUser(userID)
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

// PATCH /tasks/:id
func (tc *TaskController) UpdateTask(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		response.Error(c, http.StatusBadRequest, apperror.APIError{
			Code:    apperror.CodeInvalidRequest,
			Message: "invalid request",
			Details: nil,
		})
		return
	}

	userID := c.GetUint("user_id")

	var input dto.UpdateTaskRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, apperror.APIError{
			Code:    apperror.CodeValidationError,
			Message: "validation error",
			Details: nil,
		})
		return
	}

	task, err := tc.Service.UpdateTask(uint(id), userID, input)
	if err != nil {
		if apiErr, ok := err.(*apperror.APIError); ok {
			status := apperror.MapErrorCodeToStatus(apiErr.Code)
			response.Error(c, status, *apiErr)
			return
		}

		response.Error(c, http.StatusInternalServerError, apperror.APIError{
			Code:    apperror.CodeInternalServerError,
			Message: "internal server error",
		})
		return
	}

	res := dto.TaskResponse{
		ID:        task.ID,
		Title:     task.Title,
		Completed: task.Completed,
		DueDate:   task.DueDate,
	}

	response.Success(c, gin.H{
		"task": res,
	})
}

// DELETE /tasks/:id
func (tc *TaskController) DeleteTask(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		response.Error(c, http.StatusBadRequest, apperror.APIError{
			Code:    apperror.CodeInvalidRequest,
			Message: "invalid request",
			Details: nil,
		})
		return
	}

	userID := c.GetUint("user_id")

	err = tc.Service.DeleteTask(uint(id), userID)
	if err != nil {
		if apiErr, ok := err.(*apperror.APIError); ok {
			status := apperror.MapErrorCodeToStatus(apiErr.Code)
			response.Error(c, status, *apiErr)
			return
		}

		response.Error(c, http.StatusInternalServerError, apperror.APIError{
			Code:    apperror.CodeInternalServerError,
			Message: "internal server error",
		})
		return
	}

	response.Success(c, nil)
}
