package service

import (
	"github.com/msubaru14/my-app-backend/repository"
)

type TaskService struct {
	Repo *repository.TaskRepository
}
