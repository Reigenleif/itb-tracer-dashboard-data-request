package controllers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"grad_deploy/utils"
)

// requestBody holds form fields for email
type requestBody struct {
	Target         string `form:"target" binding:"required,email"`
	Body           string `form:"body" binding:"required"`
	Subject        string `form:"subject" binding:"required"`
	RequestID      int    `form:"request_id" binding:"required"`
	IncludeResults bool   `form:"include_results"`
	ResultFormat   string `form:"result_format" binding:"omitempty,oneof=csv json excel"`
	CsvID          string `form:"csv_id"`
}

// PostEmail handles the request to send an email with CSV data link
func PostEmail(c *gin.Context) {
	var req requestBody
	// bind form fields (multipart/form-data)
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get base URL from environment
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "BASE_URL not configured"})
		return
	}

	// After binding, validate fields
	if req.RequestID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "request_id is required"})
		return
	}
	if req.IncludeResults && req.ResultFormat == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "result_format is required when include_results is true"})
		return
	}
	// Determine download link
	var csvLink string
	if req.CsvID != "" {
		csvLink = baseURL + "/sql/" + req.CsvID
	} else {
		// handle file upload using util
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Either csv_id or file must be provided"})
			return
		}
		// utilize HandleFileUpload to store file and get relative path
		linkPath, err := utils.HandleFileUpload(c, file, "emailAttachments")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
			return
		}
		csvLink = baseURL + linkPath
	}

	// Create email content
	subject := "Permintaan Data Tracer Selesai"
	if req.Subject != "" {
		subject = req.Subject
	}
	url := csvLink
	body := "Data Anda telah siap untuk diunduh. Silakan klik tautan di bawah ini untuk mengunduh data Anda:\n"
	if req.Body != "" {
		body = req.Body
	}

	// Use the sendEmail function from utils package

	emailData := utils.EmailData{
		To:      req.Target,
		Subject: subject,
		URL:     url,
		Body:    body,
	}

	if err := utils.SendEmail(emailData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Email sent successfully"})
}
