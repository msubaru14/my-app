package service

import (
	"errors"
	"testing"

	"github.com/msubaru14/my-app-backend/model"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"gorm.io/gorm"
)

type fakeTaskRepository struct {
	task *model.Task

	findErr   error
	updateErr error

	findCalled   bool
	updateCalled bool
	findID       uint
	findUserID   uint
	updatedTask  *model.Task
}

func (r *fakeTaskRepository) Create(task model.Task) (model.Task, error) {
	return task, nil
}

func (r *fakeTaskRepository) FindByUserID(userID uint) ([]model.Task, error) {
	return nil, nil
}

func (r *fakeTaskRepository) FindByIDAndUserID(id uint, userID uint) (*model.Task, error) {
	r.findCalled = true
	r.findID = id
	r.findUserID = userID

	if r.findErr != nil {
		return nil, r.findErr
	}

	return r.task, nil
}

func (r *fakeTaskRepository) Update(task *model.Task) error {
	r.updateCalled = true
	r.updatedTask = task

	return r.updateErr
}

func (r *fakeTaskRepository) Delete(task *model.Task) error {
	return nil
}

func TestApplyUpdateTaskInput(t *testing.T) {
	tests := []struct {
		name          string
		initialTask   model.Task
		input         UpdateTaskInput
		wantTitle     string
		wantCompleted bool
		wantDueDate   *string
	}{
		{
			name: "titleだけ指定した場合はtitleだけ更新する",
			initialTask: model.Task{
				Title:     "old title",
				Completed: false,
				DueDate:   stringPtr("2026-05-10"),
			},
			input: UpdateTaskInput{
				Title: stringPtr("new title"),
			},
			wantTitle:     "new title",
			wantCompleted: false,
			wantDueDate:   stringPtr("2026-05-10"),
		},
		{
			name: "completedだけ指定した場合はcompletedだけ更新する",
			initialTask: model.Task{
				Title:     "task",
				Completed: false,
				DueDate:   stringPtr("2026-05-10"),
			},
			input: UpdateTaskInput{
				Completed: boolPtr(true),
			},
			wantTitle:     "task",
			wantCompleted: true,
			wantDueDate:   stringPtr("2026-05-10"),
		},
		{
			name: "dueDateだけ指定した場合はdueDateだけ更新する",
			initialTask: model.Task{
				Title:     "task",
				Completed: false,
				DueDate:   stringPtr("2026-05-10"),
			},
			input: UpdateTaskInput{
				DueDateSet: true,
				DueDate:    stringPtr("2026-05-11"),
			},
			wantTitle:     "task",
			wantCompleted: false,
			wantDueDate:   stringPtr("2026-05-11"),
		},
		{
			name: "dueDate未指定の場合は既存値を維持する",
			initialTask: model.Task{
				Title:     "task",
				Completed: false,
				DueDate:   stringPtr("2026-05-10"),
			},
			input:         UpdateTaskInput{},
			wantTitle:     "task",
			wantCompleted: false,
			wantDueDate:   stringPtr("2026-05-10"),
		},
		{
			name: "dueDateにnilを指定した場合は期限を削除する",
			initialTask: model.Task{
				Title:     "task",
				Completed: false,
				DueDate:   stringPtr("2026-05-10"),
			},
			input: UpdateTaskInput{
				DueDateSet: true,
				DueDate:    nil,
			},
			wantTitle:     "task",
			wantCompleted: false,
			wantDueDate:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			task := tt.initialTask

			applyUpdateTaskInput(&task, tt.input)

			if task.Title != tt.wantTitle {
				t.Fatalf("expected title %q, got %q", tt.wantTitle, task.Title)
			}
			if task.Completed != tt.wantCompleted {
				t.Fatalf("expected completed %v, got %v", tt.wantCompleted, task.Completed)
			}
			if !equalStringPtr(task.DueDate, tt.wantDueDate) {
				t.Fatalf("expected due date %#v, got %#v", tt.wantDueDate, task.DueDate)
			}
		})
	}
}

