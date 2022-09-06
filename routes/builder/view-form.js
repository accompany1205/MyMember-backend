const express = require("express");
const router = express.Router();
const Form = require("../../models/builder/Form.js")
const addmember = require("../../models/addmember.js")
const {viewForm, processForm} = require("../../controllers/builder/view-form")

const { requireSignin, isAuth, verifySchool } = require("../../controllers/auth");

/*
* /builder/view/:formId
*
*
*/

router.get('/:formId/:userId', verifySchool, viewForm)

router.post("/process/newstudent/:formId/:userId", verifySchool, processForm)

//router.get('/payment-status', requireSignin, viewPaymentStatus)
//router.get('/payment-success', requireSignin, showPaymentSuccess)
//router.get('/payment-error', requireSignin, showPaymentError)


module.exports = router