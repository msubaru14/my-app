package service

import "time"

type UpdateTaskInput struct {
	Title      *string
	DueDateSet bool
	DueDate    *time.Time
	Completed  *bool
}
