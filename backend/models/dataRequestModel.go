package models

import "github.com/google/uuid"

type DataRequest struct {
	ID             uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Name           string    `gorm:"not null" json:"name"`
	NIM            string    `gorm:"not null" json:"nim"`
	PhoneNumber    string    `gorm:"not null" json:"phone_number"`
	Email          string    `gorm:"not null" json:"email"`
	Format         string    `gorm:"not null" json:"format"`
	Purpose        string    `gorm:"not null" json:"pourpose"`
	Status         string    `gorm:"not null;default:PENDING" json:"status"`

    YearFrom      int       `gorm:"" json:"year_from"`
    YearTo        int       `gorm:"" json:"year_to"`
	Table         string    `gorm:"" json:"table"`
    Columns      string    `gorm:"" json:"columns"`
    SQLQuery     string    `gorm:"" json:"sql_query"`
}
