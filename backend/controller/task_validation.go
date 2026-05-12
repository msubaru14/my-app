package controller

import (
	"fmt"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/msubaru14/my-app-backend/dto"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"github.com/msubaru14/my-app-backend/pkg/validation"
)

func validateCreateTaskInput(input *dto.CreateTaskInput) *apperror.APIError {
	details := []apperror.ErrorDetail{}

	details = append(details, validateTitle(&input.Title)...)
	details = append(details, validateCreateDueDate(input)...)

	if len(details) == 0 {
		return nil
	}

	return apperror.NewValidationError("validation error", details)
}

func validateCreateDueDate(input *dto.CreateTaskInput) []apperror.ErrorDetail {
	if input.DueDate == nil {
		return nil
	}

	if *input.DueDate == "" {
		input.DueDate = nil
		return nil
	}

	if _, err := time.Parse("2006-01-02", *input.DueDate); err != nil {
		return []apperror.ErrorDetail{
			{
				Field:   "dueDate",
				Code:    apperror.DetailInvalidFormat,
				Message: "日付は YYYY-MM-DD 形式で入力してください",
			},
		}
	}

	return nil
}

func validateUpdateTaskInput(input *dto.UpdateTaskRequest) *apperror.APIError {
	details := []apperror.ErrorDetail{}

	if input.Title != nil {
		details = append(details, validateTitle(input.Title)...)
	}

	if input.DueDate.IsSet && input.DueDate.Value != nil {
		details = append(details, validateUpdateDueDate(input)...)
	}

	if len(details) == 0 {
		return nil
	}

	return apperror.NewValidationError("validation error", details)
}

func validateUpdateDueDate(input *dto.UpdateTaskRequest) []apperror.ErrorDetail {
	trimmed := strings.TrimSpace(*input.DueDate.Value)

	if trimmed == "" {
		return []apperror.ErrorDetail{
			{
				Field:   "dueDate",
				Code:    apperror.DetailInvalidFormat,
				Message: "日付は空文字不可です",
			},
		}
	}

	if _, err := time.Parse("2006-01-02", trimmed); err != nil {
		return []apperror.ErrorDetail{
			{
				Field:   "dueDate",
				Code:    apperror.DetailInvalidFormat,
				Message: "日付は YYYY-MM-DD 形式で入力してください",
			},
		}
	}

	input.DueDate.Value = &trimmed

	return nil
}

func validateTitle(title *string) []apperror.ErrorDetail {
	trimmed := strings.TrimSpace(*title)
	*title = trimmed

	if trimmed == "" {
		return []apperror.ErrorDetail{
			{
				Field:   "title",
				Code:    apperror.DetailRequired,
				Message: "タイトルは必須です",
			},
		}
	}

	if utf8.RuneCountInString(trimmed) > validation.TaskTitleMaxLength {
		return []apperror.ErrorDetail{
			{
				Field:   "title",
				Code:    apperror.DetailTooLong,
				Message: fmt.Sprintf("タイトルは%d文字以内で入力してください", validation.TaskTitleMaxLength),
			},
		}
	}

	return nil
}
