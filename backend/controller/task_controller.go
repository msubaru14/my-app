package controller

import (
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
		respondAPIError(c, apperror.NewInvalidRequest("invalid request"))
		return
	}

	if apiErr := validateCreateTaskInput(&input); apiErr != nil {
		respondAPIError(c, apiErr)
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
		respondAPIError(c, apperror.NewInternalServerError())
		return
	}

	res := dto.NewTaskResponse(&createdTask)

	response.SuccessCreated(c, gin.H{
		"task": res,
	})
}

// GET /tasks
func (tc *TaskController) GetTasks(c *gin.Context) {
	userID := c.GetUint("user_id")
	tasks, err := tc.Service.GetTasksByUser(userID)
	if err != nil {
		respondAPIError(c, apperror.NewInternalServerError())
		return
	}

	res := dto.NewTaskResponses(tasks)

	response.Success(c, gin.H{
		"tasks": res,
	})
}

// PATCH /tasks/:id
func (tc *TaskController) UpdateTask(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		respondAPIError(c, apperror.NewInvalidRequest("invalid request"))
		return
	}

	userID := c.GetUint("user_id")

	var input dto.UpdateTaskRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		respondAPIError(c, apperror.NewInvalidRequest("invalid request"))
		return
	}

	if apiErr := validateUpdateTaskInput(&input); apiErr != nil {
		respondAPIError(c, apiErr)
		return
	}

	task, err := tc.Service.UpdateTask(uint(id), userID, input)
	if err != nil {
		if apiErr, ok := err.(*apperror.APIError); ok {
			respondAPIError(c, apiErr)
			return
		}

		respondAPIError(c, apperror.NewInternalServerError())
		return
	}

	res := dto.NewTaskResponse(task)

	response.Success(c, gin.H{
		"task": res,
	})
}

// DELETE /tasks/:id
func (tc *TaskController) DeleteTask(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		respondAPIError(c, apperror.NewInvalidRequest("invalid request"))
		return
	}

	userID := c.GetUint("user_id")

	err = tc.Service.DeleteTask(uint(id), userID)
	if err != nil {
		if apiErr, ok := err.(*apperror.APIError); ok {
			respondAPIError(c, apiErr)
			return
		}

		respondAPIError(c, apperror.NewInternalServerError())
		return
	}

	response.Success(c, nil)
}
