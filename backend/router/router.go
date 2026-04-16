package router

import (
	"github.com/gin-gonic/gin"
	"github.com/msubaru14/my-app-backend/controller"
	"github.com/msubaru14/my-app-backend/middleware"
)

func SetupRouter(
	userController *controller.UserController,
	authController *controller.AuthController,
) *gin.Engine {

	r := gin.Default()

	// 公開API
	r.POST("/login", authController.Login)
	r.POST("/users", userController.CreateUser)

	// 認証必要
	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware())

	auth.GET("/users", userController.GetUsers)
	auth.GET("/me", userController.GetMe)

	return r
}
