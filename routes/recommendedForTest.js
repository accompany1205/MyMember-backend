const express = require("express");
const router = express.Router();

const { getRecommededForTest, getPromoted, recomendStudent, removeFromRecomended, removeFromRegister, payAndPromoteTheStudent, getRegisteredForTest, deleteAll, deleteAll_for_register, multipleDocMerge, registerdStudent } = require("../controllers/recommendedForTest");
const { mergedDocForTest } = require("../controllers/registeredForTest");

const { requireSignin, isAuth, isAdmin, verifySchool } = require("../controllers/auth");

router.get("/recomend_students/get_by_user_id/:userId", requireSignin, verifySchool, getRecommededForTest);//1st
router.get("/recomend_students/getRegisteredForTest/:userId", requireSignin, verifySchool, getRegisteredForTest)//2nd
router.get("/recomend_students/getPromoted/:userId", requireSignin, verifySchool, getPromoted)//2nd

router.post("/recomend_students/:userId", requireSignin, verifySchool, recomendStudent);
router.post("/recomend_students/pay_and_regiter/:userId", requireSignin, verifySchool, payAndPromoteTheStudent);
router.post("/recomend_students/regiter/:userId", requireSignin, verifySchool, registerdStudent);

router.delete("/recomend_students/remove_student/:userId/:recommendedId", requireSignin, verifySchool, removeFromRecomended);
router.delete("/regesterd_students/remove_student/:userId/:regesterId", requireSignin, verifySchool, removeFromRegister);
router.delete("/recommend/removeAll/:userId", requireSignin, verifySchool, deleteAll);
router.delete("/registerd/removeAll/:userId", requireSignin, verifySchool, deleteAll_for_register);

//for mergeDocs
router.post("/recommended/mergeDocs/:userId/:studentId/:recommendedId", requireSignin, verifySchool, mergedDocForTest);
router.post("/recommended/mergeDocs/:userId", requireSignin, verifySchool, multipleDocMerge);




module.exports = router;
