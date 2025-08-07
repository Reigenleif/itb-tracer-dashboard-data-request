package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
    "grad_deploy/initializers"
    "grad_deploy/tools"
	"grad_deploy/models"
)

var jwtSecret string

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}


func Login(c *gin.Context) {
	var req LoginRequest

	// Bind JSON input
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

    // Check if the user exists
	var user models.User
	if err := initializers.FlowDB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check password
	if !tools.CheckPassword(user.Password, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}


    
    claims := tools.UserClaims{
        Id : user.ID,
		Email: user.Email,
		Role: user.Role,
	}

	// Create JWT token
	token, err := tools.NewAccessToken(claims)
	if token == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}


	// On success: return a token or session (simplified here)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"email":   req.Email,
		"token":   token,
		"role":    user.Role,
		"id":      user.ID,
	})
}