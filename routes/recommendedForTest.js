const express = require("express");
const router = express.Router();

const { getRecommededForTest, recomendStudent, removeFromRecomended, payAndPromoteTheStudent, getRegisteredForTest, deleteAll } = require("../controllers/recommendedForTest");
const { mergedDocForTest } = require("../controllers/registeredForTest");

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/recomend_students/get_by_user_id/:userId/:page_no/:per_page", requireSignin, getRecommededForTest);
router.get("/recomend_students/getRegisteredForTest/:userId/:page_no/:per_page", requireSignin, getRegisteredForTest)
router.post("/recomend_students/:userId", requireSignin, recomendStudent);
router.post("/recomend_students/pay_and_regiter/:userId", requireSignin, payAndPromoteTheStudent);
router.delete("/recomend_students/remove_student/:userId/:recommendedId", requireSignin, removeFromRecomended);
router.delete("/recommend/removeAll/:userId", requireSignin, deleteAll);
router.post("/recommended/mergeDocs/:userId/:studentId/:recommendedId", requireSignin, mergedDocForTest);



module.exports = router;
