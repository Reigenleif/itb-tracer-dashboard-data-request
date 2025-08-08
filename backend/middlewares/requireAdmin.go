package middlewares

import (
	"fmt"
	"grad_deploy/initializers"
	"grad_deploy/models"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RequireAdmin(c *gin.Context) {
	// Get the Authorization header from the request
	tokenString := c.GetHeader("Authorization")

	// Check if the Authorization header is present
	if tokenString == "" {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// Token is usually sent as "Bearer <token>", so we split to get the actual token
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	// Decode/validate it
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
		return []byte(os.Getenv("SECRET")), nil
	})
	log.Println("err", err)
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		// Check the exp
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// Find the user with token sub
		var user models.User
		err := initializers.DB.Where("email = ?", claims["email"]).First(&user).Error

		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if user.Role != "ADMIN" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "This user is not an admin", "details": err.Error()})
			return
		}
		// Attach to req
		c.Set("user", user)
		// Log the admin action
		logEntry := models.AdminLog{
			ID:        uuid.New(),
			AdminID:   user.ID,
			Action:    c.Request.Method,
			Endpoint:  c.Request.URL.Path,
			CreatedAt: time.Now(),
		}

		initializers.DB.Create(&logEntry)
		// continue
		c.Next()
	} else {
		c.AbortWithStatus(http.StatusUnauthorized)
	}
}
