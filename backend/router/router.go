package router

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/msubaru14/my-app-backend/controller"
	"github.com/msubaru14/my-app-backend/middleware"
)

func SetupRouter(
	userController *controller.UserController,
	authController *controller.AuthController,
	taskController *controller.TaskController,
) *gin.Engine {

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{os.Getenv("FRONTEND_URL")},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// 公開API
	r.POST("/login", authController.Login)
	r.POST("/users", userController.CreateUser)

	// 認証必要
	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware())

	// ユーザ系
	auth.GET("/users", userController.GetUsers)
	auth.GET("/me", userController.GetMe)

	// タスク系
	auth.POST("/tasks", taskController.CreateTask)
	auth.GET("/tasks", taskController.GetTasks)

	return r
}
