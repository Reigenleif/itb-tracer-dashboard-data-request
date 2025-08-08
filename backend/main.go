package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	"grad_deploy/controllers"
	"grad_deploy/initializers"
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
	r.POST("/sql", controllers.PostSQL)
	r.GET("/sql/:name", controllers.GetSQL)
	r.POST("/email", controllers.PostEmail)
	// r.GET("/request-history", controllers.GetRequestHistory)
	r.Group("/data-requests").
		POST("/", controllers.NewDataRequest).
		GET("/", controllers.GetAllDataRequests).
		GET("/filter", controllers.GetFilteredDataRequests)
	r.GET("/data-requests/:id", controllers.GetDataRequestByID)
	r.PUT("/data-requests/:id", controllers.UpdateDataRequestByID)
	r.DELETE("/data-requests/:id", controllers.DeleteDataRequestByID)

	log.Fatal(r.Run())
}
