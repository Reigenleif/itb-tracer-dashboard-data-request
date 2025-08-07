package initializers

import "grad_deploy/models"


func SyncDatabase() {
	FlowDB.AutoMigrate(&models.RequestHistory{},
        &models.User{},
        &models.DataRequest{},
    )
}

