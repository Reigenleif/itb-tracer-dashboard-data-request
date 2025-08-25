package controllers

import (
	"grad_deploy/initializers"
	"grad_deploy/tools"
	"net/http"

	"github.com/gin-gonic/gin"
)

// PostSQLPreview handles SQL preview requests and returns the result as a JSON table
func PostSQLPreview(c *gin.Context) {
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

	// Build table: header + rows
	table := make([][]interface{}, 0)
	header := make([]interface{}, len(cols))
	for i, col := range cols {
		header[i] = col
	}
	table = append(table, header)

	// Prepare row placeholders
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
		row := make([]interface{}, len(cols))
		for i, val := range values {
			row[i] = val
		}
		table = append(table, row)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"table": table})
}
