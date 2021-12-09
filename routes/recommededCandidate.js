const express = require("express");
const router = express.Router();

const { getRecommendedCandidateStudents, recomendStudent, promoteTheStudentStripe, removeFromRecomended } = require("../controllers/recommededCandidate");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/recomend_candidate/get_by_user_id/:userId/", requireSignin, getRecommendedCandidateStudents);
router.post("/recomend_candidate/:userId/", requireSignin, recomendStudent);
router.put("/recomend_candidate/promote_stripe/:userId/:recommededCandidateId", requireSignin, promoteTheStudentStripe);
router.delete("/recomend_candidate/remove/:userId/:recommededCandidateId", requireSignin, removeFromRecomended);


module.exports = router;
