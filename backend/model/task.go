package model

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Title     string     `json:"title"`
	Completed bool       `json:"completed" gorm:"default:false"`
	DueDate   *time.Time `json:"dueDate" gorm:"type:date"`
	UserID    uint       `json:"userId" gorm:"not null;index"`
}
