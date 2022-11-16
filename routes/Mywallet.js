const express = require('express');
const router = express.Router();
const { depositAmount, withdrawAmount, balanceInfo, withdrawAmountForBuyingNumber ,getbalanceInfo } = require('../controllers/Mywallet')

router.post("/depositAmount", depositAmount)
router.post("/withdrawAmount", withdrawAmount)
router.post("/balanceInfo", balanceInfo)
router.get("/getbalanceInfo/:user_id", getbalanceInfo)

router.post("/withdrawAmountForBuyingNumber", withdrawAmountForBuyingNumber)


//  router.post("/myGroup/add_member/:user_id/:student_id/:member_id",create);
// router.delete("/myGroup/delete_member/:user_id/:member_id",remove);

module.exports = router