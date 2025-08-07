package initializers

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB
var FlowDB *gorm.DB
// 
// var DB_REQ *gorm.DB

// func ConnectToDbReq() {
// 	var err error

// 	dsn := fmt.Sprintf(
// 		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
// 		os.Getenv("REQ_HOST"),
// 		os.Getenv("REQ_USER"),
// 		os.Getenv("REQ_PASSWORD"),
// 		os.Getenv("REQ_DB"),
// 		os.Getenv("REQ_PORT"),
// 		os.Getenv("REQ_SSL_MODE"),
// 	)
// 	DB_REQ, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

// 	if err != nil {
// 		panic("Failed connect to db")
// 	}
// }

func ConnectToDb() {
	var err error

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_DB"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_SSL_MODE"),
	)

	maxRetries := 10
	for attempt := 1; attempt <= maxRetries; attempt++ {
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}

		fmt.Printf("Attempt %d: Failed to connect to DB. Retrying in 3 seconds...\n", attempt)
		time.Sleep(300 * time.Millisecond)
	}

	if err != nil {
		panic("🌩️ Alas! Could not connect to the database after many hopeful tries.")
	}
	// Execute raw SQL to create the uuid-ossp extension
	err = DB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error
	if err != nil {
		panic("Failed to create uuid-ossp extension")
	}

	dsnFlow := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		os.Getenv("FLOW_POSTGRES_HOST"),
		os.Getenv("FLOW_POSTGRES_USER"),
		os.Getenv("FLOW_POSTGRES_PASSWORD"),
		os.Getenv("FLOW_POSTGRES_DB"),
		os.Getenv("FLOW_POSTGRES_PORT"),
		os.Getenv("FLOW_POSTGRES_SSL_MODE"),
	)

	maxRetriesFlow := 10
	for attempt := 1; attempt <= maxRetriesFlow; attempt++ {
		FlowDB, err = gorm.Open(postgres.Open(dsnFlow), &gorm.Config{})
		if err == nil {
			break
		}

		fmt.Printf("Attempt %d: Failed to connect to Flow DB. Retrying in 3 seconds...\n", attempt)
		time.Sleep(300 * time.Millisecond)
	}
	if err != nil {
		panic("🌩️ Alas! Could not connect to the Flow database after many hopeful tries.")
	}
	// Execute raw SQL to create the uuid-ossp extension for FlowDB
	err = FlowDB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error
	if err != nil {
		panic("Failed to create uuid-ossp extension for FlowDB")
	}
	fmt.Println("🌟 Successfully connected to the databases! Ready to roll! 🚀")

}
