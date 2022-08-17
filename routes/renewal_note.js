const express = require('express');
const router = express.Router();
const { create, remove, updateNote, expire_ninty_std, expire_thirty_std, expire_sixty_std,frozenmembership,all_data_std } = require("../controllers/renewal_note");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { all_data } = require('../controllers/misucall_notes');

router.post("/renewal/add_note/:userId/:studentId", verifySchool, create);
router.put("/renewal/update_note/:userId/notesId", requireSignin, updateNote)
router.delete("/renewal/delete_note/:userId/:notesId", requireSignin, remove);

router.get("/renewal/frozen_membership/:userId/:page_no/:per_page", verifySchool, frozenmembership)
router.get("/renewal/expire_membership_std_less_thirty/:userId/:page_no/:per_page", verifySchool, expire_thirty_std)
router.get("/renewal/expire_membership_std_less_sixty/:userId/:page_no/:per_page", verifySchool, expire_sixty_std)
router.get("/renewal/expire_membership_std_less_ninty/:userId/:page_no/:per_page", verifySchool, expire_ninty_std)
router.get("/renewal/expire_membership_std_all_data/:userId/:page_no/:per_page/:multiple_data",verifySchool,all_data_std)


module.exports = router;