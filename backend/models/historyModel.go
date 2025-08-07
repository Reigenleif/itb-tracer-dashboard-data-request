package models

import (
	"time"

	"github.com/google/uuid"
)

type RequestHistory struct {
	ID                uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	SQL               string     `gorm:"not null" json:"sql"`
    Date              time.Time  `gorm:"not null" json:"date"`
}
