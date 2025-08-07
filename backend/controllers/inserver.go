package controllers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "grad_deploy/models"
    "grad_deploy/initializers"
)

type NewDataRequestRequest struct {
    Name           string `json:"name" binding:"required"`
    NIM            string `json:"nim" binding:"required"`
    PhoneNumber    string `json:"phone_number" binding:"required"`
    Email          string `json:"email" binding:"required,email"`
    Format         string `json:"format" binding:"required"`
    Purpose        string `json:"purpose" binding:"required"`
    YearFrom      int    `json:"year_from"`
    YearTo        int    `json:"year_to"`
    Table         string `json:"table"`
    Columns      string `json:"columns" `
    SQLQuery     string `json:"sql_query"`
}

func NewDataRequest(c *gin.Context) {
    var req NewDataRequestRequest

    // Bind JSON input
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Create new data request
    dataRequest := models.DataRequest{
        Name:        req.Name,
        NIM:         req.NIM,
        PhoneNumber: req.PhoneNumber,
        Email:       req.Email,
        Format:      req.Format,
        Purpose:     req.Purpose,
        YearFrom:   req.YearFrom,
        YearTo:     req.YearTo,
        Table:      req.Table,
        Columns:    req.Columns,
        SQLQuery:   req.SQLQuery,
    }

    if err := initializers.FlowDB.Create(&dataRequest).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create data request"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Data request created successfully", "data": dataRequest})
}

/* Example JSON input:
{
    "name": "John Doe",
    "nim": "123456789",
    "phone_number": "08123456789",
    "email": "aliefamirudin@gmail.com",
    "format": "CSV",
    "purpose": "Research",
    "year_from": 2020,
    "year_to": 2021,
    "table": "students",
    "sql_query": "SELECT * FROM students WHERE year >= 2020 AND year <= 2021"
}
*/