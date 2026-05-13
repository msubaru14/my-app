package dto

import (
	"testing"
	"time"

	"github.com/msubaru14/my-app-backend/model"
)

func TestNewTaskResponseDueDate(t *testing.T) {
	tests := []struct {
		name        string
		dueDate     *time.Time
		wantDueDate *string
	}{
		{
			name:        "dueDateがある場合はYYYY-MM-DD形式に変換する",
			dueDate:     datePtr("2026-05-11"),
			wantDueDate: stringPtr("2026-05-11"),
		},
		{
			name:        "dueDateがnilの場合はnilのまま返す",
			dueDate:     nil,
			wantDueDate: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			task := &model.Task{
				Title:     "task",
				Completed: false,
				DueDate:   tt.dueDate,
			}

			response := NewTaskResponse(task)

			if !equalStringPtr(response.DueDate, tt.wantDueDate) {
				t.Fatalf("expected dueDate %#v, got %#v", tt.wantDueDate, response.DueDate)
			}
		})
	}
}

func datePtr(value string) *time.Time {
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		panic(err)
	}

	return &parsed
}

func stringPtr(value string) *string {
	return &value
}

func equalStringPtr(a *string, b *string) bool {
	if a == nil || b == nil {
		return a == b
	}

	return *a == *b
}
