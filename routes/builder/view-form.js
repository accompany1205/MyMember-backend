const express = require("express");
const router = express.Router();
const Form = require("../../models/builder/Form.js")
const addmember = require("../../models/addmember.js")
const {viewForm, processForm, viewPaymentStatus, showPaymentError, showPaymentSuccess} = require("../../controllers/builder/view-form")

const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
/*
* /builder/view/:formId
*
*
*/

router.get('/:formId', viewForm)

router.post("/process/newstudent/:formId", processForm)

router.get('/payment-status', viewPaymentStatus)
router.get('/payment-success', showPaymentSuccess)
router.get('/payment-error', showPaymentError)


module.exports = router