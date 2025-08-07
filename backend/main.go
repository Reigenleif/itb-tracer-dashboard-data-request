package main

import (
    "log"

    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    _ "github.com/lib/pq"

    "grad_deploy/initializers"
    "grad_deploy/controllers"
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
    r.POST("/data-request", controllers.NewDataRequest)

    log.Fatal(r.Run())
}
                   