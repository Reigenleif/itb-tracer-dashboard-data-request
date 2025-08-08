package controllers

import (
	"fmt"
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
	subject := "Your Requested Data is Ready"
	body := fmt.Sprintf(`Dear User,

We are pleased to inform you that your requested data is now available for download.

You can access your data by visiting the following link:
%s

This link will provide access to the CSV file you requested.

If you have any questions or need further assistance, please don't hesitate to contact our support team.

Thank you for using our service.

Best regards,
The Data Request Team
`, csvLink)

	// Use the sendEmail function from utils package

	emailData := utils.EmailData{
		To:      req.Target,
		Subject: subject,
		Body:    body,
	}

	if err := utils.SendEmail(emailData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Email sent successfully"})
}
