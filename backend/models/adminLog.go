package models

import (
	"time"

	"github.com/google/uuid"
)

type AdminLog struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	AdminID   uuid.UUID `gorm:"type:uuid;not null" json:"admin_id"`
	Action    string    `gorm:"type:varchar(255);not null;default:''" json:"action"`
	Endpoint  string    `gorm:"type:varchar(255);not null;default:''" json:"endpoint"`
	CreatedAt time.Time `gorm:"autoCreateTime;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (AdminLog) TableName() string {
	return "admin_logs"
}
