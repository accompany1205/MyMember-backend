const express = require("express");
const router = express.Router();

const { promoteStudentRank, payforPromotedstudens, removeFromRegisterd, mergedDocForTest, deleteAll, multipleDocMerge } = require("../controllers/registeredForTest");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.put("/registered_students/:userId", requireSignin, verifySchool, promoteStudentRank);
router.put("/promoted_students/:userId", requireSignin, verifySchool, payforPromotedstudens);
router.delete("/registered_students/remove_student/:userId/:registeredId", verifySchool, removeFromRegisterd);
router.post("/registered/mergeDocs/:userId/:studentId/:registeredId", requireSignin, verifySchool,mergedDocForTest);
router.post("/registered/mergeDocs/:userId", requireSignin,verifySchool, multipleDocMerge);
router.delete("/registered/removeAll/:userId", requireSignin,verifySchool, deleteAll);



module.exports = router;
