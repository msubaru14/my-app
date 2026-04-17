package main

import (
	"log"
	"os"

	"github.com/msubaru14/my-app-backend/controller"
	"github.com/msubaru14/my-app-backend/db"
	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/repository"
	"github.com/msubaru14/my-app-backend/router"
	"github.com/msubaru14/my-app-backend/service"
)

func main() {
	database, err := db.Connect()
	if err != nil {
		log.Fatalf("DB接続失敗: %v", err)
	}

	// マイグレーション
	if err := database.AutoMigrate(&model.User{}, &model.Task{}); err != nil {
		log.Fatal("マイグレーション失敗:", err)
	}

	// DI（依存注入）
	userRepo := &repository.UserRepository{DB: database}
	userService := &service.UserService{Repo: userRepo}
	userController := &controller.UserController{Service: userService}

	taskRepo := &repository.TaskRepository{DB: database}
	taskService := &service.TaskService{Repo: taskRepo}
	taskController := &controller.TaskController{Service: taskService}

	authService := &service.AuthService{Repo: userRepo}
	authController := &controller.AuthController{Service: authService}

	// ルーティング
	r := router.SetupRouter(userController, authController, taskController)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
