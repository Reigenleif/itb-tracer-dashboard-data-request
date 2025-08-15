package controllers

import (
    "net/http"
    "os"

    "github.com/gin-gonic/gin"
    "grad_deploy/initializers" // Add this import, replace with actual path
)

func GetTableInfo(c *gin.Context) {
    tableName := os.Getenv("FIXED_TABLE")
    if tableName == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "FIXED_TABLE env not set"})
        return
    }

    query := `
        SELECT
            a.attname                           AS column_name,
            pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
            a.attnum                            AS ordinal_position
            FROM pg_attribute a
            JOIN pg_class c ON a.attrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relkind IN ('r','v','m')
            AND a.attnum > 0
            AND NOT a.attisdropped
            AND c.relname = $1
            ORDER BY a.attnum;
    `

    var columns []struct {
        ColumnName string `db:"column_name" json:"column_name"`
        DataType   string `db:"data_type" json:"data_type"`
    }

    err := initializers.DB.Raw(query, tableName).Scan(&columns).Error
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch columns", "details": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"columns": columns})
}