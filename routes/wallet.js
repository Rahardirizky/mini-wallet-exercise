const router = require("express").Router()
const walletController = require("../controller/walletController")

router.post("/", walletController.enable)
router.get("/", walletController.get)
router.post("/deposits", walletController.deposits)
router.post("/withdrawals", walletController.withdraw)
router.patch("/", walletController.disable)

module.exports = router