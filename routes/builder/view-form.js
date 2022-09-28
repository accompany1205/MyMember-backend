const express = require("express");
const router = express.Router();
const Form = require("../../models/builder/Form.js")
const addmember = require("../../models/addmember.js")
<<<<<<< HEAD
const {viewForm, processForm, viewPaymentStatus, showPaymentError, showPaymentSuccess} = require("../../controllers/builder/view-form")

const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
=======
const {viewForm, processForm} = require("../../controllers/builder/view-form")

const { requireSignin, isAuth, verifySchool } = require("../../controllers/auth");

>>>>>>> 08cd781aa0369ced9d8298a468b869107609a837
/*
* /builder/view/:formId
*
*
*/

router.get('/:formId/:userId', verifySchool, viewForm)

router.post("/process/newstudent/:formId/:userId", verifySchool, processForm)

<<<<<<< HEAD
router.get('/payment-status', requireSignin, viewPaymentStatus)
router.get('/payment-success', requireSignin, showPaymentSuccess)
router.get('/payment-error', requireSignin, showPaymentError)
=======
//router.get('/payment-status', requireSignin, viewPaymentStatus)
//router.get('/payment-success', requireSignin, showPaymentSuccess)
//router.get('/payment-error', requireSignin, showPaymentError)
>>>>>>> 08cd781aa0369ced9d8298a468b869107609a837


module.exports = router