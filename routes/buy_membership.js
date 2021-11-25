const express = require("express");
const router = express.Router();
const { update,create,members_info,remove,buyMembership,membership_InfoById ,updatePayments} = require("../controllers/buy_membership")
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

// router.post("/membership/buy_membership/:user_id",requireSignin,buy_membership.Create);
// router.get("/membership/list_of_:user_id",requireSignin,buy_membership.read);

router.get("/membership/buy_membership_info_BymemberShipId/:userId/:membershipID",requireSignin ,membership_InfoById)

router.get("/membership/buy_membership_info/:userId/:studentId",requireSignin,members_info)
router.post("/membership/buy_membership/:userId/:studentId",requireSignin,buyMembership);
// router.post("/membership/buy_membership/:userId",requireSignin,buyMembership);
router.put("/membership/update_buy_memberships/:userId/:membershipId/:type",requireSignin,update);
router.delete("/membership/delete_buy_membership/:userId/:membershipId",requireSignin,remove);
router.put("/membership/update_buy_memberships_Payments/:userId/:membershipId/:emiID",requireSignin,updatePayments);


module.exports = router;
