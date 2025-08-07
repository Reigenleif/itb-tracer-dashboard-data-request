package controllers

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "grad_deploy/models"
    "grad_deploy/initializers"
)

// GetRequestHistory handles GET /request_histories
// Optional query parameters:
//   - start_date: inclusive lower bound (format: YYYY-MM-DD or RFC3339)
//   - end_date:   inclusive upper bound (format: YYYY-MM-DD or RFC3339)
func GetRequestHistory(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Retrieve query parameters
        startParam := c.Query("start_date")
        endParam := c.Query("end_date")

        // Prepare a slice to hold the results
        var histories []models.RequestHistory

        // Begin building the GORM query
        query := initializers.FlowDB.Model(&models.RequestHistory{})

        // Parse and apply start_date filter if provided
        if startParam != "" {
            startTime, err := time.Parse(time.RFC3339, startParam)
            if err != nil {
                // Fallback to simple date-only parsing (YYYY-MM-DD)
                parsed, err2 := time.Parse("2006-01-02", startParam)
                if err2 != nil {
                    c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format"})
                    return
                }
                startTime = parsed
            }
            query = query.Where("date >= ?", startTime)
        }

        // Parse and apply end_date filter if provided
        if endParam != "" {
            endTime, err := time.Parse(time.RFC3339, endParam)
            if err != nil {
                // Fallback to simple date-only parsing (YYYY-MM-DD)
                parsed, err2 := time.Parse("2006-01-02", endParam)
                if err2 != nil {
                    c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format"})
                    return
                }
                endTime = parsed
            }
            // If you want to include the entire day for YYYY-MM-DD, you can add 23:59:59
            // endTime = endTime.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
            query = query.Where("date <= ?", endTime)
        }

        // Execute the query
        if err := query.Order("date ASC").Find(&histories).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch request history"})
            return
        }

        // Return the JSON response
        c.JSON(http.StatusOK, histories)
    }
}