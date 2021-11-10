const express = require("express");
const router = express.Router();
const { create_candidate,
        candidate_List,
        create_candidateStripe,
        promote_stripe,
        delete_candidate,
        candidate_Stripe,
        delete_candidate_stripe,
        cadidate_stripe_update,
        count_stripe,
        stripe_report,
        join_notjoin
     } = require("../controllers/candidates");
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.post("/candidates/stripe_full_report/:userId",verifySchool,stripe_report)
router.get("/candidates/count_each_stripe/:userId",verifySchool,count_stripe)

router.get("/candidates/list_candidiate/:userId",verifySchool,candidate_List);
router.get("/candidates/list_cadidate_stripe/:userId",verifySchool,candidate_Stripe)

router.post("/candidates/create_candidate/:userId",verifySchool,create_candidate);
router.put("/candidates/candidate_stripe/:userId/:candidateId",verifySchool,create_candidateStripe);
router.put("/candidates/candidate_promote/:userId/:candidateId",verifySchool,promote_stripe)
router.put('/candidates/candidate_stripe_detail_update/:userId/:candidateId',verifySchool,cadidate_stripe_update)
router.put('/candidates/candidate_stripe_join_not_join/:userId/:candidateId',join_notjoin)
router.delete("/candidates/candidate_delete/:userId/:candidateId",verifySchool,delete_candidate) //candidate remove in candidate tab and and stripe tab both
router.delete("/candidates/cadidate_delete_stripe/:userId/:candidateId",verifySchool,delete_candidate_stripe)

module.exports = router;