package initializers

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	// Path to .env file
	secretFilePath := "./.env"

	err := godotenv.Load(secretFilePath)

	if err != nil {
		log.Fatal("Error loading .env file" + err.Error())
	}
}
