const express = require("express");
const router = express.Router();
const upload = require("../handler/multer");

const {
  candidate_read,
  candidate_create,
  candidate_update,
  candidate_detail,
  candidate_remove,
  getStripeReportByCandidate,
  promote_stripe,
  stripe_report,
  join_notjoin,
  candidate_stripe_filter
} = require("../controllers/candidate");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get(
  "/candidates/get-stripe-report-by-candidate/:userId",
  requireSignin,
  verifySchool,
  getStripeReportByCandidate
);


router.get('/candidates/get-stripe-filter-by-month-year/:userId',verifySchool,candidate_stripe_filter)


router.post(
  "/candidates/stripe_full_report/:userId",
  verifySchool,
  stripe_report
);
router.put(
  "/candidates/candidate_promote/:userId/:candidateId",
  verifySchool,
  promote_stripe
);
router.put(
  "/candidates/candidate_stripe_join_not_join/:userId/:candidateId",
  join_notjoin
);

router.get("/list_of_candidate/:userId", verifySchool, candidate_read);
router.get(
  "/candidate_info/:userId/:candidateId",
  verifySchool,
  candidate_detail
);
router.post(
  "/add_candidate/:userId",
  verifySchool,
  upload.single("candidate_image"),
  candidate_create
);
router.put(
  "/update_candidate/:userId/:candidateId",
  verifySchool,
  upload.single("candidate_image"),
  candidate_update
);
router.delete(
  "/delete_candidate/:userId/:candidateId",
  verifySchool,
  candidate_remove
);

module.exports = router;
