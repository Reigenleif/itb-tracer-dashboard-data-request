package utils

import (
	"bytes"
	"html/template"
	"log"
	"os"
	"strconv"

	"gopkg.in/gomail.v2"
)

// EmailData holds the data for email template
type EmailData struct {
	To      string
	Subject string
	Body    string
	Name    string
	Button  string
	URL     string
	// Attachments holds file paths to attach to the email
	Attachments []string
}

// SendEmail sends an email using Gomail with a HTML template
func SendEmail(data EmailData) error {
	// Setup email details
	from := os.Getenv("EMAIL_FROM")
	username := os.Getenv("EMAIL_USERNAME")
	password := os.Getenv("EMAIL_PASSWORD")
	host := os.Getenv("EMAIL_HOST")
	port := os.Getenv("EMAIL_PORT")

	portInt, err := strconv.Atoi(port)
	if err != nil {
		log.Printf("Invalid port: %v", err)
		return err
	}

	// Parse the email template
	tmpl, err := template.ParseFiles("./utils/template/email.html")
	if err != nil {
		log.Printf("Error parsing template: %v", err)
		return err
	}

	// Prepare the body using the template
	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		log.Printf("Error executing template: %v", err)
		return err
	}

	// Setup Gomail
	mailer := gomail.NewMessage()
	mailer.SetHeader("From", from)
	mailer.SetHeader("To", data.To)
	mailer.SetHeader("Subject", data.Subject)
	mailer.SetBody("text/html", body.String())

	dialer := gomail.NewDialer(host, portInt, username, password)

	// Attach files if any
	for _, fpath := range data.Attachments {
		mailer.Attach(fpath)
	}
	// Send email
	if err := dialer.DialAndSend(mailer); err != nil {
		return err
	}

	return nil
}
