const router = require("express").Router()
const walletRoutes = require("./wallet")
const walletController = require("../controller/walletController")
const authorization = require("../middlewares/authorization")

router.post("/api/v1/init", walletController.initialize)

router.use("/api/v1/wallet", authorization, walletRoutes)

module.exports = router