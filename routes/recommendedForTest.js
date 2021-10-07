const express = require("express");
const router = express.Router();

const {getRecommededForTest,recomendStudent, removeFromRecomended,payAndPromoteTheStudent, listRegisteredForTest} = require("../controllers/recommendedForTest");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/recomend_students/get_by_user_id/:userId/",getRecommededForTest);
router.post("/recomend_students/:userId/", recomendStudent);
router.post("/recomend_students/pay_and_regiter/:userId/", payAndPromoteTheStudent);
router.delete("/recomend_students/remove_student/:userId/:recommendedId", removeFromRecomended);
router.get("/recomend_students/getRegisteredForTest/:userId", listRegisteredForTest)


module.exports = router;
