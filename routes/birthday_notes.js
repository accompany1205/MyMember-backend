const express = require("express");
const router = express.Router();
const { create,remove,updateNote,birth_this_week ,seven_to_forteen,fifteen_to_thirty,moreThirty}  = require("../controllers/birthday_notes")
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.get("/birthday/seven_to_fourteen/:userId", verifySchool, seven_to_forteen)
router.get("/birthday/fifteen_to_thirty/:userId", verifySchool, fifteen_to_thirty)
router.get("/birthday/more_than_thirty/:userId", verifySchool, moreThirty)

router.post("/birthday/add_note/:userId/:studentId",verifySchool,create)
router.put("/birthday/update_note/:userId/:notesId",requireSignin,updateNote)
router.delete("/birthday/delete_note/:userId/:notesId",requireSignin,remove)

router.get('/birthday/this_week_birth/:userId', birth_this_week)

module.exports = router;