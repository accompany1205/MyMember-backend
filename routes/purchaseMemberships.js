const express = require("express");
const router = express.Router();
const { buyMembership ,updatepurchaseMembership,getpurchaseMembership} = require("../controllers/purchaseMemberships")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get('/getpurchaseMembershipByID/:userId/:memberId', getpurchaseMembership)
router.post('/purchaseMembership/:userId/:memberId', buyMembership)
router.put('/UpdatepurchaseMembership/:userId/:membershipId', updatepurchaseMembership)



module.exports = router;