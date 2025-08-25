package controllers

import (
	"grad_deploy/initializers"
	"grad_deploy/models"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type NewDataRequestRequest struct {
	Name        string `json:"name" binding:"required"`
	NIM         string `json:"nim" binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Format      string `json:"format" binding:"required"`
	Purpose     string `json:"purpose" binding:"required"`
	YearFrom    int    `json:"year_from"`
	YearTo      int    `json:"year_to"`
	Table       string `json:"table"`
	Columns     string `json:"columns" `
	SQLQuery    string `json:"sql_query"`
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
		YearFrom:    req.YearFrom,
		YearTo:      req.YearTo,
		Table:       req.Table,
		Columns:     req.Columns,
		SQLQuery:    req.SQLQuery,
	}

	if err := initializers.FlowDB.Create(&dataRequest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create data request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data request created successfully", "data": dataRequest})
}

type NewSimpleDataRequestRequest struct {
	Name        string   `json:"name" binding:"required"`
	NIM         string   `json:"nim" binding:"required"`
	PhoneNumber string   `json:"phone_number" binding:"required"`
	Email       string   `json:"email" binding:"required,email"`
	Format      string   `json:"format" binding:"required"`
	Purpose     string   `json:"purpose" binding:"required"`
	Select      []string `json:"select" binding:"required"`
	Where       []string `json:"where"`
	Limit       int      `json:"limit"`
	OrderBy     []string `json:"order_by"`
}

func NewSimpleDataRequest(c *gin.Context) {
	var req NewSimpleDataRequestRequest

	// Bind JSON input
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the fixed table name from environment
	tableName := os.Getenv("FIXED_TABLE")
	if tableName == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "FIXED_TABLE not set in environment"})
		return
	}

	// Construct SQL query
	query := "SELECT " + strings.Join(req.Select, ", ") + " FROM " + tableName

	// Add WHERE clause if provided
	if len(req.Where) > 0 {
		query += " WHERE " + strings.Join(req.Where, " AND ")
	}

	// Add ORDER BY clause if provided
	if len(req.OrderBy) > 0 {
		query += " ORDER BY " + strings.Join(req.OrderBy, ", ")
	}

	// Add LIMIT clause if provided
	if req.Limit > 0 {
		query += " LIMIT " + strconv.Itoa(req.Limit)
	}

	// Create new data request
	dataRequest := models.DataRequest{
		Name:        req.Name,
		NIM:         req.NIM,
		PhoneNumber: req.PhoneNumber,
		Email:       req.Email,
		Format:      req.Format,
		Purpose:     req.Purpose,
		Table:       tableName,
		SQLQuery:    query,
	}

	if err := initializers.FlowDB.Create(&dataRequest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create data request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data request created successfully", "data": dataRequest})
}

/* Example JSON input for NewSimpleDataRequest:
{
	"name": "John Doe",
	"nim": "123456789",
	"phone_number": "08123456789",
	"email": "john.doe@example.com",
	"format": "CSV",
	"purpose": "Research",
	"select": ["id", "name", "year"],
	"where": ["year > 2020", "department = 'Computer Science'"],
	"limit": 100,
	"order_by": ["year DESC", "name ASC"]
}
*/

func GetAllDataRequests(c *gin.Context) {
	var dataRequests []models.DataRequest

	// Fetch all data requests
	if err := initializers.FlowDB.Find(&dataRequests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data requests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data_requests": dataRequests})
}

type GetFilteredDataRequestsRequest struct {
	SearchQuery string `form:"search_query"`
	SortBy      string `form:"sort_by"`
	Page        int    `form:"page" binding:"omitempty,min=1"`
	Limit       int    `form:"limit" binding:"omitempty,min=1,max=100"`
}

func GetFilteredDataRequests(c *gin.Context) {
	var req GetFilteredDataRequestsRequest

	// Binding
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var dataRequests []models.DataRequest

	// Case Guard Query
	query := initializers.FlowDB.Model(&models.DataRequest{})

	if req.SearchQuery != "" {
		query = query.Where("name ILIKE ? OR nim ILIKE ? OR email ILIKE ?", "%"+req.SearchQuery+"%", "%"+req.SearchQuery+"%", "%"+req.SearchQuery+"%")
	}

	if req.SortBy != "" {
		query = query.Order(req.SortBy)
	} else {
		query = query.Order("created_at DESC") // Default sorting by created_at
	}

	// Apply pagination if specified
	if req.Page > 0 && req.Limit > 0 {
		offset := (req.Page - 1) * req.Limit
		query = query.Offset(offset).Limit(req.Limit)
	}

	// Execute the query
	if err := query.Find(&dataRequests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data requests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data_requests": dataRequests})
}

func GetDataRequestByID(c *gin.Context) {
	id := c.Param("id")
	var dataRequest models.DataRequest

	if err := initializers.FlowDB.First(&dataRequest, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data request not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data_request": dataRequest})
}

func DeleteDataRequestByID(c *gin.Context) {
	id := c.Param("id")
	var dataRequest models.DataRequest

	if err := initializers.FlowDB.First(&dataRequest, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data request not found"})
		return
	}
}

func UpdateDataRequestByID(c *gin.Context) {
	id := c.Param("id")
	var dataRequest models.DataRequest
	if err := initializers.FlowDB.First(&dataRequest, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data request not found"})
		return
	}

	var req NewDataRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Prepare data for update
	dataRequest.Name = req.Name
	dataRequest.NIM = req.NIM
	dataRequest.PhoneNumber = req.PhoneNumber
	dataRequest.Email = req.Email
	dataRequest.Format = req.Format
	dataRequest.Purpose = req.Purpose
	dataRequest.YearFrom = req.YearFrom
	dataRequest.YearTo = req.YearTo
	dataRequest.Table = req.Table
	dataRequest.Columns = req.Columns
	dataRequest.SQLQuery = req.SQLQuery

	// Query
	if err := initializers.FlowDB.Save(&dataRequest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update data request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data request updated successfully", "data": dataRequest})
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
