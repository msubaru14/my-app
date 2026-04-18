package service

import (
	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/repository"
)

type TaskService struct {
	Repo *repository.TaskRepository
}

func (s *TaskService) CreateTask(task model.Task) (model.Task, error) {
	return s.Repo.Create(task)
}
