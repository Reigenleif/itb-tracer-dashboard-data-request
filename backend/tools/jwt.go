package tools
import (
	"log"
	"os"
	"strings"
	"errors"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
)

type UserClaims struct {
	Id    uuid.UUID `json:"id"`
    Email string `json:"email"`
    Role  string `json:"role"`
	jwt.StandardClaims
}


func CheckToken(token string) (*UserClaims, error) {
	uc, err := parseAccessToken(token)

	if err != nil {
		return nil, errors.New("invalid token")
	}

	return uc, nil
}

func NewAccessToken(claims UserClaims) (string, error) {
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return accessToken.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func valid(authorization []string) bool {
	if len(authorization) < 1 {
		return false
	}
	token := strings.TrimPrefix(authorization[0], "Bearer ")

	uc, err := parseAccessToken(token)

	if err != nil {
		log.Print(err)
		return false
	}

	if uc.StandardClaims.Valid() != nil {
		return false
	}

	return true
}

func parseAccessToken(accessToken string) (*UserClaims, error) {
	parsedAccessToken, _ := jwt.ParseWithClaims(accessToken, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if parsedAccessToken == nil {
		return nil, errors.New("invalid token")
	}

	return parsedAccessToken.Claims.(*UserClaims), nil
}

// func NewRefreshToken(claims jwt.StandardClaims) (string, error) {
//  refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

//  return refreshToken.SignedString([]byte(os.Getenv("TOKEN_SECRET")))
// }

// func ParseRefreshToken(refreshToken string) *jwt.StandardClaims {
//  parsedRefreshToken, _ := jwt.ParseWithClaims(refreshToken, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
//   return []byte(os.Getenv("TOKEN_SECRET")), nil
//  })

//  return parsedRefreshToken.Claims.(*jwt.StandardClaims)
// }
