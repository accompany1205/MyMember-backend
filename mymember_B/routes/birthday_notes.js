const express = require("express");
const router = express.Router();
const { create,remove,updateNote,birth_this_week }  = require("../controllers/birthday_notes")
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.post("/birthday/add_note/:userId/:studentId",verifySchool,create)
router.put("/birthday/update_note/:userId/:notesId",requireSignin,updateNote)
router.delete("/birthday/delete_note/:userId/:notesId",requireSignin,remove)

router.get('/birthday/this_week_birth/:userId', birth_this_week)

module.exports = router;