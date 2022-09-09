const express = require("express");
const router = express.Router();

const { getRecommendedCandidateStudents, recomendStudent, promoteTheStudentStripe, removeFromRecomended, removeAll, getFilteredStudents,candidateJoinNotJoinHistory,recomendData } = require("../controllers/recommededCandidate");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/recomend_candidate/get_by_user_id/:userId/:page_no/:per_page", requireSignin, getRecommendedCandidateStudents);
router.get("/recomend_candidate/filterByMY/:userId/:dates", requireSignin, getFilteredStudents);
router.post("/recomend_candidate/:userId", requireSignin, recomendStudent);
router.put("/recomend_candidate/promote_stripe/:userId/:recommededCandidateId", requireSignin, promoteTheStudentStripe);
router.delete("/recomend_candidate/remove/:userId/:recommededCandidateId", requireSignin, removeFromRecomended);
router.delete("/recomend_candidate/removeAll/:userId", requireSignin, removeAll);
router.get("/recomend_candidate/data/:userId",requireSignin,recomendData)


module.exports = router;
