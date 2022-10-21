const express = require('express');
const router = express.Router();
const {createBuyHistory , getBuyHistory}  = require('../controllers/BuyingHistory')

router.post("/BuyingHistory", createBuyHistory)

router.get("/BuyHistory",getBuyHistory)

module.exports = router;