const express = require('express');
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { create,list_std,promote_std,testReg,testReg_list,testStd_remove,testregStd_remove } = require("../controllers/Test")

router.get("/test/student_list/:userId",verifySchool,list_std)
router.post("/test/add_student_list/:userId",verifySchool,create)

router.get("/test/student_list_test_register/:userId",verifySchool,testReg_list)
router.post("/test/student_add_test_register/:userId",verifySchool,testReg)
router.delete("/test/student_remove_test_section/:userId/:stdId",verifySchool,testStd_remove)
router.delete("/test/student_remove_test_register_section/:userId/:stdId",verifySchool,testregStd_remove)

router.put("/test/promote_student/:userId/:stdId/:proId/:nxt_rank_id",verifySchool,promote_std)

module.exports = router