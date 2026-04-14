package main

import (
	"net/http"

	"my-app-backend/db"
	"my-app-backend/models"

	"github.com/gin-gonic/gin"
)

func main() {
	database, _ := db.Connect()

	database.AutoMigrate(&models.User{})

	r := gin.Default()

	r.GET("/users", func(c *gin.Context) {
		var users []models.User
		database.Find(&users)
		c.JSON(http.StatusOK, users)
	})

	r.POST("/users", func(c *gin.Context) {
		var user models.User
		c.ShouldBindJSON(&user)
		database.Create(&user)
		c.JSON(200, user)
	})

	r.Run(":8080")
}
