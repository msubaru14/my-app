package controller

import (
	"net/http"
	"strconv"

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
		response.Error(c, http.StatusBadRequest, *apperror.NewInvalidRequest("invalid request"))
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
		response.Error(c, http.StatusInternalServerError, *apperror.NewInternalServerError())
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

// GET /tasks
func (tc *TaskController) GetTasks(c *gin.Context) {
	userID := c.GetUint("user_id")
	tasks, err := tc.Service.GetTasksByUser(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, *apperror.NewInternalServerError())
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
		response.Error(c, http.StatusBadRequest, *apperror.NewInvalidRequest("invalid request"))
		return
	}

	userID := c.GetUint("user_id")

	var input dto.UpdateTaskRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, *apperror.NewValidationError("validation error", nil))
		return
	}

	if apiErr := validateUpdateTaskInput(&input); apiErr != nil {
		response.Error(c, http.StatusBadRequest, *apiErr)
		return
	}

	task, err := tc.Service.UpdateTask(uint(id), userID, input)
	if err != nil {
		if apiErr, ok := err.(*apperror.APIError); ok {
			status := apperror.MapErrorCodeToStatus(apiErr.Code)
			response.Error(c, status, *apiErr)
			return
		}

		response.Error(c, http.StatusInternalServerError, *apperror.NewInternalServerError())
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
		response.Error(c, http.StatusBadRequest, *apperror.NewInvalidRequest("invalid request"))
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

		response.Error(c, http.StatusInternalServerError, *apperror.NewInternalServerError())
		return
	}

	response.Success(c, nil)
}
