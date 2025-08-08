package models

import "time"

// EmailHistory represents a record of an email send attempt.
type EmailHistory struct {
	ID           uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	From         string     `gorm:"size:255;not null" json:"from"`
	To           string     `gorm:"size:255;not null" json:"to"`
	Subject      string     `gorm:"size:255" json:"subject"`
	Body         string     `gorm:"type:text" json:"body"`
	Status       string     `gorm:"size:50;not null" json:"status"` // e.g. "queued", "sent", "failed"
	ErrorMessage string     `gorm:"type:text" json:"error_message,omitempty"`
	RetryCount   int        `gorm:"default:0" json:"retry_count"`
	SentAt       *time.Time `json:"sent_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
