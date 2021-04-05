const express = require('express');
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const {tempList_create,Email_contact_list } = require("../controllers/std_temp_list")

router.get('/student_email_temp_list/:userId',verifySchool,Email_contact_list)
router.post('/create_contact_email_list/:userId',verifySchool,tempList_create)

module.exports = router