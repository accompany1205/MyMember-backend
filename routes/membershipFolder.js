const express = require("express");
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const {} = require("../controllers/membershipFolder")


module.exports = router;
