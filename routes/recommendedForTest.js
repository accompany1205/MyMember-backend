const express = require("express");
const router = express.Router();

const {getRecommededForTest,recomendStudent, removeFromRecomended,payAndPromoteTheStudent, getRegisteredForTest} = require("../controllers/recommendedForTest");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/recomend_students/get_by_user_id/:userId/",getRecommededForTest);
router.get("/recomend_students/getRegisteredForTest/:userId/", getRegisteredForTest)
router.post("/recomend_students/:userId/", recomendStudent);
router.post("/recomend_students/pay_and_regiter/:userId/", payAndPromoteTheStudent);
router.delete("/recomend_students/remove_student/:userId/:recommendedId", removeFromRecomended);



module.exports = router;
