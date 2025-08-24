package controllers

import (
    "encoding/csv"
    "fmt"
    "net/http"
    "os"
    "path/filepath"
    "time"

    "github.com/gin-gonic/gin"
    "grad_deploy/initializers"
    "grad_deploy/tools"
    "grad_deploy/models"
)

func PostSQL(c *gin.Context) {
    var body struct {
        SQL string `json:"sql" binding:"required"`
    }
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
        return
    }

    if !tools.IsSelectOnly(body.SQL) {
        c.JSON(http.StatusForbidden, gin.H{"error": "Only SELECT statements are allowed"})
        return
    }

    // Execute query
    rows, err := initializers.DB.Raw(body.SQL).Rows() 
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    defer rows.Close()

    cols, err := rows.Columns()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // Prepare CSV file
    name, err := tools.RandomName(16)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate file name"})
        return
    }
    os.MkdirAll("uploads", os.ModePerm)
    path := filepath.Join("uploads", fmt.Sprintf("req-%s.csv", name))
    file, err := os.Create(path)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    defer file.Close()

    writer := csv.NewWriter(file)
    defer writer.Flush()

    // Write header
    if err := writer.Write(cols); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // Write rows
    values := make([]interface{}, len(cols))
    ptrs := make([]interface{}, len(cols))
    for i := range values {
        ptrs[i] = &values[i]
    }
    for rows.Next() {
        if err := rows.Scan(ptrs...); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        record := make([]string, len(cols))
        for i, val := range values {
            if val == nil {
                record[i] = ""
            } else {
                record[i] = fmt.Sprint(val)
            }
        }
        if err := writer.Write(record); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
    }

    // Post to request history
    history := models.RequestHistory{
        SQL: body.SQL,
        Date: time.Now(),
    }

    if err := initializers.FlowDB.Create(&history).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save request history"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"csv_id": name})
}

func GetSQL(c *gin.Context) {
    name := c.Param("name")
    path := filepath.Join("uploads", fmt.Sprintf("req-%s.csv", name))
    if _, err := os.Stat(path); os.IsNotExist(err) {
        c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
        return
    }
    c.FileAttachment(path, filepath.Base(path))
}