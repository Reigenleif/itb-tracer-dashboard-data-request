package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Name              string     `gorm:"not null" json:"name"`
	Email             string     `gorm:"unique;not null" json:"email"`
	Role              string     `gorm:"default:USER" json:"role"`
	Password          string     `json:"-"`
	VerifiedAt        *time.Time `gorm:"default:null" json:"verified_at"`
	VerificationToken *uuid.UUID `gorm:"default:null" json:"verification_token"`
}
