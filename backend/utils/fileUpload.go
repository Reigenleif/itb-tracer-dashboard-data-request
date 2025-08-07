package utils

import (
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func HandleFileUpload(c *gin.Context, file *multipart.FileHeader, path string) (string, error) {
	// Generate unique file name
	fileName := uuid.New().String() + filepath.Ext(file.Filename)
	// Storage name in server (ex, folder 'uploads')
	uploadPath := filepath.Join("uploads", path, fileName)
	// Simpan file di server
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		return "", err
	}
	// Return URL from uploaded file
	return "/uploads" + path + fileName, nil
}

func DeleteFile(filePath string) error {
	hostname := os.Getenv("HOSTNAME")

	// Remove file from storage
	if err := os.Remove(strings.TrimPrefix(filePath, hostname+"/")); err != nil {
		return err
	}

	return nil
}
