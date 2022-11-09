const express = require("express");
const router = express.Router();

const {
  update,
  create,
  members_info,
  remove,
  buyMembership,
  buyMembershipStripe,
  membership_InfoById,
  updatePayments,
  lastestMembership,
  expiredMembership,
  thismonthMembership,
  addSubscription,
  getMergeDoc,
  checkData,
  chargeEmiWithStripe,
} = require("../controllers/buy_membership");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

// router.post("/membership/buy_membership/:user_id",requireSignin,buy_membership.Create);
// router.get("/membership/list_of_:user_id",requireSignin,buy_membership.read);
//for dashboard

router.get(
  "/member/expired_thisMonth_Membership/:userId/:page_no/:per_page",
  verifySchool,
  thismonthMembership
);
router.get(
  "/member/expired_Membership/:userId/:page_no/:per_page",
  verifySchool,
  expiredMembership
);
router.get(
  "/membership/buy_membership_info_BymemberShipId/:userId/:membershipID",
  requireSignin,
  verifySchool,
  membership_InfoById
);
router.get(
  "/membership/buy_membership_info/:userId/:studentId",
  requireSignin,
  members_info
);
router.post(
  "/membership/buy_membership/:userId/:studentId",
  requireSignin,
  verifySchool,
  buyMembership
);
router.post(
  "/membership/buy_membership_stripe/:userId/:studentId",
  buyMembershipStripe
);
// router.post("/membership/buy_membership/:userId",requireSignin,buyMembership);
router.put(
  "/membership/update_buy_memberships/:userId/:membershipId/:type",
  requireSignin,
  verifySchool,
  update
);
router.delete(
  "/membership/delete_buy_membership/:userId/:membershipId",
  requireSignin,
  verifySchool,
  remove
);
router.put(
  "/membership/update_buy_memberships_Payments/:userId/:membershipId/:emiID",
  requireSignin,
  verifySchool,
  updatePayments
);
router.get(
  "/membership/getMrgeDoc/:userId/:buyMembershipId",
  requireSignin,
  verifySchool,
  getMergeDoc
);
router.get("/membership/getMrgeDoc/:userId", checkData);

module.exports = router;