func TestTaskServiceUpdateTask(t *testing.T) {
	findErr := errors.New("find failed")
	updateErr := errors.New("update failed")

	tests := []struct {
		name             string
		repo             *fakeTaskRepository
		input            UpdateTaskInput
		wantAPIErrorCode string
		wantErr          error
		wantFindCalled   bool
		wantUpdateCalled bool
	}{
		{
			name: "有効な入力の場合はtaskを取得して更新する",
			repo: &fakeTaskRepository{
				task: &model.Task{
					Title:  "old title",
					UserID: 2,
				},
			},
			input:            UpdateTaskInput{Title: stringPtr("new title")},
			wantFindCalled:   true,
			wantUpdateCalled: true,
		},
		{
			name:             "更新対象がない場合はrepositoryへアクセスせずINVALID_REQUESTを返す",
			repo:             &fakeTaskRepository{},
			input:            UpdateTaskInput{},
			wantAPIErrorCode: apperror.CodeInvalidRequest,
			wantFindCalled:   false,
			wantUpdateCalled: false,
		},
		{
			name: "taskが見つからない場合は更新せずNOT_FOUNDを返す",
			repo: &fakeTaskRepository{
				findErr: gorm.ErrRecordNotFound,
			},
			input:            UpdateTaskInput{Title: stringPtr("new title")},
			wantAPIErrorCode: apperror.CodeNotFound,
			wantFindCalled:   true,
			wantUpdateCalled: false,
		},
		{
			name: "取得時のrepository errorは更新せずそのまま返す",
			repo: &fakeTaskRepository{
				findErr: findErr,
			},
			input:            UpdateTaskInput{Title: stringPtr("new title")},
			wantErr:          findErr,
			wantFindCalled:   true,
			wantUpdateCalled: false,
		},
		{
			name: "更新時のrepository errorはそのまま返す",
			repo: &fakeTaskRepository{
				task: &model.Task{
					Title:  "old title",
					UserID: 2,
				},
				updateErr: updateErr,
			},
			input:            UpdateTaskInput{Title: stringPtr("new title")},
			wantErr:          updateErr,
			wantFindCalled:   true,
			wantUpdateCalled: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			service := &TaskService{Repo: tt.repo}

			_, err := service.UpdateTask(1, 2, tt.input)

			if tt.wantAPIErrorCode == "" && tt.wantErr == nil && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
			if tt.wantAPIErrorCode != "" {
				assertAPIErrorCode(t, err, tt.wantAPIErrorCode)
			}
			if tt.wantErr != nil && !errors.Is(err, tt.wantErr) {
				t.Fatalf("expected error %v, got %v", tt.wantErr, err)
			}
			if tt.repo.findCalled != tt.wantFindCalled {
				t.Fatalf("expected repository find called=%v, got %v", tt.wantFindCalled, tt.repo.findCalled)
			}
			if tt.wantFindCalled && (tt.repo.findID != 1 || tt.repo.findUserID != 2) {
				t.Fatalf("expected find id=1 userID=2, got id=%d userID=%d", tt.repo.findID, tt.repo.findUserID)
			}
			if tt.repo.updateCalled != tt.wantUpdateCalled {
				t.Fatalf("expected repository update called=%v, got %v", tt.wantUpdateCalled, tt.repo.updateCalled)
			}
		})
	}
}

func assertAPIErrorCode(t *testing.T, err error, code string) {
	t.Helper()

	apiErr, ok := err.(*apperror.APIError)
	if !ok {
		t.Fatalf("expected APIError, got %T", err)
	}
	if apiErr.Code != code {
		t.Fatalf("expected error code %s, got %s", code, apiErr.Code)
	}
}

func stringPtr(value string) *string {
	return &value
}

func boolPtr(value bool) *bool {
	return &value
}

func equalStringPtr(a *string, b *string) bool {
	if a == nil || b == nil {
		return a == b
	}

	return *a == *b
}
