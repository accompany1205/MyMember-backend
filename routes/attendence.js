const express = require("express");
const router = express.Router();
const { create, remove, list_attendence, search_std, getStudentAttendence } = require("../controllers/attendence")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.post("/attendence/search_student/:userId", search_std)
router.get("/attendence/attendence_list/:userId", verifySchool, list_attendence)
router.post("/attendence/create_attendence/:userId/:scheduleId/:studentId", verifySchool, create)
router.delete("/attendence/remove_attendence/:userId/:attendenceId", requireSignin, remove)

router.get("/attendence/get_student_attendence/:userId/:studentId", getStudentAttendence)

module.exports = router;