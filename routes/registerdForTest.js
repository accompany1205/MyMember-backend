const express = require("express");
const router = express.Router();

const { promoteStudentRank, payforPromotedstudens, removeFromRegisterd, mergedDocForTest, deleteAll, multipleDocMerge } = require("../controllers/registeredForTest");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.put("/registered_students/:userId", requireSignin, promoteStudentRank);
router.put("/promoted_students/:userId", requireSignin, payforPromotedstudens);
router.delete("/registered_students/remove_student/:userId/:registeredId", requireSignin, removeFromRegisterd);
router.post("/registered/mergeDocs/:userId/:studentId/:registeredId", requireSignin, mergedDocForTest);
router.post("/registered/mergeDocs/:userId", requireSignin, multipleDocMerge);
router.delete("/registered/removeAll/:userId", requireSignin, deleteAll);



module.exports = router;
