const express = require("express");
const router = express.Router();
const { createNote,getNotesByUserId,getNotesByMemberId,updateNote,removeNote,filterByNotes}  = require("../controllers/followup_notes")
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
//filter followup_note
router.get("/followup_note/:NoteType/:filterBy/:userId/:page_no/:per_page",filterByNotes);

router.post("/followup_note/add_note/:userId/:memberId",createNote)
router.get("/followup_note/get_notes_by_user_id/:userId/",getNotesByUserId);
router.get("/followup_note/get_notes_by_member_id/:userId/:memberId/",getNotesByMemberId);
router.put("/followup_note/update_note/:userId/:noteId/",updateNote);
router.delete("/followup_note/remove_note/:userId/:noteId/",removeNote);

module.exports = router;