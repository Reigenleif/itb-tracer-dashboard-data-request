package tools

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword takes a plain text password and returns the bcrypt hashed version
func HashPassword(password string) (string, error) {
	// bcrypt.DefaultCost is good (currently = 10), you can use higher for stronger security
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

// CheckPassword compares a hashed password with a plain text one
func CheckPassword(hashedPassword, plainPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
	return err == nil
}