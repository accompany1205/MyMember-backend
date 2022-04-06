const express = require("express");
const router = express.Router();

const { getRecommededForTest, getPromoted, recomendStudent, removeFromRecomended, payAndPromoteTheStudent, getRegisteredForTest, deleteAll, multipleDocMerge, registerdStudent } = require("../controllers/recommendedForTest");
const { mergedDocForTest } = require("../controllers/registeredForTest");

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/recomend_students/get_by_user_id/:userId", requireSignin, getRecommededForTest);//1st

router.get("/recomend_students/getRegisteredForTest/:userId", requireSignin, getRegisteredForTest)//2nd

router.get("/recomend_students/getPromoted/:userId", requireSignin, getPromoted)//2nd

router.post("/recomend_students/:userId", requireSignin, recomendStudent);
router.post("/recomend_students/pay_and_regiter/:userId", requireSignin, payAndPromoteTheStudent);
router.post("/recomend_students/regiter/:userId", requireSignin, registerdStudent);
router.delete("/recomend_students/remove_student/:userId/:recommendedId", requireSignin, removeFromRecomended);
router.delete("/recommend/removeAll/:userId", requireSignin, deleteAll);
router.post("/recommended/mergeDocs/:userId/:studentId/:recommendedId", requireSignin, mergedDocForTest);
router.post("/recommended/mergeDocs/:userId", requireSignin, multipleDocMerge);




module.exports = router;
