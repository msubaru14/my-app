package apperror

import "net/http"

// エラーレスポンス
type APIError struct {
	Code    string        `json:"code"`
	Message string        `json:"message"`
	Details []ErrorDetail `json:"details,omitempty"`
}

// エラー詳細
type ErrorDetail struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

func MapErrorCodeToStatus(code string) int {
	switch code {
	case CodeInvalidRequest, CodeValidationError:
		return http.StatusBadRequest
	case CodeUnauthorized:
		return http.StatusUnauthorized
	case CodeNotFound:
		return http.StatusNotFound
	case CodeInternalServerError:
		return http.StatusInternalServerError
	default:
		return http.StatusInternalServerError
	}
}

// NOT_FOUND生成
func NewNotFound(message string) error {
	return &APIError{
		Code:    CodeNotFound,
		Message: message,
	}
}

// バリデーションエラー生成
func NewValidationError(message string, detail []ErrorDetail) error {
	return &APIError{
		Code:    CodeValidationError,
		Message: message,
		Details: detail,
	}
}

func (e *APIError) Error() string {
	return e.Message
}
