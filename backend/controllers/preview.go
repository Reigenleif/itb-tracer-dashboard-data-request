package controllers

import (
	"grad_deploy/initializers"
	"grad_deploy/tools"
	"net/http"
	"log"
	"strings"
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

	log.Printf("Received SQL preview request: %s", body.SQL)
	if !tools.IsSelectOnly(body.SQL) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only SELECT statements are allowed"})
		return
	}

	// Execute query
	rows, err := initializers.DB.Raw(body.SQL).Rows()
	if err != nil {
	       // Custom error handling for missing table
	       errMsg := err.Error()
	       if strings.Contains(errMsg, "ERROR: relation ") && strings.Contains(errMsg, "does not exist (SQLSTATE 42P01)") {
		       // Extract table name
		       start := strings.Index(errMsg, "\"")
		       end := strings.Index(errMsg[start+1:], "\"")
		       tableName := "unknown"
		       if start != -1 && end != -1 {
			       tableName = errMsg[start+1 : start+1+end]
		       }
		       c.JSON(http.StatusInternalServerError, gin.H{"error": "ERROR : table \"" + tableName + "\" does not exist"})
	       } else {
		       c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
	       }
		return
	}

	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
	       // Custom error handling for missing table
	       errMsg := err.Error()
	       if strings.Contains(errMsg, "ERROR: relation ") && strings.Contains(errMsg, "does not exist (SQLSTATE 42P01)") {
		       start := strings.Index(errMsg, "\"")
		       end := strings.Index(errMsg[start+1:], "\"")
		       tableName := "unknown"
		       if start != -1 && end != -1 {
			       tableName = errMsg[start+1 : start+1+end]
		       }
		       c.JSON(http.StatusInternalServerError, gin.H{"error": "ERROR : table \"" + tableName + "\" does not exist"})
	       } else {
		       c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
	       }
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
		       // Custom error handling for missing table
		       errMsg := err.Error()
		       if strings.Contains(errMsg, "ERROR: relation ") && strings.Contains(errMsg, "does not exist (SQLSTATE 42P01)") {
			       start := strings.Index(errMsg, "\"")
			       end := strings.Index(errMsg[start+1:], "\"")
			       tableName := "unknown"
			       if start != -1 && end != -1 {
				       tableName = errMsg[start+1 : start+1+end]
			       }
			       c.JSON(http.StatusInternalServerError, gin.H{"error": "ERROR : table \"" + tableName + "\" does not exist"})
		       } else {
			       c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		       }
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
