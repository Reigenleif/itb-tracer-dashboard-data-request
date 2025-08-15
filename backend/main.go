package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	"grad_deploy/controllers"
	"grad_deploy/initializers"
	"grad_deploy/middlewares"
)

func main() {
	initializers.LoadEnv()
	initializers.ConnectToDb()
	initializers.SyncDatabase()

	// Konfigurasi CORS dengan withCredentials
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true // Mengizinkan semua origin
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
	config.AllowHeaders = []string{"Content-Type", "Authorization", "Cookie", "Set-Cookie"}
	config.AllowCredentials = true // Mengizinkan penggunaan withCredentials

	r := gin.Default()

	r.Use(cors.New(config))

	r.POST("/login", controllers.Login)
	r.POST("/sql", middlewares.RequireAdmin, controllers.PostSQL)
	r.GET("/sql/:name", controllers.GetSQL)
	r.GET("/table-info", controllers.GetTableInfo)
	r.POST("/email", controllers.PostEmail)
	// r.GET("/request-history", controllers.GetRequestHistory)

	dataRequests := r.Group("/data-requests")
	{
		dataRequests.POST("/", controllers.NewDataRequest)
		dataRequests.GET("/", controllers.GetAllDataRequests)
		dataRequests.GET("/filter", controllers.GetFilteredDataRequests)
		dataRequests.GET("/:id", controllers.GetDataRequestByID)
		dataRequests.PUT("/:id", controllers.UpdateDataRequestByID)
		dataRequests.DELETE("/:id", controllers.DeleteDataRequestByID)
	}

	adminLogs := r.Group("/admin-logs")
	{
		adminLogs.POST("/", controllers.CreateAdminLog)
		adminLogs.GET("/", controllers.GetAdminLogs)
		adminLogs.GET("/:id", controllers.GetAdminLogByID)
		adminLogs.DELETE("/:id", controllers.DeleteAdminLogByID)
		adminLogs.PUT("/:id", controllers.UpdateAdminLogByID)
	}
	


	log.Fatal(r.Run())
}
