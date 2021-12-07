const express = require("express");
const router = express.Router();

const {getRecommendedCandidateStudents,recomendStudent,promoteTheStudentStripe,removeFromRecomended} = require("../controllers/recommededCandidate");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/recomend_candidate/get_by_user_id/:userId/",getRecommendedCandidateStudents);
router.post("/recomend_candidate/:userId/",recomendStudent);
router.put("/recomend_candidate/prote_stripe/:userId/:recommededCandidateId",promoteTheStudentStripe);
router.delete("/recomend_candidate/remove/:userId/:recommededCandidateId",removeFromRecomended);


module.exports = router;
