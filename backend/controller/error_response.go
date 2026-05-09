package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/msubaru14/my-app-backend/pkg/apperror"
	"github.com/msubaru14/my-app-backend/pkg/response"
)

func respondAPIError(c *gin.Context, apiErr *apperror.APIError) {
	status := apperror.MapErrorCodeToStatus(apiErr.Code)
	response.Error(c, status, *apiErr)
}
