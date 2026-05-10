package dto

import (
	"bytes"
	"encoding/json"

	"github.com/msubaru14/my-app-backend/model"
)

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
	Title     *string      `json:"title"`
	DueDate   PatchDueDate `json:"dueDate"`
	Completed *bool        `json:"completed"`
}

type PatchDueDate struct {
	IsSet bool
	Value *string
}

func (d *PatchDueDate) UnmarshalJSON(data []byte) error {
	d.IsSet = true

	if bytes.Equal(data, []byte("null")) {
		d.Value = nil
		return nil
	}

	var value string
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}

	d.Value = &value
	return nil
}
