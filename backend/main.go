package main

import (
	"log"

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
		log.Fatal("DB接続失敗")
	}

	// マイグレーション
	database.AutoMigrate(&model.User{})

	// DI（依存注入）
	userRepo := &repository.UserRepository{DB: database}
	userService := &service.UserService{Repo: userRepo}
	userController := &controller.UserController{Service: userService}

	authService := &service.AuthService{Repo: userRepo}
	authController := &controller.AuthController{Service: authService}

	// ルーティング
	r := router.SetupRouter(userController, authController)

	r.Run(":8080")
}
