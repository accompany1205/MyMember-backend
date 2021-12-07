
const express = require("express");
const router = express.Router();
const { create, remove, updateNote, seven_to_forteen, fifteen_to_thirty, Thirty_to_sixty, more_than_sixty, listApp_and_callHistory, more_than_forteen } = require("../controllers/misucall_notes");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get("/missyouCall/seven_to_fourteen_miss/:userId/:page_no/:per_page", verifySchool, seven_to_forteen)
router.get("/missyouCall/fifteen_to_thirty_miss/:userId/:page_no/:per_page", verifySchool, fifteen_to_thirty)
router.get("/missyouCall/thirty_to_sixty/:userId/:page_no/:per_page", verifySchool, Thirty_to_sixty)
router.get("/missyouCall/more_than_sixty/:userId/:page_no/:per_page", verifySchool, more_than_sixty)
// for dashboard
router.get("/missYouCall/more_than_forteen/:userId/:page_no/:per_page", verifySchool, more_than_forteen)

router.get("/missyouCall/list_appoinment_and_call_history/:userId", verifySchool, listApp_and_callHistory)
router.post("/missYouCall/add_note/:userId/:studentId", verifySchool, create);
router.put("/missYouCall/update_note/:userId/notesId", requireSignin, updateNote)
router.delete("/missYouCall/delete_note/:userId/:notesId", requireSignin, remove);

module.exports = router;