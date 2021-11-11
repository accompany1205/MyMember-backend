const express = require("express");
const router = express.Router();

const {promoteStudentRank,removeFromRegisterd} = require("../controllers/registeredForTest");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.put("/registered_students/:userId", promoteStudentRank);
router.delete("/registered_students/remove_student/:userId/:registeredId", removeFromRegisterd);


module.exports = router;
