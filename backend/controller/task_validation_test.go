package controller

import (
	"strings"
	"testing"

	"github.com/msubaru14/my-app-backend/dto"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"github.com/msubaru14/my-app-backend/pkg/validation"
)

func TestValidateCreateTaskInput(t *testing.T) {
	longTitle := strings.Repeat("あ", validation.TaskTitleMaxLength+1)

	tests := []struct {
		name             string
		input            dto.CreateTaskInput
		wantTitle        string
		wantDueDate      *string
		wantAPIErrorCode string
		wantDetails      []apperror.ErrorDetail
	}{
		{
			name: "有効な入力の場合はvalidation errorを返さない",
			input: dto.CreateTaskInput{
				Title:   "task",
				DueDate: stringPtr("2026-05-11"),
			},
			wantTitle:   "task",
			wantDueDate: stringPtr("2026-05-11"),
		},
		{
			name: "createのtitleはtrimしない",
			input: dto.CreateTaskInput{
				Title:   "  task  ",
				DueDate: nil,
			},
			wantTitle:   "  task  ",
			wantDueDate: nil,
		},
		{
			name: "titleが空の場合はREQUIREDを返す",
			input: dto.CreateTaskInput{
				Title:   "",
				DueDate: nil,
			},
			wantTitle:        "",
			wantDueDate:      nil,
			wantAPIErrorCode: apperror.CodeValidationError,
			wantDetails: []apperror.ErrorDetail{
				{
					Field:   "title",
					Code:    apperror.DetailRequired,
					Message: "タイトルは必須です",
				},
			},
		},
		{
			name: "titleが最大長を超える場合はTOO_LONGを返す",
			input: dto.CreateTaskInput{
				Title:   longTitle,
				DueDate: nil,
			},
			wantTitle:        longTitle,
			wantDueDate:      nil,
			wantAPIErrorCode: apperror.CodeValidationError,
			wantDetails: []apperror.ErrorDetail{
				{
					Field:   "title",
					Code:    apperror.DetailTooLong,
					Message: "タイトルは100文字以内で入力してください",
				},
			},
		},
		{
			name: "createのdueDate空文字はnilに補正してvalidation errorを返さない",
			input: dto.CreateTaskInput{
				Title:   "task",
				DueDate: stringPtr(""),
			},
			wantTitle:   "task",
			wantDueDate: nil,
		},
		{
			name: "dueDateが不正形式の場合はINVALID_FORMATを返す",
			input: dto.CreateTaskInput{
				Title:   "task",
				DueDate: stringPtr("2026/05/11"),
			},
			wantTitle:        "task",
			wantDueDate:      stringPtr("2026/05/11"),
			wantAPIErrorCode: apperror.CodeValidationError,
			wantDetails: []apperror.ErrorDetail{
				{
					Field:   "dueDate",
					Code:    apperror.DetailInvalidFormat,
					Message: "日付は YYYY-MM-DD 形式で入力してください",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := tt.input

			err := validateCreateTaskInput(&input)

			assertValidationResult(t, err, tt.wantAPIErrorCode, tt.wantDetails)
			if input.Title != tt.wantTitle {
				t.Fatalf("expected title %q, got %q", tt.wantTitle, input.Title)
			}
			if !equalStringPtr(input.DueDate, tt.wantDueDate) {
				t.Fatalf("expected due date %#v, got %#v", tt.wantDueDate, input.DueDate)
			}
		})
	}
}

func TestValidateUpdateTaskInput(t *testing.T) {
	longTitle := strings.Repeat("あ", validation.TaskTitleMaxLength+1)

	tests := []struct {
		name             string
		input            dto.UpdateTaskRequest
		wantTitle        *string
		wantDueDate      dto.PatchDueDate
		wantAPIErrorCode string
		wantDetails      []apperror.ErrorDetail
	}{
		{
			name: "有効な入力の場合はtitleとdueDateをtrimしてvalidation errorを返さない",
			input: dto.UpdateTaskRequest{
				Title:   stringPtr("  task  "),
				DueDate: dto.PatchDueDate{IsSet: true, Value: stringPtr(" 2026-05-11 ")},
			},
			wantTitle:   stringPtr("task"),
			wantDueDate: dto.PatchDueDate{IsSet: true, Value: stringPtr("2026-05-11")},
		},
		{
			name: "title未指定かつdueDate未指定の場合はvalidation errorを返さない",
			input: dto.UpdateTaskRequest{
				Title:   nil,
				DueDate: dto.PatchDueDate{},
			},
			wantTitle:   nil,
			wantDueDate: dto.PatchDueDate{},
		},
		{
			name: "updateのtitleはtrim後に空ならREQUIREDを返す",
			input: dto.UpdateTaskRequest{
				Title:   stringPtr("   "),
				DueDate: dto.PatchDueDate{},
			},
			wantTitle:        stringPtr(""),
			wantDueDate:      dto.PatchDueDate{},
			wantAPIErrorCode: apperror.CodeValidationError,
			wantDetails: []apperror.ErrorDetail{
				{
					Field:   "title",
					Code:    apperror.DetailRequired,
					Message: "タイトルは必須です",
				},
			},
		},
		{
			name: "titleが最大長を超える場合はTOO_LONGを返す",
			input: dto.UpdateTaskRequest{
				Title:   &longTitle,
				DueDate: dto.PatchDueDate{},
			},
			wantTitle:        &longTitle,
			wantDueDate:      dto.PatchDueDate{},
			wantAPIErrorCode: apperror.CodeValidationError,
			wantDetails: []apperror.ErrorDetail{
				{
					Field:   "title",
					Code:    apperror.DetailTooLong,
					Message: "タイトルは100文字以内で入力してください",
				},
			},
		},
		{
			name: "updateのdueDate nullは期限削除としてvalidation errorを返さない",
			input: dto.UpdateTaskRequest{
				Title:   nil,
				DueDate: dto.PatchDueDate{IsSet: true, Value: nil},
			},
			wantTitle:   nil,
			wantDueDate: dto.PatchDueDate{IsSet: true, Value: nil},
		},
		{
			name: "updateのdueDate空文字はINVALID_FORMATを返す",
			input: dto.UpdateTaskRequest{
				Title:   nil,
				DueDate: dto.PatchDueDate{IsSet: true, Value: stringPtr("")},
			},
			wantTitle:        nil,
			wantDueDate:      dto.PatchDueDate{IsSet: true, Value: stringPtr("")},
			wantAPIErrorCode: apperror.CodeValidationError,
			wantDetails: []apperror.ErrorDetail{
				{
					Field:   "dueDate",
					Code:    apperror.DetailInvalidFormat,
					Message: "日付は空文字不可です",
				},
			},
		},
		{
			name: "dueDateが不正形式の場合はINVALID_FORMATを返す",
			input: dto.UpdateTaskRequest{
				Title:   nil,
				DueDate: dto.PatchDueDate{IsSet: true, Value: stringPtr("2026/05/11")},
			},
			wantTitle:        nil,
			wantDueDate:      dto.PatchDueDate{IsSet: true, Value: stringPtr("2026/05/11")},
			wantAPIErrorCode: apperror.CodeValidationError,
			wantDetails: []apperror.ErrorDetail{
				{
					Field:   "dueDate",
					Code:    apperror.DetailInvalidFormat,
					Message: "日付は YYYY-MM-DD 形式で入力してください",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := tt.input

			err := validateUpdateTaskInput(&input)

			assertValidationResult(t, err, tt.wantAPIErrorCode, tt.wantDetails)
			if !equalStringPtr(input.Title, tt.wantTitle) {
				t.Fatalf("expected title %#v, got %#v", tt.wantTitle, input.Title)
			}
			if input.DueDate.IsSet != tt.wantDueDate.IsSet {
				t.Fatalf("expected due date IsSet %v, got %v", tt.wantDueDate.IsSet, input.DueDate.IsSet)
			}
			if !equalStringPtr(input.DueDate.Value, tt.wantDueDate.Value) {
				t.Fatalf("expected due date value %#v, got %#v", tt.wantDueDate.Value, input.DueDate.Value)
			}
		})
	}
}

func assertValidationResult(t *testing.T, err *apperror.APIError, code string, details []apperror.ErrorDetail) {
	t.Helper()

	if code == "" {
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		return
	}

	if err == nil {
		t.Fatalf("expected APIError code %s, got nil", code)
	}
	if err.Code != code {
		t.Fatalf("expected error code %s, got %s", code, err.Code)
	}
	if len(err.Details) != len(details) {
		t.Fatalf("expected %d details, got %d", len(details), len(err.Details))
	}
	for i := range details {
		if err.Details[i] != details[i] {
			t.Fatalf("expected detail %#v, got %#v", details[i], err.Details[i])
		}
	}
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
