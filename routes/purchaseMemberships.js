const express = require("express");
const router = express.Router();
const { buyMembership } = require("../controllers/purchaseMemberships")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.post('/purchaseMembership/:userId/:memberId', buyMembership)


module.exports = router;