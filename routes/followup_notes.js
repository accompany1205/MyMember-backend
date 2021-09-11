const express = require("express");
const router = express.Router();
const { createNote,remove,updateNote,birth_this_week }  = require("../controllers/followup_notes")
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.post("/followup_note/add_note/:userId/:studentId",createNote)


module.exports = router;