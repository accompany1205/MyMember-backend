const express = require("express");
const router = express.Router();
const Form = require("../../models/builder/Form.js")
const addmember = require("../../models/addmember.js")
const {
    viewForm,
    processForm,
    viewPaymentStatus,
    showPaymentError,
    showPaymentSuccess,
    createFunnel,
    getFunnel,
    getSingleFunnel,
    updateFunnel,
    deletedFunnel,
    getArchive,
    getTrashForm,
    getFavorite

} = require("../../controllers/builder/view-form")

const { requireSignin, isAuth, verifySchool } = require("../../controllers/auth");

/*
* /builder/view/:formId
*
*
*/

//funnel
router.post("/funnel/:userId", verifySchool, createFunnel);
router.get("/funnel/:userId/:page_no/:per_page", verifySchool, getFunnel);
router.put("/funnel/:funnelId/:userId", verifySchool, updateFunnel);
router.delete("/funnel/:funnelId/:userId", verifySchool, deletedFunnel);
router.get("/funnel/:funnelId", getSingleFunnel);
router.get("/funnel/archive/:userId/:page_no/:per_page", requireSignin, getArchive);
router.get("/funnel/trash/:userId/:page_no/:per_page", requireSignin, getTrashForm);
router.get("/funnel/favorite/:userId/:page_no/:per_page", requireSignin, getFavorite);

router.get('/:formId/:userId', verifySchool, viewForm);

router.post("/process/newstudent/:formId/:userId", verifySchool, processForm)

//router.get('/payment-status', requireSignin, viewPaymentStatus)
//router.get('/payment-success', requireSignin, showPaymentSuccess)
//router.get('/payment-error', requireSignin, showPaymentError)


module.exports = router