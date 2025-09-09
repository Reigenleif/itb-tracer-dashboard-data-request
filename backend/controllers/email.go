package controllers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"grad_deploy/utils"
	"log"
)

// All values will be parsed from form-data, not from requestBody struct

// PostEmail handles the request to send an email with CSV data link
func PostEmail(c *gin.Context) {
	   // Parse and validate form-data fields
	   target := c.PostForm("target")
	   if target == "" {
		   c.JSON(http.StatusBadRequest, gin.H{"error": "target (email) is required"})
		   return
	   }
	   // Optionally: validate email format here if needed

	   body := c.PostForm("body")
	   if body == "" {
		   body = "Data Anda telah siap untuk diunduh. Silakan klik tautan di bawah ini untuk mengunduh data Anda:\n"
	   }

	   subject := c.PostForm("subject")
	   if subject == "" {
		   subject = "Permintaan Data Tracer Selesai"
	   }

	   requestID := c.PostForm("request_id")
	   if requestID == "" {
		   c.JSON(http.StatusBadRequest, gin.H{"error": "request_id is required"})
		   return
	   }

	   includeResults := c.PostForm("include_results") == "true"
	   resultFormat := c.PostForm("result_format")
	   if includeResults && resultFormat == "" {
		   c.JSON(http.StatusBadRequest, gin.H{"error": "result_format is required when include_results is true"})
		   return
	   }

	   csvID := c.PostForm("csv_id")

	   // Get base URL from environment
	   baseURL := os.Getenv("BASE_URL")
	   if baseURL == "" {
		   c.JSON(http.StatusInternalServerError, gin.H{"error": "BASE_URL not configured"})
		   return
	   }

	   // Determine download link and attachments
	//    var csvLink string
	   var attachments []string
	   if csvID != "" {
		//    csvLink = baseURL + "/sql/" + csvID
	   } else {
		   file, err := c.FormFile("file")
		   if err != nil {
			   c.JSON(http.StatusBadRequest, gin.H{"error": "Either csv_id or file must be provided"})
			   return
		   }
		   linkPath, err := utils.HandleFileUpload(c, file, "/emailAttachments")
		   if err != nil {
			   c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
			   return
		   }
		//    csvLink = baseURL + linkPath
		   attachments = []string{"." + linkPath}
	   }

	   emailData := utils.EmailData{
		   To:          target,
		   Subject:     subject,
		//    URL:         csvLink,
		   Body:        body,
		   Attachments: attachments,
	   }

	   if err := utils.SendEmail(emailData); err != nil {
		log.Printf("%v", err)
		   c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		   return
	   }

	   c.JSON(http.StatusOK, gin.H{"message": "Email sent successfully"})
}
