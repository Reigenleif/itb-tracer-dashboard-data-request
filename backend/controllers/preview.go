package controllers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "grad_deploy/initializers"
    "grad_deploy/tools"
)

func PostPreview(c *gin.Context) {
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

    c.JSON(http.StatusOK, gin.H{
        "data":  rows,
        "cols":  cols,
    })
}