const express = require("express");
const router = express.Router();

const {recomendStudent, removeFromRecomended} = require("../controllers/recomendedList");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.post("/recomend_students/:userId/", recomendStudent);
router.delete("/recomend_students/remove_student/:userId/:recommendedId", removeFromRecomended);


module.exports = router;
