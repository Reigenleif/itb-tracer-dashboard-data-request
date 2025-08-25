package models

import "github.com/google/uuid"
import "time"

type DataRequest struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	NIM         string    `gorm:"not null" json:"nim"`
	PhoneNumber string    `gorm:"not null" json:"phone_number"`
	Email       string    `gorm:"not null" json:"email"`
	Format      string    `gorm:"not null" json:"format"`
	Purpose     string    `gorm:"not null" json:"pourpose"`
	Status      string    `gorm:"not null;default:PENDING" json:"status"`

	YearFrom int    `gorm:"" json:"year_from"`
	YearTo   int    `gorm:"" json:"year_to"`
	Table    string `gorm:"" json:"table"`
	Columns  string `gorm:"" json:"columns"`
	Filter   string `gorm:"" json:"filter"`
	SQLQuery string `gorm:"" json:"sql_query"`

	CreatedAt time.Time `gorm:"not null;default:now()" json:"created_at"`
}
