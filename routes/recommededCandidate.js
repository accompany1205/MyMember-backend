const express = require("express");
const router = express.Router();

const { getRecommendedCandidateStudents, recomendStudent, promoteTheStudentStripe, removeFromRecomended, removeAll, getFilteredStudents,candidateJoinNotJoinHistory, searchRecommendedStudentByName,recomendData,dashboardCandidateInfo } = require("../controllers/recommededCandidate");
// const { getRecommendedCandidateStudents, recomendStudent, promoteTheStudentStripe, removeFromRecomended, removeAll, getFilteredStudents,candidateJoinNotJoinHistory,recomendData,dashboardCandidateInfo } = require("../controllers/recommededCandidate");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/recomend_candidate/get_by_user_id/:userId/:page_no/:per_page", requireSignin, getRecommendedCandidateStudents);
router.get("/recomend_candidate/filterByMY/:userId/:dates", requireSignin, getFilteredStudents);
router.post("/recomend_candidate/:userId", requireSignin, recomendStudent);
router.put("/recomend_candidate/promote_stripe/:userId/:recommededCandidateId", requireSignin, promoteTheStudentStripe);
router.delete("/recomend_candidate/remove/:userId/:recommededCandidateId", requireSignin, removeFromRecomended);
router.delete("/recomend_candidate/removeAll/:userId", requireSignin, removeAll);
router.get("/recommended/search", requireSignin, searchRecommendedStudentByName);
router.get("/recomend_candidate/data/:userId",requireSignin,recomendData)
router.get("/dashboard/recomended_candidate/candidate_name/:userId/:candidate/:per_page/:page_no",requireSignin,dashboardCandidateInfo)


module.exports = router;
