package service

type UpdateTaskInput struct {
	Title      *string
	DueDateSet bool
	DueDate    *string
	Completed  *bool
}
