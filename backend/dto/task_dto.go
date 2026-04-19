package dto

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
