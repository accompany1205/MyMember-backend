const express = require("express");
const router = express.Router();

const { getRecommededForTest, recomendStudent, removeFromRecomended, payAndPromoteTheStudent, getRegisteredForTest, deleteAll, multipleDocMerge } = require("../controllers/recommendedForTest");
const { mergedDocForTest } = require("../controllers/registeredForTest");

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/recomend_students/get_by_user_id/:userId", requireSignin, getRecommededForTest);
router.get("/recomend_students/getRegisteredForTest/:userId", requireSignin, getRegisteredForTest)
router.post("/recomend_students/:userId", requireSignin, recomendStudent);
router.post("/recomend_students/pay_and_regiter/:userId", requireSignin, payAndPromoteTheStudent);
router.delete("/recomend_students/remove_student/:userId/:recommendedId", requireSignin, removeFromRecomended);
router.delete("/recommend/removeAll/:userId", requireSignin, deleteAll);
router.post("/recommended/mergeDocs/:userId/:studentId/:recommendedId", requireSignin, mergedDocForTest);
router.post("/recommended/mergeDocs/:userId",requireSignin, multipleDocMerge);




module.exports = router;
