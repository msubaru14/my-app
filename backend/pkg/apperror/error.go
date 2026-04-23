package apperror

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

// NOT_FOUND生成
func NewNotFound(message string) error {
	return &APIError{
		Code:    CodeNotFound,
		Message: message,
	}
}

func (e *APIError) Error() string {
	return e.Message
}
