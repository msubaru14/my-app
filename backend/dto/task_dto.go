package dto

import "github.com/msubaru14/my-app-backend/model"

type CreateTaskInput struct {
	Title   string  `json:"title"`
	DueDate *string `json:"dueDate"`
}

type TaskResponse struct {
	ID        uint    `json:"id"`
	Title     string  `json:"title"`
	Completed bool    `json:"completed"`
	DueDate   *string `json:"dueDate"`
}

func NewTaskResponse(task *model.Task) TaskResponse {
	return TaskResponse{
		ID:        task.ID,
		Title:     task.Title,
		Completed: task.Completed,
		DueDate:   task.DueDate,
	}
}

func NewTaskResponses(tasks []model.Task) []TaskResponse {
	responses := make([]TaskResponse, 0, len(tasks))
	for i := range tasks {
		responses = append(responses, NewTaskResponse(&tasks[i]))
	}

	return responses
}

type UpdateTaskRequest struct {
	Title     *string `json:"title"`
	DueDate   *string `json:"dueDate"`
	Completed *bool   `json:"completed"`
}
