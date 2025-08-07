package controllers

import (
    "fmt"
    "log"
    "net/http"
    "net/smtp"
    "os"

    "github.com/gin-gonic/gin"    
)

type requestBody struct {
    Target string `json:"target" binding:"required,email"`
    CsvID  string `json:"csv_id" binding:"required"`
}

func PostEmail(c *gin.Context) {
    var req requestBody
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // 2. Build email parameters
    baseURL := os.Getenv("BASE_URL")
    if baseURL == "" {
        log.Println("BASE_URL is not set")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error"})
        return
    }
    subject := "Tracer Study Data Request"
    body := fmt.Sprintf("Please access the requested data here:\n\n%s/sql/%s", baseURL, req.CsvID)
    message := []byte(
        fmt.Sprintf("Subject: %s\r\n\r\n%s\r\n", subject, body),
    )

    // 3. SMTP configuration (from env)
    smtpHost := os.Getenv("SMTP_HOST")   // e.g. "smtp.gmail.com"
    smtpPort := os.Getenv("SMTP_PORT")   // e.g. "587"
    smtpUser := os.Getenv("SMTP_EMAIL")  // sender address
    smtpPass := os.Getenv("SMTP_PASS")   // smtp password or app password

    if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
        log.Println("SMTP configuration incomplete")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Mail server not configured"})
        return
    }

    // 4. Send the email
    auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
    addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
    if err := smtp.SendMail(addr, auth, smtpUser, []string{req.Target}, message); err != nil {
        log.Printf("Failed to send email: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
        return
    }

    // 5. Respond success
    c.JSON(http.StatusOK, gin.H{"status": "Email sent"})
}
