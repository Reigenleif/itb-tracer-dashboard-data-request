package controllers

import (
	"grad_deploy/initializers"
	"grad_deploy/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AnalyticsResponse struct {
	TotalRequests     int64                    `json:"total_requests"`
	StatusDistribution map[string]int64       `json:"status_distribution"`
	FormatDistribution map[string]int64       `json:"format_distribution"`
	MonthlyTrends     []MonthlyTrendData      `json:"monthly_trends"`
	RecentRequests    []models.DataRequest    `json:"recent_requests"`
	AverageProcessingTime float64             `json:"average_processing_time_hours"`
	PopularYearRanges []YearRangeData        `json:"popular_year_ranges"`
	DailyTrends       []DailyTrendData       `json:"daily_trends"`
}

type MonthlyTrendData struct {
	Month string `json:"month"`
	Year  int    `json:"year"`
	Count int64  `json:"count"`
}

type DailyTrendData struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type YearRangeData struct {
	YearFrom int   `json:"year_from"`
	YearTo   int   `json:"year_to"`
	Count    int64 `json:"count"`
}

type StatusCount struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

type FormatCount struct {
	Format string `json:"format"`
	Count  int64  `json:"count"`
}

func GetAnalytics(c *gin.Context) {
	var analytics AnalyticsResponse
	
	// Get total requests count
	var totalRequests int64
	if err := initializers.FlowDB.Model(&models.DataRequest{}).Count(&totalRequests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total requests"})
		return
	}
	analytics.TotalRequests = totalRequests

	// Get status distribution
	var statusCounts []StatusCount
	if err := initializers.FlowDB.Model(&models.DataRequest{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&statusCounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch status distribution"})
		return
	}
	
	analytics.StatusDistribution = make(map[string]int64)
	for _, sc := range statusCounts {
		analytics.StatusDistribution[sc.Status] = sc.Count
	}

	// Get format distribution
	var formatCounts []FormatCount
	if err := initializers.FlowDB.Model(&models.DataRequest{}).
		Select("format, COUNT(*) as count").
		Group("format").
		Find(&formatCounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch format distribution"})
		return
	}
	
	analytics.FormatDistribution = make(map[string]int64)
	for _, fc := range formatCounts {
		analytics.FormatDistribution[fc.Format] = fc.Count
	}

	// Get monthly trends (last 12 months)
	var monthlyTrends []MonthlyTrendData
	if err := initializers.FlowDB.Raw(`
		SELECT 
			TO_CHAR(created_at, 'Mon') as month,
			EXTRACT(YEAR FROM created_at)::int as year,
			COUNT(*)::bigint as count
		FROM data_requests 
		WHERE created_at >= NOW() - INTERVAL '12 months'
		GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
		ORDER BY year, EXTRACT(MONTH FROM created_at)
	`).Find(&monthlyTrends).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch monthly trends"})
		return
	}
	analytics.MonthlyTrends = monthlyTrends

	// Get daily trends (last 30 days)
	var dailyTrends []DailyTrendData
	if err := initializers.FlowDB.Raw(`
		SELECT 
			DATE(created_at) as date,
			COUNT(*)::bigint as count
		FROM data_requests 
		WHERE created_at >= NOW() - INTERVAL '30 days'
		GROUP BY DATE(created_at)
		ORDER BY date DESC
	`).Find(&dailyTrends).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch daily trends"})
		return
	}
	analytics.DailyTrends = dailyTrends

	// Get recent requests (last 10)
	var recentRequests []models.DataRequest
	if err := initializers.FlowDB.Order("created_at DESC").Limit(10).Find(&recentRequests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recent requests"})
		return
	}
	analytics.RecentRequests = recentRequests

	// Calculate average processing time (for completed requests)
	var avgProcessingTime float64
	if err := initializers.FlowDB.Raw(`
		SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours
		FROM data_requests 
		WHERE status = 'COMPLETED' AND updated_at > created_at
	`).Scan(&avgProcessingTime).Error; err != nil {
		// If error or no data, set to 0
		avgProcessingTime = 0
	}
	analytics.AverageProcessingTime = avgProcessingTime

	// Get popular year ranges
	var yearRanges []YearRangeData
	if err := initializers.FlowDB.Model(&models.DataRequest{}).
		Select("year_from, year_to, COUNT(*) as count").
		Where("year_from IS NOT NULL AND year_to IS NOT NULL").
		Group("year_from, year_to").
		Order("count DESC").
		Limit(10).
		Find(&yearRanges).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch year ranges"})
		return
	}
	analytics.PopularYearRanges = yearRanges

	c.JSON(http.StatusOK, analytics)
}

// Get analytics with date range filter
type AnalyticsRequestParams struct {
	DateFrom string `form:"date_from"`
	DateTo   string `form:"date_to"`
}

func GetAnalyticsFiltered(c *gin.Context) {
	var params AnalyticsRequestParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var analytics AnalyticsResponse
	query := initializers.FlowDB.Model(&models.DataRequest{})
	
	// Apply date filters if provided
	if params.DateFrom != "" {
		query = query.Where("created_at >= ?", params.DateFrom)
	}
	if params.DateTo != "" {
		query = query.Where("created_at <= ?", params.DateTo)
	}

	// Get total requests count with filters
	var totalRequests int64
	if err := query.Count(&totalRequests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total requests"})
		return
	}
	analytics.TotalRequests = totalRequests

	// Get status distribution with filters
	var statusCounts []StatusCount
	statusQuery := initializers.FlowDB.Model(&models.DataRequest{})
	if params.DateFrom != "" {
		statusQuery = statusQuery.Where("created_at >= ?", params.DateFrom)
	}
	if params.DateTo != "" {
		statusQuery = statusQuery.Where("created_at <= ?", params.DateTo)
	}
	
	if err := statusQuery.Select("status, COUNT(*) as count").
		Group("status").
		Find(&statusCounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch status distribution"})
		return
	}
	
	analytics.StatusDistribution = make(map[string]int64)
	for _, sc := range statusCounts {
		analytics.StatusDistribution[sc.Status] = sc.Count
	}

	c.JSON(http.StatusOK, analytics)
}
