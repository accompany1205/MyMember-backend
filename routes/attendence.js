const express = require("express");
const router = express.Router();
const { create, remove, list_attendence, search_std, getStudentAttendence, update } = require("../controllers/attendence")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get("/attendence/attendence_list/:userId/:page_no", list_attendence)
router.get("/attendence/get_student_attendence/:userId/:studentId/:page_no", getStudentAttendence)
router.post("/attendence/search_student/:userId", search_std)
router.post("/attendence/create_attendence/:userId/:scheduleId/:studentId", verifySchool, create)
router.put("/attendence/update_attendence/:userId/:scheduleId/:studentId", verifySchool, update)

router.delete("/attendence/remove_attendence/:userId/:scheduleId/:studentId", requireSignin, remove)


module.exports = router;