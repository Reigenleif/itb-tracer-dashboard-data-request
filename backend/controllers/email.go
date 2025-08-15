package controllers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"grad_deploy/utils"
)

type requestBody struct {
	Target string `json:"target" binding:"required,email"`
	CsvID  string `json:"csv_id" binding:"required"`
}

// PostEmail handles the request to send an email with CSV data link
func PostEmail(c *gin.Context) {
	var req requestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get base URL from environment
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "BASE_URL not configured"})
		return
	}

	// Construct the CSV download link
	csvLink := baseURL + "/sql/" + req.CsvID

	// Create email content
	subject := "Permintaan Data Tracer Selesai"
	url := csvLink
	body := "Data Anda telah siap untuk diunduh. Silakan klik tautan di bawah ini untuk mengunduh data Anda:\n"

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
