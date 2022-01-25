const express = require("express");
const router = express.Router();

const {promoteStudentRank,removeFromRegisterd, mergedDocForTest} = require("../controllers/registeredForTest");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.put("/registered_students/:userId", requireSignin, promoteStudentRank);
router.delete("/registered_students/remove_student/:userId/:registeredId", requireSignin, removeFromRegisterd);
router.post("/registered/mergeDocs/:userId/:studentId",requireSignin, mergedDocForTest);


module.exports = router;
