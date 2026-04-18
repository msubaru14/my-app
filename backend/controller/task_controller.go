package controller

import (
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/msubaru14/my-app-backend/dto"
	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/service"
)

type TaskController struct {
	Service *service.TaskService
}

var dateRegex = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)

func isValidDate(date string) bool {
	return dateRegex.MatchString(date)
}

// POST /tasks
func (tc *TaskController) CreateTask(c *gin.Context) {
	var input dto.CreateTaskInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// フォーマット簡易チェック（YYYY-MM-DD）
	if input.DueDate != nil {
		if !isValidDate(*input.DueDate) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid dueDate format"})
			return
		}
	}

	task := model.Task{
		Title:     input.Title,
		Completed: false,
		DueDate:   input.DueDate,
	}

	createdTask, err := tc.Service.CreateTask(task)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := dto.TaskResponse{
		ID:        createdTask.ID,
		Title:     createdTask.Title,
		Completed: createdTask.Completed,
		DueDate:   createdTask.DueDate,
	}

	c.JSON(http.StatusCreated, gin.H{
		"task": res,
	})
}
