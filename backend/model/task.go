package model

import "gorm.io/gorm"

type Task struct {
	gorm.Model
	Title     string  `json:"title"`
	Completed bool    `json:"completed" gorm:"default:false"`
	DueDate   *string `json:"dueDate" gorm:"type:text"`
}
